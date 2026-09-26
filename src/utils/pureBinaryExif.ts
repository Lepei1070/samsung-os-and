/**
 * Pure binary EXIF and MP4 parser mimicking ExifTool (-gps:GPSLatitude -gps:GPSLongitude -n).
 * Directly inspects raw byte structures for:
 * 1. JPEG APP1 markers & TIFF GPS IFD (Tag 0x8825 -> Tags 0x0001, 0x0002, 0x0003, 0x0004)
 * 2. HEIC / ISOBMFF Exif items (iloc / meta box)
 * 3. MP4 / QuickTime GPS coordinates (moov.udta.©xyz atom ISO 6709)
 * 4. Raw byte search for TIFF headers (0x49 0x49 0x2A 0x00 or 0x4D 0x4D 0x00 0x2A)
 */

export interface PureBinaryGpsResult {
  latitude: number;
  longitude: number;
  altitude?: number;
  source: string;
  latRef?: string;
  lonRef?: string;
  debugTrace?: string[];
  rawDms?: {
    latDeg: number;
    latMin: number;
    latSec: number;
    lonDeg: number;
    lonMin: number;
    lonSec: number;
  };
}

class BinaryReader {
  private view: DataView;
  public littleEndian: boolean = true;
  public offset: number = 0;
  public length: number;

  constructor(buffer: ArrayBuffer, offset = 0, length?: number) {
    this.offset = offset;
    this.length = length !== undefined ? length : buffer.byteLength - offset;
    this.view = new DataView(buffer, offset, this.length);
  }

  getUint8(pos: number): number {
    return this.view.getUint8(pos);
  }

  getUint16(pos: number): number {
    return this.view.getUint16(pos, this.littleEndian);
  }

  getUint32(pos: number): number {
    return this.view.getUint32(pos, this.littleEndian);
  }

  getRational(pos: number): number {
    if (pos + 8 > this.length) return 0;
    const num = this.getUint32(pos);
    const den = this.getUint32(pos + 4);
    if (den === 0) return 0;
    return num / den;
  }

  getString(pos: number, len: number): string {
    let str = '';
    for (let i = 0; i < len; i++) {
      if (pos + i >= this.length) break;
      const c = this.view.getUint8(pos + i);
      if (c === 0) break;
      str += String.fromCharCode(c);
    }
    return str;
  }
}

/**
 * Parses a TIFF structure starting at `tiffStart` within `buffer`
 */
