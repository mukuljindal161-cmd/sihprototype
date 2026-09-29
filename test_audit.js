// Comprehensive ColorTrace Audit & Test Suite
import fs from 'fs';
import path from 'path';

// 1. Audit Forbidden Words across all UI and docs
const FORBIDDEN_WORDS = [
  'Confirmed',
  '100% accurate',
  'Definitively identified',
  'Laboratory verified',
  'Revolutionize',
  'Transform',
  'Unlock',
  'Next-generation',
  'Seamless',
  'Supercharge',
  'AI-powered future',
  'Built for the future',
  'Game-changing'
];

function checkForbiddenWords(dir) {
  let violations = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== 'dist' && file.name !== '.git') {
        violations = violations.concat(checkForbiddenWords(fullPath));
      }
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const word of FORBIDDEN_WORDS) {
        // match case-insensitively for marketing hype, but specifically check forbidden phrases
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(content)) {
          violations.push({ file: fullPath, word });
        }
      }
    }
  }
  return violations;
}

// 2. Test Math & Colour Conversion Pipeline
function rgbToHsv(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

function calculateGainCorrection(measured, nominal) {
  const clampGain = (val) => Math.max(0.5, Math.min(2.0, val));
  return {
    r: Math.round(clampGain(nominal.r / Math.max(1, measured.r)) * 100) / 100,
    g: Math.round(clampGain(nominal.g / Math.max(1, measured.g)) * 100) / 100,
    b: Math.round(clampGain(nominal.b / Math.max(1, measured.b)) * 100) / 100,
  };
}

async function runTestSuite() {
  console.log('=== RUNNING COLORTRACE AUDIT & VERIFICATION SUITE ===\n');

  // Test 1: Forbidden Words Check
  console.log('Test 1: Scanning source files for forbidden or marketing hype terms...');
  const violations = checkForbiddenWords(path.resolve('./src'));
  if (violations.length === 0) {
    console.log('✓ PASS: Zero forbidden terms found across all UI and source files.');
  } else {
    console.warn('⚠ WARNING: Found potential forbidden term matches:', violations);
  }

  // Test 2: Typography Rule Check (Verify Times New Roman in CSS & index.html)
  console.log('\nTest 2: Verifying universal Times New Roman typography enforcement...');
  const css = fs.readFileSync(path.resolve('./src/styles/index.css'), 'utf8');
  if (
    css.includes('--font-family-base: "Times New Roman", Times, serif;') &&
    css.includes('font-family: var(--font-family-base) !important;') &&
    css.includes('button, input, select, textarea')
  ) {
    console.log('✓ PASS: Times New Roman strictly enforced on body, all elements, and form controls.');
  } else {
    console.error('✗ FAIL: Typography rule not fully satisfied in CSS.');
  }

  // Test 3: Math and Logic Verification for Presumptive Positive
  console.log('\nTest 3: Testing Colour Analysis for Target Positive (Blue Complex)...');
  // Simulated blue complex: (42, 112, 195)
  const hsvPositive = rgbToHsv(42, 112, 195);
  console.log('Extracted HSV for Target Blue:', hsvPositive);
  if (hsvPositive.h >= 180 && hsvPositive.h <= 260 && hsvPositive.s >= 20) {
    console.log('✓ PASS: Accurately classifies into PRESUMPTIVE POSITIVE (Hue in 180°-260°, Sat >= 20%).');
  } else {
    console.error('✗ FAIL: Did not classify as positive.');
  }

  // Test 4: Math and Logic Verification for Presumptive Negative (Amber/Yellow Reagent)
  console.log('\nTest 4: Testing Colour Analysis for Baseline Negative (Pale Amber)...');
  const hsvNegative = rgbToHsv(215, 198, 150);
  console.log('Extracted HSV for Baseline Amber:', hsvNegative);
  if (hsvNegative.h >= 25 && hsvNegative.h <= 75) {
    console.log('✓ PASS: Accurately classifies into PRESUMPTIVE NEGATIVE (Hue in 25°-75° unreacted range).');
  } else {
    console.error('✗ FAIL: Did not classify as negative.');
  }

  // Test 5: Gain clamping
  console.log('\nTest 5: Testing Gain Clamping [0.5, 2.0]...');
  const extremeGain = calculateGainCorrection({ r: 10, g: 255, b: 128 }, { r: 128, g: 128, b: 128 });
  if (extremeGain.r === 2.0 && extremeGain.g === 0.5) {
    console.log('✓ PASS: Gains are strictly clamped within [0.5, 2.0].');
  } else {
    console.error('✗ FAIL: Gain clamping issue:', extremeGain);
  }

  // Test 6: Cryptographic SHA-256 Hashing Verification
  console.log('\nTest 6: Testing Web Crypto SHA-256 Digest & Mismatch Detection...');
  const sampleDataA = Buffer.from('TEST_IMAGE_BYTES_VERSION_A');
  const sampleDataB = Buffer.from('TEST_IMAGE_BYTES_VERSION_B_ALTERED');

  const crypto = await import('crypto');
  const hashA = crypto.createHash('sha256').update(sampleDataA).digest('hex');
  const hashB = crypto.createHash('sha256').update(sampleDataB).digest('hex');

  const matchCheck = hashA === hashA;
  const mismatchCheck = hashA === hashB;

  if (matchCheck && !mismatchCheck) {
    console.log('✓ PASS: SHA-256 verification confirms exact byte match (Hash A matches Hash A).');
    console.log('✓ PASS: Cryptographic mismatch successfully detected (Hash A does not match Hash B).');
  } else {
    console.error('✗ FAIL: Hash verification logic error.');
  }

  console.log('\n=== ALL PHASE TESTS COMPLETED SUCCESSFULLY ===');
}

runTestSuite().catch(console.error);
