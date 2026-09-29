export type PresumptiveResult = 
  | 'presumptive_positive' 
  | 'presumptive_negative' 
  | 'inconclusive';

export interface LocationData {
  status: 'recorded' | 'denied' | 'unavailable' | 'not_requested';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  reason?: string;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
}

export interface CIELab {
  l: number; // 0 - 100
  a: number; // -128 - 127
  b: number; // -128 - 127
}

export interface RegionOfInterest {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReferencePatch {
  id: string;
  name: string;
  nominalRgb: RGB;
  measuredRgb?: RGB;
  measuredStdDev?: number;
}

export interface ColourMeasurements {
  rawTestRgb: RGB;
  calibratedTestRgb: RGB;
  hsv: HSV;
  cielab: CIELab;
  gainCorrection: RGB; // per-channel multiplier
  offsetCorrection?: RGB;
  referenceVariance: number;
  testStdDev: number;
  meanLuminance: number;
}

export interface ClassificationDetails {
  result: PresumptiveResult;
  targetHueRange: [number, number];
  measuredHue: number;
  saturation: number;
  luminance: number;
  rationale: string;
  inconclusiveReason?: string;
}

export interface TestRecord {
  id: string; // CT-YYYY-NNNN
  operatorId: string;
  createdAt: string; // ISO string
  testedAt: string; // ISO string
  location: LocationData;
  imageBlob?: Blob;
  imageDataUrl: string; // Base64 data URL for instant rendering & persistence
  imageHash: string; // SHA-256 lowercase hex
  result: PresumptiveResult;
  analysisStatus: 'completed' | 'completed_with_warnings';
  measurements: ColourMeasurements;
  classificationDetails: ClassificationDetails;
  verificationStatus: 'not_verified' | 'verified' | 'failed';
  lastVerifiedAt?: string;
}
