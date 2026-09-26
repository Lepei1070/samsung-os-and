import exifr from 'exifr';
import { GpsCoordinates, ParsedExifResult, SamsungSpecialData } from '../types/exif';
import { decimalToDms } from './geoUtils';
import { extractGpsWithTrace } from './pureBinaryExif';

/**
 * Converts DMS formats (array of numbers, rationals, or strings) to decimal degrees
 */
function convertDmsToDecimal(val: any, ref?: string): number | undefined {
  if (typeof val === 'number') {
    let d = val;
    if (ref === 'S' || ref === 'W') d = -Math.abs(d);
    return d;
  }

  // If array [degrees, minutes, seconds]
  if (Array.isArray(val) && val.length >= 2) {
    const parsePart = (p: any): number => {
      if (typeof p === 'number') return p;
      if (typeof p === 'object' && p !== null && 'numerator' in p && 'denominator' in p) {
        return p.denominator ? p.numerator / p.denominator : 0;
      }
      return parseFloat(String(p)) || 0;
    };

    const deg = parsePart(val[0]);
    const min = parsePart(val[1]);
    const sec = val.length >= 3 ? parsePart(val[2]) : 0;

    let d = deg + min / 60 + sec / 3600;
    if (ref === 'S' || ref === 'W') d = -Math.abs(d);
    return d;
  }

  // If string like "48,51.84N" (common in XMP)
  if (typeof val === 'string') {
    const xmpMatch = val.match(/([0-9.]+)[,\s]+([0-9.]+)([NSEW]?)/i);
    if (xmpMatch) {
      const deg = parseFloat(xmpMatch[1]);
      const min = parseFloat(xmpMatch[2]);
      const dRef = xmpMatch[3] || ref;
      let d = deg + min / 60;
      if (dRef?.toUpperCase() === 'S' || dRef?.toUpperCase() === 'W') d = -Math.abs(d);
      return d;
    }

    const simpleNum = parseFloat(val);
    if (!isNaN(simpleNum)) {
      let d = simpleNum;
      if (ref === 'S' || ref === 'W') d = -Math.abs(d);
      return d;
    }
  }

  return undefined;
}

/**
 * Scans the raw binary buffer of a JPEG/HEIC file to detect Samsung Trailer (SEF)
 * and embedded Motion Photo tags that standard EXIF readers often miss.
 */
function scanSamsungTrailerAndSef(buffer: ArrayBuffer): {
  hasSef: boolean;
  markers: string[];
  motionPhotoOffset?: number;
  motionPhotoSize?: number;
} {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  const markers: string[] = [];
  let motionPhotoOffset: number | undefined;
  let motionPhotoSize: number | undefined;
  let hasSef = false;

  if (len < 12) {
    return { hasSef, markers };
  }

  // Check last 256 bytes for "SEFT" signature
  const searchEnd = Math.max(0, len - 256);
  const textDecoder = new TextDecoder('latin1');
  const tailString = textDecoder.decode(bytes.slice(searchEnd));

  if (tailString.includes('SEFT') || tailString.includes('SEFV')) {
    hasSef = true;
    markers.push('Samsung Embedded Format (SEF) Trailer détecté');
  }

  // Search for common Samsung SEF sub-blocks and markers in the last 256KB of the file
  const searchWindow = Math.max(0, len - 262144);
  const subChunk = textDecoder.decode(bytes.slice(searchWindow));

  const knownSefTags = [
    { key: 'MotionPhoto_Data', label: 'Motion Photo Samsung (Vidéo intégrée)' },
    { key: 'DualShot_DepthMap', label: 'Carte de profondeur Mode Portrait (DualShot)' },
    { key: 'SoundAndShot_Audio', label: 'Audio Sound & Shot' },
    { key: 'SingleTake_Data', label: 'Données Single Take IA' },
    { key: 'SuperSlowMotion_Data', label: 'Données Super Ralenti 960fps' },
    { key: 'CameraCapture_Information', label: 'Paramètres capteur Samsung ISOCELL' },
    { key: 'MCC_Data', label: 'Données de calibration couleurs Samsung' },
    { key: 'Samsung_Object_Removal_Info', label: 'Masque Effaceur d\'objets IA' },
    { key: 'GCamera:MotionPhoto', label: 'XMP MicroVideo / MotionPhoto' },
  ];

  for (const tag of knownSefTags) {
    if (subChunk.includes(tag.key)) {
      if (!markers.includes(tag.label)) {
        markers.push(tag.label);
      }
      if (tag.key === 'MotionPhoto_Data' || tag.key === 'GCamera:MotionPhoto') {
        hasSef = true;
      }
    }
  }

  // Check for embedded MP4 video signature (ftypmp42 / ftypisom)
  const mp4Index = subChunk.lastIndexOf('ftyp');
  if (mp4Index !== -1) {
    motionPhotoOffset = searchWindow + mp4Index - 4;
    motionPhotoSize = len - motionPhotoOffset;
    if (!markers.includes('Flux vidéo MP4 Motion Photo détecté')) {
      markers.push('Flux vidéo MP4 Motion Photo détecté');
    }
  }

  return {
    hasSef,
    markers,
    motionPhotoOffset,
    motionPhotoSize,
  };
}