function parseTiffGps(
  buffer: ArrayBuffer,
  tiffStart: number,
  debugTrace: string[]
): PureBinaryGpsResult | null {
  try {
    const reader = new BinaryReader(buffer, tiffStart);
    if (reader.length < 8) return null;

    // Check byte order
    const b0 = reader.getUint8(0);
    const b1 = reader.getUint8(1);

    if (b0 === 0x49 && b1 === 0x49) {
      reader.littleEndian = true; // Little Endian (Intel - 'II')
      debugTrace.push(`En-tête TIFF Little-Endian (II*) à l'offset ${tiffStart}`);
    } else if (b0 === 0x4D && b1 === 0x4D) {
      reader.littleEndian = false; // Big Endian (Motorola - 'MM')
      debugTrace.push(`En-tête TIFF Big-Endian (MM*) à l'offset ${tiffStart}`);
    } else {
      return null;
    }

    // Check 42 magic number
    const magic = reader.getUint16(2);
    if (magic !== 42 && magic !== 0x002a && magic !== 0x2a00) {
      debugTrace.push(`Numéro magique 42 invalide: ${magic}`);
      return null;
    }

    const ifd0Offset = reader.getUint32(4);
    debugTrace.push(`Offset IFD0: ${ifd0Offset}`);
    if (ifd0Offset < 8 || ifd0Offset >= reader.length - 2) return null;

    // Read IFD0 entries count
    const numEntries = reader.getUint16(ifd0Offset);
    debugTrace.push(`Entrées IFD0: ${numEntries}`);
    if (numEntries <= 0 || numEntries > 1000) return null;

    let gpsIfdOffset = 0;
    let exifIfdOffset = 0;

    // Look for Tag 0x8825 (GPSInfoIFDPointer) in IFD0
    for (let i = 0; i < numEntries; i++) {
      const entryPos = ifd0Offset + 2 + i * 12;
      if (entryPos + 12 > reader.length) break;

      const tag = reader.getUint16(entryPos);
      if (tag === 0x8825) {
        gpsIfdOffset = reader.getUint32(entryPos + 8);
        debugTrace.push(`Tag 0x8825 trouvé dans IFD0 ! Offset GPS IFD = ${gpsIfdOffset}`);
      } else if (tag === 0x8769) {
        exifIfdOffset = reader.getUint32(entryPos + 8);
      }
    }

    // Fallback: check ExifIFD if not in IFD0
    if (!gpsIfdOffset && exifIfdOffset > 0 && exifIfdOffset < reader.length - 2) {
      const numExif = reader.getUint16(exifIfdOffset);
      for (let i = 0; i < numExif; i++) {
        const entryPos = exifIfdOffset + 2 + i * 12;
        if (entryPos + 12 > reader.length) break;
        const tag = reader.getUint16(entryPos);
        if (tag === 0x8825) {
          gpsIfdOffset = reader.getUint32(entryPos + 8);
          debugTrace.push(`Tag 0x8825 trouvé dans ExifIFD ! Offset GPS IFD = ${gpsIfdOffset}`);
          break;
        }
      }
    }

    if (gpsIfdOffset <= 0 || gpsIfdOffset >= reader.length - 2) {
      debugTrace.push(`Aucun Tag 0x8825 (GPSInfoIFDPointer) valide trouvé dans cet en-tête TIFF.`);
      return null;
    }

    // Parse GPS IFD
    const numGpsEntries = reader.getUint16(gpsIfdOffset);
    debugTrace.push(`Entrées dans le dictionnaire GPS: ${numGpsEntries}`);
    if (numGpsEntries <= 0 || numGpsEntries > 200) return null;

    let latRef = 'N';
    let lonRef = 'E';
    let latDeg: number | undefined;
    let latMin: number | undefined;
    let latSec: number | undefined;
    let lonDeg: number | undefined;
    let lonMin: number | undefined;
    let lonSec: number | undefined;
    let altitude: number | undefined;
    let altRef = 0;

    for (let i = 0; i < numGpsEntries; i++) {
      const entryPos = gpsIfdOffset + 2 + i * 12;
      if (entryPos + 12 > reader.length) break;

      const tag = reader.getUint16(entryPos);
      const valOffset = reader.getUint32(entryPos + 8);

      // Resolve pos: handle relative to TIFF vs relative to file
      let pos = valOffset;
      if (pos + 24 > reader.length && valOffset >= tiffStart && valOffset - tiffStart + 24 <= reader.length) {
        pos = valOffset - tiffStart;
      }

      // Tag 0x0001: GPSLatitudeRef ('N' or 'S')
      if (tag === 0x0001) {
        const charCode = reader.getUint8(entryPos + 8);
        latRef = String.fromCharCode(charCode).toUpperCase();
        if (latRef !== 'S') latRef = 'N';
        debugTrace.push(`GPS Tag 0x0001 (LatitudeRef): ${latRef}`);
      }

      // Tag 0x0002: GPSLatitude (3 rationals)
      if (tag === 0x0002) {
        if (pos + 24 <= reader.length) {
          latDeg = reader.getRational(pos);
          latMin = reader.getRational(pos + 8);
          latSec = reader.getRational(pos + 16);
          debugTrace.push(`GPS Tag 0x0002 (Latitude): ${latDeg}° ${latMin}' ${latSec}"`);
        }
      }

      // Tag 0x0003: GPSLongitudeRef ('E' or 'W')
      if (tag === 0x0003) {
        const charCode = reader.getUint8(entryPos + 8);
        lonRef = String.fromCharCode(charCode).toUpperCase();
        if (lonRef !== 'W') lonRef = 'E';
        debugTrace.push(`GPS Tag 0x0003 (LongitudeRef): ${lonRef}`);
      }

      // Tag 0x0004: GPSLongitude (3 rationals)
      if (tag === 0x0004) {
        if (pos + 24 <= reader.length) {
          lonDeg = reader.getRational(pos);
          lonMin = reader.getRational(pos + 8);
          lonSec = reader.getRational(pos + 16);
          debugTrace.push(`GPS Tag 0x0004 (Longitude): ${lonDeg}° ${lonMin}' ${lonSec}"`);
        }
      }

      // Tag 0x0005: GPSAltitudeRef (0 = Above Sea Level, 1 = Below)
      if (tag === 0x0005) {
        altRef = reader.getUint8(entryPos + 8);
      }

      // Tag 0x0006: GPSAltitude (1 rational)
      if (tag === 0x0006) {
        if (pos + 8 <= reader.length) {
          altitude = reader.getRational(pos);
          if (altRef === 1) altitude = -altitude;
          debugTrace.push(`GPS Tag 0x0006 (Altitude): ${altitude}m`);
        }
      }
    }

    if (
      latDeg !== undefined &&
      latMin !== undefined &&
      latSec !== undefined &&
      lonDeg !== undefined &&
      lonMin !== undefined &&
      lonSec !== undefined
    ) {
      let lat = latDeg + latMin / 60 + latSec / 3600;
      let lon = lonDeg + lonMin / 60 + lonSec / 3600;

      if (latRef === 'S') lat = -lat;
      if (lonRef === 'W') lon = -lon;

      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat !== 0 || lon !== 0)) {
        return {
          latitude: lat,
          longitude: lon,
          altitude,
          latRef,
          lonRef,
          source: 'TIFF GPS IFD (Tag 0x8825)',
          debugTrace,
          rawDms: {
            latDeg,
            latMin,
            latSec,
            lonDeg,
            lonMin,
            lonSec,
          },
        };
      }
    }
  } catch (err) {
    debugTrace.push(`Exception parseTiffGps: ${err}`);
  }

  return null;
}

