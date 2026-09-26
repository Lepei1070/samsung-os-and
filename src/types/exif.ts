export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  altitudeRef?: number;
  latitudeDMS: string;
  longitudeDMS: string;
  precision?: number;
  dop?: number;
  timestamp?: string;
  datestamp?: string;
  speed?: number;
  direction?: number;
  processingMethod?: string;
  detectionSource?: string;
  nullIslandWarning?: boolean;
  isManuallySet?: boolean;
}

export interface SamsungSpecialData {
  isSamsungDevice: boolean;
  modelDetected?: string;
  hasMotionPhoto: boolean;
  motionPhotoOffset?: number;
  motionPhotoSize?: number;
  hasSefTrailer: boolean;
  sefMarkersFound: string[];
  makerNoteSummary?: {
    sceneMode?: string;
    focusMode?: string;
    exposureProgram?: string;
    whiteBalance?: string;
    nightModeUsed?: boolean;
    hdrMode?: boolean;
    faceCount?: number;
    rawMakerNoteKeys: string[];
  };
  cameraSoftware?: string;
  lensModel?: string;
}

export interface ParsedExifResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
  imageWidth?: number;
  imageHeight?: number;
  previewUrl: string;
  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;
  createDate?: string;
  modifyDate?: string;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  focalLengthIn35mmFormat?: number;
  flash?: string | number;
  meteringMode?: string | number;
  lensModel?: string;
  gps?: GpsCoordinates;
  samsung: SamsungSpecialData;
  deepScanLog?: string[];
  rawExif: Record<string, any>;
  rawTiff?: Record<string, any>;
  rawXmp?: Record<string, any>;
  rawIptc?: Record<string, any>;
  rawIcc?: Record<string, any>;
}

export interface ReverseGeocodeResult {
  displayName: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}
