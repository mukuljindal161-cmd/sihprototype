import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { runColourAnalysis } from '../services/analysis';
import { computeDataUrlHash } from '../services/crypto';
import { ColourMeasurements, ClassificationDetails } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { session, setAnalysisResults } = useTestSession();

  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [measurements, setMeasurements] = useState<ColourMeasurements | null>(null);
  const [classification, setClassification] = useState<ClassificationDetails | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  useEffect(() => {
    async function performAnalysis() {
      if (!session.imageDataUrl || !session.referenceCardRoi || !session.testRoi) {
        setErrorMsg('Missing image or region specifications. Please restart region review.');
        setIsProcessing(false);
        return;
      }

      try {
        // Load image into off-screen canvas to sample true pixel bytes
        const img = new Image();
        img.src = session.imageDataUrl;
        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = () => reject(new Error('Failed to load image buffer for analysis.'));
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 640;
        canvas.height = img.naturalHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable.');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Run deterministic colour calibration and feature extraction
        const analysisOutput = runColourAnalysis(
          ctx,
          session.referenceCardRoi,
          session.testRoi
        );

        // Compute SHA-256 hash of the exact image data
        const hash = await computeDataUrlHash(session.imageDataUrl);

        setMeasurements(analysisOutput.measurements);
        setClassification(analysisOutput.classification);
        setComputedHash(hash);

        // Update context
        setAnalysisResults(analysisOutput.measurements, analysisOutput.classification, hash);
        setIsProcessing(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown analysis error.';
        setErrorMsg(msg);
        setIsProcessing(false);
      }
    }

    performAnalysis();
  }, [session.imageDataUrl, session.referenceCardRoi, session.testRoi]);

  const handleProceed = () => {
    navigate('/test/result');
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Start New Test', path: '/test/new' },
          { label: 'Capture', path: '/test/capture' },
          { label: 'Region Review', path: '/test/review' },
          { label: `Analysis (${session.testId})` },
        ]}
      />

      <div className="panel">
        <h1>Colour Normalisation &amp; Metric Extraction</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Session: <strong>{session.testId}</strong> &bull; Pipeline: Image Acquisition &rarr; Reference Patch Sampling &rarr; Gain Correction &rarr; Color Space Conversion.
        </p>

        {isProcessing && (
          <div className="panel-subtle" style={{ textAlign: 'center', padding: '30px' }}>
            <p><strong>Extracting pixel matrices and computing channel normalisation...</strong></p>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Calculating mean RGB, HSV, and CIE L*a*b* coordinates.</span>
          </div>
        )}

        {errorMsg && (
          <div className="panel" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-border)', color: 'var(--status-danger-text)' }}>
            <strong>Analysis Failure:</strong> {errorMsg}
          </div>
        )}

        {!isProcessing && measurements && classification && (
          <div>
            <div className="disclaimer-banner">
              <strong>Deterministic Analysis Output:</strong> Real computed values from client-side canvas pixel data.
              No synthetic confidence percentages or statistical embellishments are applied.
            </div>

            {/* 1. Reference Card Calibration Gains */}
            <div className="panel-subtle">
              <h3>1. Reference Card Normalisation (Illumination Correction)</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Per-channel gain factors calculated against nominal neutral gray target (128, 128, 128):
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border-subtle)', padding: '8px', background: '#fff' }}>
                  <strong>Red Gain (kR):</strong> {measurements.gainCorrection.r}×
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', padding: '8px', background: '#fff' }}>
                  <strong>Green Gain (kG):</strong> {measurements.gainCorrection.g}×
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', padding: '8px', background: '#fff' }}>
                  <strong>Blue Gain (kB):</strong> {measurements.gainCorrection.b}×
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', padding: '8px', background: '#fff' }}>
                  <strong>Patch Variance:</strong> σ = {measurements.referenceVariance} (Max allowable: 45)
                </div>
              </div>
            </div>

            {/* 2. Measured Reaction Colour Coordinates */}
            <div className="panel-subtle">
              <h3>2. Test Reaction Region Features</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                Extracted mean coordinates across test reaction ROI ({session.testRoi?.width}×{session.testRoi?.height} px):
              </p>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric Space</th>
                    <th>Extracted Values</th>
                    <th>Reference / Swatch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Raw Sample (sRGB)</strong></td>
                    <td>R: {measurements.rawTestRgb.r}, G: {measurements.rawTestRgb.g}, B: {measurements.rawTestRgb.b}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '32px',
                          height: '18px',
                          verticalAlign: 'middle',
                          border: '1px solid #333',
                          backgroundColor: `rgb(${measurements.rawTestRgb.r}, ${measurements.rawTestRgb.g}, ${measurements.rawTestRgb.b})`,
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Calibrated Sample (sRGB)</strong></td>
                    <td>R: {measurements.calibratedTestRgb.r}, G: {measurements.calibratedTestRgb.g}, B: {measurements.calibratedTestRgb.b}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '32px',
                          height: '18px',
                          verticalAlign: 'middle',
                          border: '1px solid #333',
                          backgroundColor: `rgb(${measurements.calibratedTestRgb.r}, ${measurements.calibratedTestRgb.g}, ${measurements.calibratedTestRgb.b})`,
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td><strong>HSV Model</strong></td>
                    <td>Hue: {measurements.hsv.h}&deg;, Saturation: {measurements.hsv.s}%, Value: {measurements.hsv.v}%</td>
                    <td>Target band: 180&deg; &ndash; 260&deg;</td>
                  </tr>
                  <tr>
                    <td><strong>CIE L*a*b* Coordinates</strong></td>
                    <td>L*: {measurements.cielab.l}, a*: {measurements.cielab.a}, b*: {measurements.cielab.b}</td>
                    <td>D65 Standard Illuminant</td>
                  </tr>
                  <tr>
                    <td><strong>Mean Luminance</strong></td>
                    <td>{measurements.meanLuminance} / 255</td>
                    <td>Acceptable threshold: 35 &ndash; 245</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Cryptographic Hash Preview */}
            <div className="panel-subtle">
              <h3>3. Cryptographic Image Byte Digest</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Computed SHA-256 digest of captured raw image bytes via Web Crypto API:
              </p>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '13px', padding: '6px', background: '#fff', border: '1px solid var(--border-medium)' }}>
                {computedHash}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button type="button" onClick={handleProceed} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                View Presumptive Result &rarr;
              </button>
              <Link to="/test/review" className="btn btn-secondary">
                &larr; Adjust Regions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