/**
 * Searches for all JPEG APP1 markers (0xFF 0xE1) and parses any embedded Exif/TIFF headers.
 */
function scanJpegApp1Markers(
  buffer: ArrayBuffer,
  debugTrace: string[]
): PureBinaryGpsResult | null {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  let pos = 0;

  // Verify JPEG SOI (0xFF 0xD8)
  if (len < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    debugTrace.push('Fichier non-JPEG (pas de signature 0xFF 0xD8 au début).');
    return null;
  }

  debugTrace.push('Signature JPEG confirmée (0xFF 0xD8). Recherche des marqueurs APP1...');

  pos = 2;
  let app1Count = 0;

  while (pos < len - 4) {
    if (bytes[pos] !== 0xff) {
      pos++;
      continue;
    }

    const marker = bytes[pos + 1];

    // End of image or SOS marker (start of scan - compressed data)
    if (marker === 0xda || marker === 0xd9) {
      debugTrace.push(`Marqueur SOS/EOI (0xFF 0x${marker.toString(16)}) atteint. Fin de l'en-tête.`);
      break;
    }

    const segmentLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
    if (segmentLen < 2 || pos + 2 + segmentLen > len) {
      break;
    }

    // APP1 marker (0xFF 0xE1)
    if (marker === 0xe1) {
      app1Count++;
      debugTrace.push(`Marqueur APP1 n°${app1Count} trouvé à l'offset ${pos} (taille: ${segmentLen} octets)`);

      // Search for TIFF header anywhere in the first 64 bytes of this APP1 segment
      const maxSearch = Math.min(pos + segmentLen, pos + 64);
      let foundTiff = -1;

      for (let s = pos + 4; s < maxSearch - 4; s++) {
        // Look for 'II*\0' or 'MM\0*'
        if (
          (bytes[s] === 0x49 && bytes[s + 1] === 0x49 && bytes[s + 2] === 0x2a && bytes[s + 3] === 0x00) ||
          (bytes[s] === 0x4d && bytes[s + 1] === 0x4d && bytes[s + 2] === 0x00 && bytes[s + 3] === 0x2a)
        ) {
          foundTiff = s;
          break;
        }
      }

      if (foundTiff !== -1) {
        const res = parseTiffGps(buffer, foundTiff, debugTrace);
        if (res) {
          res.source = `JPEG APP1 n°${app1Count} (Tag 0x8825)`;
          return res;
        }
      } else {
        debugTrace.push(`APP1 n°${app1Count} : Aucun en-tête TIFF (II* ou MM*) trouvé.`);
      }
    }

    pos += 2 + segmentLen;
  }

  return null;
}

/**
 * Parses MP4 / QuickTime ISO 6709 coordinates (moov.udta.©xyz atom or location tag).
 */