/**
 * Scans the binary buffer deeply for ISO 6709 coordinates (e.g. from MP4 udta ©xyz atom,
 * XMP text fragments, or Samsung SEF Location_Data)
 */
function scanBinaryForIsoGps(buffer: ArrayBuffer): {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  source?: string;
} {
  try {
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    const textDecoder = new TextDecoder('latin1');

    // 1. Scan the tail (MP4 trailer of Motion Photo or SEF block)
    const tailStart = Math.max(0, len - 524288); // last 512KB
    const tailStr = textDecoder.decode(bytes.slice(tailStart));

    // Look for ©xyz or \xa9xyz atom (standard ISO 6709 in MP4 container)
    const xyzIdx = tailStr.indexOf('xyz');
    if (xyzIdx !== -1) {
      const fragment = tailStr.slice(Math.max(0, xyzIdx - 10), Math.min(tailStr.length, xyzIdx + 60));
      // ISO 6709 pattern: +48.8584+002.2945/ or +48.8584+002.2945+043.50/
      const match = fragment.match(/([+-][0-9]{2,3}\.[0-9]{3,8})([+-][0-9]{2,3}\.[0-9]{3,8})([+-][0-9.]+)?\//);
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        const alt = match[3] ? parseFloat(match[3]) : undefined;
        if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
          return {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            source: 'Atome vidéo ISO 6709 (©xyz) Motion Photo Samsung',
          };
        }
      }
    }

    // 2. Scan the head (first 256KB for XMP or IFD anomalies)
    const headLen = Math.min(len, 262144);
    const headStr = textDecoder.decode(bytes.slice(0, headLen));

    // Check for XMP tags like <exif:GPSLatitude>48,51.84N</exif:GPSLatitude>
    const xmpLatMatch = headStr.match(/<exif:GPSLatitude>([^<]+)<\/exif:GPSLatitude>/i) ||
                        headStr.match(/exif:GPSLatitude="([^"]+)"/i);
    const xmpLonMatch = headStr.match(/<exif:GPSLongitude>([^<]+)<\/exif:GPSLongitude>/i) ||
                        headStr.match(/exif:GPSLongitude="([^"]+)"/i);

    if (xmpLatMatch && xmpLonMatch) {
      const lat = convertDmsToDecimal(xmpLatMatch[1]);
      const lon = convertDmsToDecimal(xmpLonMatch[1]);
      if (lat !== undefined && lon !== undefined && (lat !== 0 || lon !== 0)) {
        return {
          latitude: lat,
          longitude: lon,
          source: 'Bloc XMP natif (<exif:GPSLatitude>)',
        };
      }
    }

    // 3. Scan for generic ISO 6709 string across tail
    const genericIsoMatch = tailStr.match(/([+-][0-9]{2}\.[0-9]{4,8})([+-][0-9]{2,3}\.[0-9]{4,8})/);
    if (genericIsoMatch) {
      const lat = parseFloat(genericIsoMatch[1]);
      const lon = parseFloat(genericIsoMatch[2]);
      if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat !== 0 || lon !== 0)) {
        return {
          latitude: lat,
          longitude: lon,
          source: 'Signature binaire ISO 6709 détectée',
        };
      }
    }
  } catch (err) {
    console.warn('scanBinaryForIsoGps note:', err);
  }

  return {};
}

