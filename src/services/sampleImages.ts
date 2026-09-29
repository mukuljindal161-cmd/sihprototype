/**
 * High-fidelity reproducible sample images for testing and evaluation.
 * Generates test images containing both the 4-patch reference card and test reaction areas.
 */

function createTestImageCanvas(
  testReactionRgb: string,
  testLabel: string,
  lightingGradient = false
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background bench/surface
  ctx.fillStyle = '#eceae4';
  ctx.fillRect(0, 0, 640, 480);

  if (lightingGradient) {
    // Add shadow gradient to simulate poor lighting
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);
  }

  // Work surface texture border
  ctx.strokeStyle = '#d5d2c8';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 620, 460);

  // 1. Draw Reference Card on Left
  const cardX = 40;
  const cardY = 120;
  const cardW = 200;
  const cardH = 240;

  // Card backing
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Card header text (Times New Roman)
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 12px "Times New Roman", Times, serif';
  ctx.fillText('COLORTRACE REF CARD', cardX + 16, cardY + 24);
  ctx.font = 'italic 10px "Times New Roman", Times, serif';
  ctx.fillText('Model CT-RC4 (Prototype)', cardX + 16, cardY + 40);

  // Reference Patches
  // Patch 1: White
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(cardX + 15, cardY + 55, 75, 75);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.strokeRect(cardX + 15, cardY + 55, 75, 75);

  // Patch 2: Neutral Gray (50%)
  ctx.fillStyle = '#808080';
  ctx.fillRect(cardX + 110, cardY + 55, 75, 75);
  ctx.strokeRect(cardX + 110, cardY + 55, 75, 75);

  // Patch 3: Reference Blue
  ctx.fillStyle = '#2878c8';
  ctx.fillRect(cardX + 15, cardY + 145, 75, 75);
  ctx.strokeRect(cardX + 15, cardY + 145, 75, 75);

  // Patch 4: Reference Red
  ctx.fillStyle = '#c83246';
  ctx.fillRect(cardX + 110, cardY + 145, 75, 75);
  ctx.strokeRect(cardX + 110, cardY + 145, 75, 75);

  // Patch labels
  ctx.fillStyle = '#444';
  ctx.font = '9px "Times New Roman", Times, serif';
  ctx.fillText('WHT', cardX + 40, cardY + 95);
  ctx.fillText('GRY', cardX + 135, cardY + 95);
  ctx.fillText('BLU', cardX + 40, cardY + 185);
  ctx.fillText('RED', cardX + 135, cardY + 185);

  // 2. Draw Test Reaction Vessel / Spot Plate on Right
  const wellX = 330;
  const wellY = 120;
  const wellW = 240;
  const wellH = 240;

  // Spot plate container
  ctx.fillStyle = '#faf9f5';
  ctx.fillRect(wellX, wellY, wellW, wellH);
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(wellX, wellY, wellW, wellH);

  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px "Times New Roman", Times, serif';
  ctx.fillText('REACTION VESSEL / SPOT WELL', wellX + 20, wellY + 25);

  // Circular Reaction Well cavity
  ctx.beginPath();
  ctx.arc(wellX + 120, wellY + 130, 80, 0, Math.PI * 2);
  ctx.fillStyle = '#e4e1d7';
  ctx.fill();
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Liquid reaction meniscus
  ctx.beginPath();
  ctx.arc(wellX + 120, wellY + 130, 68, 0, Math.PI * 2);
  ctx.fillStyle = testReactionRgb;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Caption at bottom
  ctx.fillStyle = '#555';
  ctx.font = 'italic 11px "Times New Roman", Times, serif';
  ctx.fillText(`Sample: ${testLabel}`, wellX + 20, wellY + 230);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export interface SampleImageItem {
  id: string;
  name: string;
  description: string;
  expectedResult: string;
  dataUrl: string;
  defaultRefRoi: { x: number; y: number; width: number; height: number };
  defaultTestRoi: { x: number; y: number; width: number; height: number };
}

export function getSampleImages(): SampleImageItem[] {
  return [
    {
      id: 'sample-positive',
      name: 'Sample 1: Distinct Chromogenic Shift (Blue Complex)',
      description: 'Standard simulated positive reaction displaying target cobalt thiocyanate blue coloration alongside reference card.',
      expectedResult: 'PRESUMPTIVE POSITIVE',
      dataUrl: createTestImageCanvas('#2a70b8', 'Target Blue Chromogenic Complex'),
      defaultRefRoi: { x: 40, y: 120, width: 200, height: 240 },
      defaultTestRoi: { x: 410, y: 210, width: 80, height: 80 },
    },
    {
      id: 'sample-negative',
      name: 'Sample 2: Unreacted Baseline Reagent (Pale Amber)',
      description: 'Standard simulated negative test displaying unreacted pale straw/amber reagent alongside reference card.',
      expectedResult: 'PRESUMPTIVE NEGATIVE',
      dataUrl: createTestImageCanvas('#d8c285', 'Unreacted Baseline Reagent'),
      defaultRefRoi: { x: 40, y: 120, width: 200, height: 240 },
      defaultTestRoi: { x: 410, y: 210, width: 80, height: 80 },
    },
    {
      id: 'sample-inconclusive',
      name: 'Sample 3: Shadow / High Variance (Inconclusive)',
      description: 'Simulated adverse condition with uneven shadow across the reference card triggering reliability limits.',
      expectedResult: 'INCONCLUSIVE',
      dataUrl: createTestImageCanvas('#485563', 'Low Lighting / Shadow Sample', true),
      defaultRefRoi: { x: 40, y: 120, width: 200, height: 240 },
      defaultTestRoi: { x: 410, y: 210, width: 80, height: 80 },
    },
  ];
}