function scanMp4QuickTimeGps(
  buffer: ArrayBuffer,
  debugTrace: string[]
): PureBinaryGpsResult | null {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  const textDecoder = new TextDecoder('latin1');

  // Search for "©xyz" (0xa9 0x78 0x79 0x7a) in the file
  for (let i = 0; i < len - 30; i++) {
    if (
      bytes[i] === 0xa9 &&
      bytes[i + 1] === 0x78 &&
      bytes[i + 2] === 0x79 &&
      bytes[i + 3] === 0x7a
    ) {
      debugTrace.push(`Atome vidéo QuickTime ©xyz détecté à l'offset ${i}`);
      const rawFragment = textDecoder.decode(bytes.slice(i + 4, Math.min(len, i + 64)));
      const match = rawFragment.match(/([+-][0-9]{2,3}\.[0-9]{3,8})([+-][0-9]{2,3}\.[0-9]{3,8})([+-][0-9.]+)?\//);
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        const alt = match[3] ? parseFloat(match[3]) : undefined;
        if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
          debugTrace.push(`Coordonnées extraites de l'atome ©xyz: Lat=${lat}, Lon=${lon}`);
          return {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            source: 'QuickTime / MP4 atome ISO 6709 (©xyz)',
            debugTrace,
          };
        }
      }
    }
  }

  // Generic ISO 6709 regex scan in the last 1MB
  const tailWindow = Math.min(len, 1048576);
  const tailStr = textDecoder.decode(bytes.slice(Math.max(0, len - tailWindow)));
  const isoMatch = tailStr.match(/([+-][0-9]{2}\.[0-9]{4,8})([+-][0-9]{2,3}\.[0-9]{4,8})/);
  if (isoMatch) {
    const lat = parseFloat(isoMatch[1]);
    const lon = parseFloat(isoMatch[2]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && (lat !== 0 || lon !== 0)) {
      debugTrace.push(`Signature texte ISO 6709 trouvée dans le conteneur: Lat=${lat}, Lon=${lon}`);
      return {
        latitude: lat,
        longitude: lon,
        source: 'Conteneur MP4 / Signature ISO 6709',
        debugTrace,
      };
    }
  }

  return null;
}

/**
 * Raw buffer scan for TIFF headers (0x49 0x49 0x2A 0x00 or 0x4D 0x4D 0x00 0x2A).
 */
function scanRawTiffHeaders(
  buffer: ArrayBuffer,
  debugTrace: string[]
): PureBinaryGpsResult | null {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;

  for (let i = 0; i < Math.min(len - 64, 1048576); i++) {
    // Check 'II*\0' (Little Endian)
    if (
      bytes[i] === 0x49 &&
      bytes[i + 1] === 0x49 &&
      bytes[i + 2] === 0x2a &&
      bytes[i + 3] === 0x00
    ) {
      const res = parseTiffGps(buffer, i, debugTrace);
      if (res) {
        res.source = `TIFF brut Little-Endian (offset ${i})`;
        return res;
      }
    }
    // Check 'MM\0*' (Big Endian)
    if (
      bytes[i] === 0x4d &&
      bytes[i + 1] === 0x4d &&
      bytes[i + 2] === 0x00 &&
      bytes[i + 3] === 0x2a
    ) {
      const res = parseTiffGps(buffer, i, debugTrace);
      if (res) {
        res.source = `TIFF brut Big-Endian (offset ${i})`;
        return res;
      }
    }
  }

  return null;
}

/**
 * Universal binary GPS extractor mimicking ExifTool behavior with full debug trace.
 */
export function extractGpsWithTrace(buffer: ArrayBuffer): {
  result: PureBinaryGpsResult | null;
  trace: string[];
} {
  const trace: string[] = [];

  // 1. JPEG APP1 Exif chain
  const jpegRes = scanJpegApp1Markers(buffer, trace);
  if (jpegRes) {
    jpegRes.debugTrace = trace;
    return { result: jpegRes, trace };
  }

  // 2. MP4 / QuickTime atom ©xyz
  const mp4Res = scanMp4QuickTimeGps(buffer, trace);
  if (mp4Res) {
    mp4Res.debugTrace = trace;
    return { result: mp4Res, trace };
  }

  // 3. Raw TIFF header anywhere in the first 1MB
  const tiffRes = scanRawTiffHeaders(buffer, trace);
  if (tiffRes) {
    tiffRes.debugTrace = trace;
    return { result: tiffRes, trace };
  }

  return { result: null, trace };
}

export function extractGpsWithPureBinary(buffer: ArrayBuffer): PureBinaryGpsResult | null {
  return extractGpsWithTrace(buffer).result;
}