export async function parsePhotoFile(file: File): Promise<ParsedExifResult> {
  const arrayBuffer = await file.arrayBuffer();
  const scanLog: string[] = [];

  // Deep parsing options for exifr
  const options = {
    gps: true,
    tiff: true,
    xmp: true,
    icc: true,
    iptc: true,
    jfif: true,
    makerNote: true,
    userComment: true,
    mergeOutput: false,
    sanitize: false,
    revivers: true,
    translateKeys: true,
    translateValues: true,
  };

  let parsedRaw: any = {};
  let gpsParsed: any = null;

  try {
    parsedRaw = (await exifr.parse(arrayBuffer, options)) || {};
    scanLog.push('Parsing IFD0, EXIF, XMP et MakerNotes effectué avec succès.');
  } catch (err) {
    scanLog.push(`Tentative primaire exifr : ${err}`);
    try {
      parsedRaw = (await exifr.parse(arrayBuffer, { tiff: true, xmp: true })) || {};
      scanLog.push('Parsing de secours TIFF/XMP réussi.');
    } catch (e2) {
      scanLog.push('Échec du parsing TIFF/XMP.');
      parsedRaw = {};
    }
  }

  try {
    gpsParsed = await exifr.gps(arrayBuffer);
    if (gpsParsed) {
      scanLog.push(`exifr.gps() a trouvé : Lat=${gpsParsed.latitude}, Lon=${gpsParsed.longitude}`);
    } else {
      scanLog.push('exifr.gps() : aucune coordonnée standard détectée.');
    }
  } catch (gpsErr) {
    scanLog.push(`Erreur exifr.gps() : ${gpsErr}`);
  }

  const tiff = parsedRaw.ifd0 || parsedRaw.image || parsedRaw;
  const exif = parsedRaw.exif || parsedRaw;
  const gpsBlock = parsedRaw.gps || {};
  const xmp = parsedRaw.xmp || {};

  // Find camera make & model
  const make = (tiff.Make || exif.Make || '').toString().trim();
  const model = (tiff.Model || exif.Model || '').toString().trim();
  const software = (tiff.Software || exif.Software || '').toString().trim();

  // Scan Samsung binary trailer
  const sefResult = scanSamsungTrailerAndSef(arrayBuffer);
  if (sefResult.hasSef) {
    scanLog.push(`Structure SEF Samsung détectée avec ${sefResult.markers.length} bloc(s).`);
  }

  const isSamsung =
    make.toLowerCase().includes('samsung') ||
    model.toLowerCase().includes('sm-s') ||
    model.toLowerCase().includes('sm-g') ||
    model.toLowerCase().includes('samsung') ||
    software.toLowerCase().includes('samsung') ||
    software.toLowerCase().includes('s91') ||
    sefResult.hasSef;

  // Extract GPS coordinates through multiple deep levels:
  let finalLat: number | undefined;
  let finalLon: number | undefined;
  let finalAlt: number | undefined;
  let detectionSource = 'EXIF Standard';
  let nullIslandWarning = false;

  // Level 0: Pure binary parser (ExifTool algorithm: TIFF Tag 0x8825 & MP4 ©xyz)
  const { result: binaryGps, trace } = extractGpsWithTrace(arrayBuffer);
  scanLog.push(...trace);
  if (binaryGps) {
    finalLat = binaryGps.latitude;
    finalLon = binaryGps.longitude;
    finalAlt = binaryGps.altitude;
    detectionSource = binaryGps.source;
    scanLog.push(`Niveau 0 (ExifTool binaire) : ${binaryGps.source} -> Lat=${finalLat.toFixed(6)}, Lon=${finalLon.toFixed(6)}`);
  }

  // Level 1: exifr.gps()
  if (finalLat === undefined || finalLon === undefined) {
    if (typeof gpsParsed?.latitude === 'number' && typeof gpsParsed?.longitude === 'number') {
      finalLat = gpsParsed.latitude;
      finalLon = gpsParsed.longitude;
      detectionSource = 'Balise EXIF GPS standard (0x8825)';
      scanLog.push('Niveau 1 : Coordonnées validées via balises EXIF standard.');
    }
  }

  // Level 2: GPS block rational arrays (e.g. [deg, min, sec])
  if (finalLat === undefined || finalLon === undefined) {
    const rawLat = gpsBlock.GPSLatitude ?? parsedRaw.GPSLatitude;
    const rawLon = gpsBlock.GPSLongitude ?? parsedRaw.GPSLongitude;
    const latRef = gpsBlock.GPSLatitudeRef ?? parsedRaw.GPSLatitudeRef;
    const lonRef = gpsBlock.GPSLongitudeRef ?? parsedRaw.GPSLongitudeRef;

    const convLat = convertDmsToDecimal(rawLat, latRef);
    const convLon = convertDmsToDecimal(rawLon, lonRef);

    if (convLat !== undefined && convLon !== undefined) {
      finalLat = convLat;
      finalLon = convLon;
      detectionSource = 'Tableaux de fractions rationnelles EXIF GPS';
      scanLog.push('Niveau 2 : Coordonnées récupérées via conversion des fractions rationnelles IFD.');
    }
  }

  // Level 3: XMP block
  if (finalLat === undefined || finalLon === undefined) {
    const xmpLat = xmp.GPSLatitude ?? xmp['exif:GPSLatitude'] ?? xmp.latitude;
    const xmpLon = xmp.GPSLongitude ?? xmp['exif:GPSLongitude'] ?? xmp.longitude;
    const convLat = convertDmsToDecimal(xmpLat);
    const convLon = convertDmsToDecimal(xmpLon);

    if (convLat !== undefined && convLon !== undefined) {
      finalLat = convLat;
      finalLon = convLon;
      detectionSource = 'Espace de noms XMP Camera / Samsung';
      scanLog.push('Niveau 3 : Coordonnées extraites de l\'arborescence XML XMP.');
    }
  }

  // Level 4: Deep Binary ISO 6709 scan (MP4 Motion Photo trailer atom ©xyz / SEF)
  if (finalLat === undefined || finalLon === undefined) {
    scanLog.push('Niveau 4 : Lancement du scan binaire profond ISO 6709 (Motion Photo, SEF, atomes MP4)...');
    const binGps = scanBinaryForIsoGps(arrayBuffer);
    if (binGps.latitude !== undefined && binGps.longitude !== undefined) {
      finalLat = binGps.latitude;
      finalLon = binGps.longitude;
      if (binGps.altitude !== undefined) finalAlt = binGps.altitude;
      detectionSource = binGps.source || 'Atome binaire ISO 6709 Motion Photo';
      scanLog.push(`Niveau 4 SUCCÈS : ${detectionSource} (Lat: ${finalLat}, Lon: ${finalLon})`);
    } else {
      scanLog.push('Niveau 4 : Aucun atome binaire ISO 6709 localisé dans le conteneur.');
    }
  }

  // Check for Null Island (0, 0)
  if (finalLat !== undefined && finalLon !== undefined) {
    if (Math.abs(finalLat) < 0.0001 && Math.abs(finalLon) < 0.0001) {
      nullIslandWarning = true;
      scanLog.push('Avertissement : Coordonnées [0.0, 0.0] détectées (signal satellite non verrouillé à la prise de vue).');
    }
  }

  let gps: GpsCoordinates | undefined;

  if (typeof finalLat === 'number' && typeof finalLon === 'number' && !isNaN(finalLat) && !isNaN(finalLon)) {
    const alt =
      finalAlt ??
      (typeof gpsBlock.GPSAltitude === 'number'
        ? gpsBlock.GPSAltitude
        : typeof parsedRaw.GPSAltitude === 'number'
          ? parsedRaw.GPSAltitude
          : undefined);

    let dateStampStr: string | undefined;
    if (gpsBlock.GPSDateStamp) {
      dateStampStr = String(gpsBlock.GPSDateStamp);
    }

    let timeStampStr: string | undefined;
    if (Array.isArray(gpsBlock.GPSTimeStamp)) {
      timeStampStr =
        gpsBlock.GPSTimeStamp.map((n: number) => String(Math.floor(n)).padStart(2, '0')).join(':') +
        ' UTC';
    } else if (gpsBlock.GPSTimeStamp) {
      timeStampStr = String(gpsBlock.GPSTimeStamp);
    }

    gps = {
      latitude: finalLat,
      longitude: finalLon,
      altitude: alt,
      altitudeRef: gpsBlock.GPSAltitudeRef,
      latitudeDMS: decimalToDms(finalLat, true),
      longitudeDMS: decimalToDms(finalLon, false),
      dop: gpsBlock.GPSDOP || gpsBlock.GPSHPositioningError,
      precision: gpsBlock.GPSHPositioningError,
      datestamp: dateStampStr,
      timestamp: timeStampStr,
      speed: gpsBlock.GPSSpeed,
      direction: gpsBlock.GPSImgDirection || gpsBlock.GPSTrack,
      processingMethod: gpsBlock.GPSProcessingMethod,
      detectionSource,
      nullIslandWarning,
    };
  } else {
    scanLog.push('Diagnostic final : Aucune balise GPS enregistrée dans ce fichier par le capteur.');
  }

  // MakerNote summary
  const makerNoteData = parsedRaw.makerNote || exif.MakerNote || {};
  const makerKeys =
    typeof makerNoteData === 'object' && makerNoteData !== null ? Object.keys(makerNoteData) : [];

  const samsungSpecial: SamsungSpecialData = {
    isSamsungDevice: isSamsung,
    modelDetected: model || (isSamsung ? 'Samsung Galaxy S23 Series' : undefined),
    hasMotionPhoto:
      sefResult.markers.some((m) => m.includes('Motion Photo')) ||
      Boolean(xmp['GCamera:MotionPhoto'] || xmp['Samsung:MotionPhoto']),
    motionPhotoOffset: sefResult.motionPhotoOffset,
    motionPhotoSize: sefResult.motionPhotoSize,
    hasSefTrailer: sefResult.hasSef,
    sefMarkersFound: sefResult.markers,
    makerNoteSummary: {
      sceneMode: makerNoteData.SceneMode || makerNoteData.SamsungSceneMode || exif.SceneCaptureType,
      focusMode: makerNoteData.FocusMode || exif.FocusMode,
      whiteBalance: exif.WhiteBalance,
      nightModeUsed: software.includes('AW') || sefResult.markers.some((m) => m.includes('Night')),
      hdrMode: makerNoteData.HDR || exif.ExposureMode === 2,
      rawMakerNoteKeys: makerKeys.slice(0, 30),
    },
    cameraSoftware: software,
    lensModel: exif.LensModel || tiff.LensModel,
  };

  const previewUrl = URL.createObjectURL(file);

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'image/jpeg',
    lastModified: file.lastModified,
    imageWidth: exif.ImageWidth || exif.ExifImageWidth || tiff.ImageWidth,
    imageHeight: exif.ImageHeight || exif.ExifImageHeight || tiff.ImageHeight,
    previewUrl,
    make,
    model,
    software,
    dateTimeOriginal: exif.DateTimeOriginal ? String(exif.DateTimeOriginal) : undefined,
    createDate: exif.CreateDate ? String(exif.CreateDate) : undefined,
    modifyDate: tiff.ModifyDate ? String(tiff.ModifyDate) : undefined,
    fNumber: exif.FNumber,
    exposureTime: exif.ExposureTime,
    iso: exif.ISO || exif.ISOSpeedRatings,
    focalLength: exif.FocalLength,
    focalLengthIn35mmFormat: exif.FocalLengthIn35mmFormat,
    flash: exif.Flash,
    meteringMode: exif.MeteringMode,
    lensModel: exif.LensModel,
    gps,
    samsung: samsungSpecial,
    deepScanLog: scanLog,
    rawExif: exif,
    rawTiff: tiff,
    rawXmp: xmp,
    rawIptc: parsedRaw.iptc,
    rawIcc: parsedRaw.icc,
  };
}
