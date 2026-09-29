import { 
  RGB, 
  HSV, 
  CIELab, 
  RegionOfInterest, 
  ColourMeasurements, 
  ClassificationDetails,
  PresumptiveResult 
} from '../types';
import { REFERENCE_CARD_CONFIG } from '../config/referenceCard';
import { DEMO_TEST_CONFIG } from '../config/thresholds';

/**
 * Converts sRGB (0-255) to HSV (H: 0-360, S: 0-100, V: 0-100)
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

/**
 * Converts sRGB (0-255) to CIE L*a*b* (D65 standard illuminant, 2° standard observer)
 */
export function rgbToCieLab(rgb: RGB): CIELab {
  // 1. sRGB to linear RGB
  const pivotRgb = (c: number) => {
    const v = c / 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  };

  const rLinear = pivotRgb(rgb.r);
  const gLinear = pivotRgb(rgb.g);
  const bLinear = pivotRgb(rgb.b);

  // 2. Linear RGB to XYZ matrix conversion
  const x = (rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805) * 100;
  const y = (rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722) * 100;
  const z = (rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505) * 100;

  // D65 reference white points
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  const pivotXyz = (val: number) => {
    return val > 0.008856 ? Math.pow(val, 1 / 3) : 7.787 * val + 16 / 116;
  };

  const fx = pivotXyz(x / refX);
  const fy = pivotXyz(y / refY);
  const fz = pivotXyz(z / refZ);

  const l = Math.round(Math.max(0, 116 * fy - 16) * 10) / 10;
  const a = Math.round(500 * (fx - fy) * 10) / 10;
  const b = Math.round(200 * (fy - fz) * 10) / 10;

  return { l, a, b };
}

/**
 * Samples pixels from a 2D canvas context inside an ROI
 * Returns mean RGB and standard deviation
 */
export function sampleRegionPixels(
  ctx: CanvasRenderingContext2D,
  roi: RegionOfInterest
): { mean: RGB; stdDev: number; count: number } {
  const x = Math.max(0, Math.floor(roi.x));
  const y = Math.max(0, Math.floor(roi.y));
  const w = Math.max(1, Math.floor(roi.width));
  const h = Math.max(1, Math.floor(roi.height));

  const imgData = ctx.getImageData(x, y, w, h);
  const data = imgData.data;
  const count = w * h;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
  }

  const meanR = sumR / count;
  const meanG = sumG / count;
  const meanB = sumB / count;

  // Variance calculation
  let sumSqDiff = 0;
  for (let i = 0; i < data.length; i += 4) {
    const diffR = data[i] - meanR;
    const diffG = data[i + 1] - meanG;
    const diffB = data[i + 2] - meanB;
    sumSqDiff += (diffR * diffR + diffG * diffG + diffB * diffB) / 3;
  }

  const stdDev = Math.round(Math.sqrt(sumSqDiff / count) * 10) / 10;

  return {
    mean: {
      r: Math.round(meanR),
      g: Math.round(meanG),
      b: Math.round(meanB),
    },
    stdDev,
    count,
  };
}

/**
 * Computes per-channel gain correction between measured and nominal reference values.
 * Clamped strictly to [0.5, 2.0] for deterministic stability.
 */
export function calculateGainCorrection(measured: RGB, nominal: RGB): RGB {
  const clampGain = (val: number) => Math.max(0.5, Math.min(2.0, val));
  
  return {
    r: Math.round(clampGain(nominal.r / Math.max(1, measured.r)) * 100) / 100,
    g: Math.round(clampGain(nominal.g / Math.max(1, measured.g)) * 100) / 100,
    b: Math.round(clampGain(nominal.b / Math.max(1, measured.b)) * 100) / 100,
  };
}

/**
 * Applies gain correction to raw RGB
 */
export function applyGainCorrection(raw: RGB, gain: RGB): RGB {
  return {
    r: Math.min(255, Math.max(0, Math.round(raw.r * gain.r))),
    g: Math.min(255, Math.max(0, Math.round(raw.g * gain.g))),
    b: Math.min(255, Math.max(0, Math.round(raw.b * gain.b))),
  };
}

/**
 * Complete deterministic analysis pipeline
 */
