/**
 * ColorTrace Classification Thresholds & Rule Engine Config
 * 
 * PROTOTYPE NOTICE:
 * These thresholds are defined for prototype demonstration purposes only.
 * They represent simulated colorimetric reaction bands for a standard colorimetric
 * field test reaction (e.g. Cobalt Thiocyanate / blue-cyan complex test for positive,
 * vs. unreacted pink/amber baseline for negative).
 * 
 * These parameters ARE NOT forensic, clinical, or laboratory validated.
 */

export interface TestKitClassificationConfig {
  testKitName: string;
  reactionType: string;
  description: string;
  
  // Bounds for valid environmental illumination
  illumination: {
    minLuminance: number; // 0 - 255. Below this is flagged as underexposed
    maxLuminance: number; // 0 - 255. Above this is flagged as overexposed/glare
  };

  // Region and Patch Reliability Thresholds
  reliability: {
    minRegionDimensionPixels: number; // Minimum width/height
    maxPatchVarianceStdDev: number; // Max allowable standard deviation within reference card patches
    maxTestRegionVariance: number; // Max allowable standard deviation within test ROI
  };

  // Target Reaction (Presumptive Positive) Hue and Saturation range
  positiveReaction: {
    label: string;
    hueMin: number; // degrees (0-360) (e.g. 190° - 250° represents characteristic blue reaction)
    hueMax: number;
    minSaturation: number; // percent (0-100)
    minValue: number; // percent (0-100)
  };

  // Baseline / Unreacted (Presumptive Negative) Hue and Saturation range
  negativeReaction: {
    label: string;
    hueMin: number; // degrees (0-360) (e.g. 30° - 80° for unreacted amber/pale yellow/pinkish reagent)
    hueMax: number;
    maxPositiveSaturation: number; // if hue falls outside or saturation is below threshold
  };
}

export const DEMO_TEST_CONFIG: TestKitClassificationConfig = {
  testKitName: 'Field Colorimetric Screen (Simulated Cobalt/Molybdenum Assays)',
  reactionType: 'Chromogenic Complex Transition',
  description: 'Evaluates colorimetric spectral shift between unreacted baseline reagent and target chromogenic complex.',
  
  illumination: {
    minLuminance: 35,  // Below 35 is considered too dark / underexposed
    maxLuminance: 245, // Above 245 is considered washed out / glary
  },

  reliability: {
    minRegionDimensionPixels: 8,
    maxPatchVarianceStdDev: 45, // High variance suggests uneven lighting, shadows, or misaligned patch selection
    maxTestRegionVariance: 50,
  },

  positiveReaction: {
    label: 'Target Chromogenic Shift (Blue/Cyan Complex)',
    hueMin: 180, // Cyan to Deep Blue
    hueMax: 260,
    minSaturation: 20, // Must have distinct color saturation
    minValue: 15,
  },

  negativeReaction: {
    label: 'Unreacted / Baseline Reagent Coloration (Pale Amber/Pink/Straw)',
    hueMin: 25,
    hueMax: 75,
    maxPositiveSaturation: 18,
  },
};
