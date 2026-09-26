import { ParsedExifResult } from '../types/exif';
import { decimalToDms } from './geoUtils';

// SVG generator to create instant client-side realistic sample images with visual camera overlays
function createSampleSvgUrl(title: string, subtitle: string, color1: string, color2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0"/>
        <feComposite operator="in" in2="SourceGraphic"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <rect width="100%" height="100%" filter="url(#noise)" />
    
    <!-- Camera Grid Lines -->
    <line x1="400" y1="0" x2="400" y2="900" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="8 8" />
    <line x1="800" y1="0" x2="800" y2="900" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="8 8" />
    <line x1="0" y1="300" x2="1200" y2="300" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="8 8" />
    <line x1="0" y1="600" x2="1200" y2="600" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="8 8" />
    
    <!-- Focus Box -->
    <rect x="520" y="370" width="160" height="160" rx="8" fill="none" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.8" />
    <circle cx="600" cy="450" r="4" fill="#f59e0b" />
    
    <!-- Watermark Badge -->
    <g transform="translate(60, 780)">
      <rect width="360" height="64" rx="12" fill="rgba(15,23,42,0.75)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <text x="24" y="28" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="16">SAMSUNG Galaxy S23 Ultra</text>
      <text x="24" y="48" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">200 MP · ISOCELL HP2 · RAW DNG 16-bit</text>
    </g>

    <!-- Center Label -->
    <text x="600" y="440" fill="#ffffff" font-family="system-ui, sans-serif" font-size="44" font-weight="800" text-anchor="middle">${title}</text>
    <text x="600" y="485" fill="rgba(255,255,255,0.85)" font-family="system-ui, sans-serif" font-size="20" font-weight="500" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHOTOS: Array<{
  id: string;
  title: string;
  subtitle: string;
  data: ParsedExifResult;
}> = [
  {
    id: 's23-eiffel',
    title: 'Tour Eiffel, Paris (S23 Ultra)',
    subtitle: 'SM-S918B · F/1.7 · ISO 50 · GPS Haute Précision',
    data: {
      fileName: '20240412_142358_Samsung_S23Ultra.jpg',
      fileSize: 8432190,
      fileType: 'image/jpeg',
      lastModified: new Date('2024-04-12T14:23:58Z').getTime(),
      imageWidth: 4000,
      imageHeight: 3000,
      previewUrl: createSampleSvgUrl('Tour Eiffel, Paris', 'Prise avec Samsung Galaxy S23 Ultra', '#1e293b', '#0f172a'),
      make: 'Samsung',
      model: 'SM-S918B (Galaxy S23 Ultra)',
      software: 'S918BXXU3BWJM (One UI 6.1)',
      dateTimeOriginal: '2024-04-12 14:23:58',
      createDate: '2024-04-12 14:23:58',
      fNumber: 1.7,
      exposureTime: 0.00125,
      iso: 50,
      focalLength: 6.3,
      focalLengthIn35mmFormat: 23,
      lensModel: 'Samsung ISOCELL HP2 200MP Main Wide (f/1.7 OIS)',
      gps: {
        latitude: 48.858370,
        longitude: 2.294481,
        altitude: 43.5,
        altitudeRef: 0,
        latitudeDMS: decimalToDms(48.858370, true),
        longitudeDMS: decimalToDms(2.294481, false),
        precision: 3.2,
        dop: 1.1,
        datestamp: '2024:04:12',
        timestamp: '12:23:58 UTC',
        direction: 312,
        processingMethod: 'CELLID + GPS/GLONASS/GALILEO Fused',
      },
      samsung: {
        isSamsungDevice: true,
        modelDetected: 'Galaxy S23 Ultra (SM-S918B)',
        hasMotionPhoto: true,
        motionPhotoOffset: 7241088,
        motionPhotoSize: 1191102,
        hasSefTrailer: true,
        sefMarkersFound: [
          'Samsung Embedded Format (SEF) Trailer détecté',
          'Motion Photo Samsung (Vidéo intégrée)',
          'Carte de profondeur Mode Portrait (DualShot)',
          'Données de calibration couleurs Samsung',
          'Paramètres capteur Samsung ISOCELL',
          'Flux vidéo MP4 Motion Photo détecté'
        ],
        makerNoteSummary: {
          sceneMode: 'Architecture / Monument',
          focusMode: 'Dual Pixel PDAF Continu',
          whiteBalance: 'Auto (5400K)',
          nightModeUsed: false,
          hdrMode: true,
          faceCount: 0,
          rawMakerNoteKeys: [
            'SamsungSceneMode',
            'FocusMode',
            'ISO_Speed',
            'ISOCELL_HP2_Config',
            'MultiFrame_StackCount',
            'SuperHDR_ToneCurve',
            'LensOIS_PositionX',
            'LensOIS_PositionY'
          ]
        },
        cameraSoftware: 'Samsung Camera v14.0.01.21',
        lensModel: 'Samsung Galaxy S23 Ultra Quad-Camera Array'
      },
      rawExif: {
        Make: 'Samsung',
        Model: 'SM-S918B',
        Software: 'S918BXXU3BWJM',
        DateTimeOriginal: '2024:04:12 14:23:58',
        ExposureTime: '1/800s',
        FNumber: 1.7,
        ISO: 50,
        FocalLength: '6.3 mm',
        FocalLengthIn35mmFormat: '23 mm',
        MeteringMode: 'Pattern Multi-segment',
        Flash: 'Off, did not fire',
        ColorSpace: 'sRGB',
        WhiteBalance: 'Auto',
        ExposureMode: 'Auto',
        DigitalZoomRatio: 1.0,
      }
    }
  },
  {
    id: 's23-chamonix',
    title: 'Aiguille du Midi, Chamonix (S23)',
    subtitle: 'SM-S911B · Zoom Téléobjectif 3x · Altitude 3842m',
    data: {
      fileName: '20240728_104512_Galaxy_S23.heic',
      fileSize: 4210940,
      fileType: 'image/heic',
      lastModified: new Date('2024-07-28T10:45:12Z').getTime(),
      imageWidth: 4000,
      imageHeight: 3000,
      previewUrl: createSampleSvgUrl('Aiguille du Midi, Chamonix', 'Téléobjectif 3x · Samsung Galaxy S23', '#0369a1', '#082f49'),
      make: 'Samsung',
      model: 'SM-S911B (Galaxy S23)',
      software: 'S911BXXU4CXB2 (One UI 6.1)',
      dateTimeOriginal: '2024-07-28 10:45:12',
      createDate: '2024-07-28 10:45:12',
      fNumber: 2.4,
      exposureTime: 0.0005,
      iso: 64,
      focalLength: 7.0,
      focalLengthIn35mmFormat: 69,
      lensModel: 'Samsung Telephoto 3x 10MP (f/2.4 OIS)',
      gps: {
        latitude: 45.877778,
        longitude: 6.887222,
        altitude: 3842.0,
        altitudeRef: 0,
        latitudeDMS: decimalToDms(45.877778, true),
        longitudeDMS: decimalToDms(6.887222, false),
        precision: 2.1,
        dop: 0.9,
        datestamp: '2024:07:28',
        timestamp: '08:45:12 UTC',
        direction: 185,
        processingMethod: 'GPS + Galileo Dual Frequency L1/L5',
      },
      samsung: {
        isSamsungDevice: true,
        modelDetected: 'Galaxy S23 (SM-S911B)',
        hasMotionPhoto: true,
        motionPhotoOffset: 3450000,
        motionPhotoSize: 760940,
        hasSefTrailer: true,
        sefMarkersFound: [
          'Samsung Embedded Format (SEF) Trailer détecté',
          'Motion Photo Samsung (Vidéo intégrée)',
          'Paramètres capteur Samsung ISOCELL',
          'Données de calibration couleurs Samsung',
          'Flux vidéo MP4 Motion Photo détecté'
        ],
        makerNoteSummary: {
          sceneMode: 'Montagne / Neige (Compensation haute luminosité)',
          focusMode: 'PDAF Infini',
          whiteBalance: 'Auto (6100K)',
          nightModeUsed: false,
          hdrMode: true,
          faceCount: 0,
          rawMakerNoteKeys: [
            'SamsungSceneMode',
            'TelephotoLensRatio',
            'ISOCELL_3K1_Config',
            'OIS_Stabilization_Active',
            'AltitudeBarometerCorrection'
          ]
        },
        cameraSoftware: 'Samsung Camera v14.0.02.10',
        lensModel: 'Samsung 3x Telephoto Module'
      },
      rawExif: {
        Make: 'Samsung',
        Model: 'SM-S911B',
        Software: 'S911BXXU4CXB2',
        DateTimeOriginal: '2024:07:28 10:45:12',
        ExposureTime: '1/2000s',
        FNumber: 2.4,
        ISO: 64,
        FocalLength: '7.0 mm',
        FocalLengthIn35mmFormat: '69 mm',
        MeteringMode: 'Spot',
        Flash: 'Off, did not fire',
        ColorSpace: 'Display P3',
        WhiteBalance: 'Auto',
        ExposureMode: 'Auto',
        DigitalZoomRatio: 3.0,
      }
    }
  },
  {
    id: 's23-nogps',
    title: 'Photo S23 sans GPS (Partage Galerie filtré)',
    subtitle: 'Exemple de photo dont les données GPS ont été purgées par One UI',
    data: {
      fileName: 'IMG_20240901_Shared_NoLocation.jpg',
      fileSize: 3120400,
      fileType: 'image/jpeg',
      lastModified: new Date('2024-09-01T18:12:00Z').getTime(),
      imageWidth: 4000,
      imageHeight: 3000,
      previewUrl: createSampleSvgUrl('Photo S23 Sans Données GPS', 'Option One UI "Retirer les données de lieu" activée', '#7f1d1d', '#450a0a'),
      make: 'Samsung',
      model: 'SM-S911B (Galaxy S23)',
      software: 'Samsung Gallery Export',
      dateTimeOriginal: '2024-09-01 18:12:00',
      createDate: '2024-09-01 18:12:00',
      fNumber: 1.8,
      exposureTime: 0.02,
      iso: 250,
      focalLength: 5.4,
      lensModel: 'Samsung ISOCELL GN3 50MP Wide',
      gps: undefined,
      samsung: {
        isSamsungDevice: true,
        modelDetected: 'Galaxy S23 (SM-S911B)',
        hasMotionPhoto: false,
        hasSefTrailer: false,
        sefMarkersFound: [
          'Notice : Les métadonnées de localisation et le trailer SEF ont été supprimés lors du partage via la Galerie Samsung.'
        ],
        makerNoteSummary: {
          sceneMode: 'Standard',
          focusMode: 'Auto',
          whiteBalance: 'Auto',
          nightModeUsed: false,
          hdrMode: true,
          faceCount: 0,
          rawMakerNoteKeys: []
        },
        cameraSoftware: 'Samsung Gallery Share Filter',
      },
      rawExif: {
        Make: 'Samsung',
        Model: 'SM-S911B',
        Software: 'One UI Gallery Exporter',
        DateTimeOriginal: '2024:09:01 18:12:00',
        Note: 'GPS tags stripped by Android One UI share sheet'
      }
    }
  }
];