export function runColourAnalysis(
  ctx: CanvasRenderingContext2D,
  referenceCardRoi: RegionOfInterest,
  testRoi: RegionOfInterest
): { measurements: ColourMeasurements; classification: ClassificationDetails } {
  // 1. Sample reference area
  const refSample = sampleRegionPixels(ctx, referenceCardRoi);
  
  // Nominal midtone reference gray is 128,128,128
  const nominalGray = REFERENCE_CARD_CONFIG.patches[1].nominalRgb; // P2 Neutral Gray
  const gain = calculateGainCorrection(refSample.mean, nominalGray);

  // 2. Sample test region
  const testSample = sampleRegionPixels(ctx, testRoi);
  const calibratedTestRgb = applyGainCorrection(testSample.mean, gain);

  // 3. Compute Color Space representations
  const hsv = rgbToHsv(calibratedTestRgb);
  const cielab = rgbToCieLab(calibratedTestRgb);
  const meanLuminance = Math.round((calibratedTestRgb.r * 0.299 + calibratedTestRgb.g * 0.587 + calibratedTestRgb.b * 0.114));

  const measurements: ColourMeasurements = {
    rawTestRgb: testSample.mean,
    calibratedTestRgb,
    hsv,
    cielab,
    gainCorrection: gain,
    referenceVariance: refSample.stdDev,
    testStdDev: testSample.stdDev,
    meanLuminance,
  };

  // 4. Deterministic Rule Classification
  const cfg = DEMO_TEST_CONFIG;
  let result: PresumptiveResult = 'inconclusive';
  let rationale = '';
  let inconclusiveReason: string | undefined = undefined;

  // Reliability Checks
  if (testRoi.width < cfg.reliability.minRegionDimensionPixels || testRoi.height < cfg.reliability.minRegionDimensionPixels) {
    result = 'inconclusive';
    inconclusiveReason = `Selected test region (${testRoi.width}×${testRoi.height} px) is below minimum threshold (${cfg.reliability.minRegionDimensionPixels} px).`;
    rationale = 'Region of interest too small for reliable color averaging.';
  } else if (meanLuminance < cfg.illumination.minLuminance) {
    result = 'inconclusive';
    inconclusiveReason = `Mean image luminance (${meanLuminance}/255) is below minimum readable limit (${cfg.illumination.minLuminance}). Image is underexposed.`;
    rationale = 'Insufficient ambient illumination; spectral values cannot be reliably determined.';
  } else if (meanLuminance > cfg.illumination.maxLuminance) {
    result = 'inconclusive';
    inconclusiveReason = `Mean image luminance (${meanLuminance}/255) exceeds limit (${cfg.illumination.maxLuminance}). Specular glare or sensor saturation detected.`;
    rationale = 'Direct glare or overexposure has washed out color reaction channels.';
  } else if (refSample.stdDev > cfg.reliability.maxPatchVarianceStdDev) {
    result = 'inconclusive';
    inconclusiveReason = `Reference card variance (σ = ${refSample.stdDev}) exceeded acceptable limit (σ ≤ ${cfg.reliability.maxPatchVarianceStdDev}). Uneven lighting or shadow detected across reference card.`;
    rationale = 'Reference normalization card is partially obscured or under harsh gradient shadow.';
  } else {
    // Classification checks based on Hue and Saturation
    const hue = hsv.h;
    const sat = hsv.s;
    const val = hsv.v;

    const pos = cfg.positiveReaction;
    const neg = cfg.negativeReaction;

    if (
      hue >= pos.hueMin && 
      hue <= pos.hueMax && 
      sat >= pos.minSaturation && 
      val >= pos.minValue
    ) {
      result = 'presumptive_positive';
      rationale = `Calibrated hue (${hue}°) and saturation (${sat}%) fall within target reaction band (${pos.hueMin}°–${pos.hueMax}°, Sat ≥ ${pos.minSaturation}%). Distinct chromogenic transition detected.`;
    } else if (
      (hue >= neg.hueMin && hue <= neg.hueMax) || 
      (sat < neg.maxPositiveSaturation)
    ) {
      result = 'presumptive_negative';
      rationale = `Calibrated hue (${hue}°) aligns with baseline unreacted reagent coloration (${neg.hueMin}°–${neg.hueMax}°) with low saturation (${sat}%). No target complex reaction observed.`;
    } else {
      result = 'inconclusive';
      inconclusiveReason = `Measured hue (${hue}°) and saturation (${sat}%) fall outside both target positive (${pos.hueMin}°–${pos.hueMax}°) and baseline negative (${neg.hueMin}°–${neg.hueMax}°) defined bands.`;
      rationale = 'Spectral signature does not match expected reaction profile or baseline state.';
    }
  }

  const classification: ClassificationDetails = {
    result,
    targetHueRange: [cfg.positiveReaction.hueMin, cfg.positiveReaction.hueMax],
    measuredHue: hsv.h,
    saturation: hsv.s,
    luminance: meanLuminance,
    rationale,
    inconclusiveReason,
  };

  return { measurements, classification };
}
