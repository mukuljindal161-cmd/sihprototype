import { ReferencePatch } from '../types';

/**
 * Standard 4-Patch Field Reference Card Configuration (Prototype Model CT-RC4)
 * 
 * NOTE: These nominal values are baseline reference values for this prototype demonstration.
 * They represent uncalibrated sRGB design coordinates for testing normalization workflows.
 * They do NOT constitute an ISO or NIST calibrated laboratory standard.
 */
export const REFERENCE_CARD_CONFIG: {
  cardName: string;
  version: string;
  patches: ReferencePatch[];
  layoutDescription: string;
} = {
  cardName: 'ColorTrace 4-Patch Reference Card (CT-RC4)',
  version: '1.0-prototype',
  layoutDescription: 'Horizontal or 2x2 grid containing 4 matte color patches: White, Neutral Gray, Reference Blue, and Reference Red.',
  patches: [
    {
      id: 'patch-white',
      name: 'P1: Reference White (High Reflectance)',
      nominalRgb: { r: 240, g: 240, b: 240 },
    },
    {
      id: 'patch-gray',
      name: 'P2: Neutral Gray (50% Midtone)',
      nominalRgb: { r: 128, g: 128, b: 128 },
    },
    {
      id: 'patch-blue',
      name: 'P3: Reference Blue (Spectral Anchor)',
      nominalRgb: { r: 40, g: 120, b: 200 },
    },
    {
      id: 'patch-red',
      name: 'P4: Reference Red (Spectral Anchor)',
      nominalRgb: { r: 200, g: 50, b: 70 },
    },
  ],
};
