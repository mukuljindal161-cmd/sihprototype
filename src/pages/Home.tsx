import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div>
      <div className="panel" style={{ padding: '32px 28px' }}>
        <h1 style={{ marginBottom: '8px' }}>ColorTrace</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Standardised Colour Analysis. Traceable Field Records.
        </p>

        <p style={{ maxWidth: '680px', marginBottom: '24px', lineHeight: '1.6' }}>
          ColorTrace is a digital application designed to operate alongside colour-based field testing
          workflows. It captures an image of a completed field-test result together with a standard
          reference colour card, performs deterministic image-based colour normalisation, produces a
          presumptive classification, and generates an auditable cryptographic record.
        </p>

        {/* Primary and Secondary CTAs above the fold */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <Link to="/test/new" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '16px' }}>
            Start New Test
          </Link>
          <Link to="/records" className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '16px' }}>
            View Test History
          </Link>
        </div>

        {/* Persistent Scientific Honesty Disclaimer */}
        <div className="disclaimer-banner" role="note">
          <strong>Presumptive Field Testing Notice:</strong> ColorTrace classifies observable colour reaction
          outcomes only. It does not identify specific substances, nor is it a replacement for laboratory
          confirmatory methods (e.g. GC-MS, HPLC). Cryptographic hashing verifies image byte integrity;
          it does not constitute certified legal admissibility.
        </div>
      </div>

      <div className="panel">
        <h2>Standard Field Testing Workflow</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          The system standardises evaluation across five sequential stages:
        </p>

        <ol style={{ paddingLeft: '22px', margin: 0, lineHeight: '1.8' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>1. Capture / Upload:</strong> Photograph the field test reaction alongside the 4-patch reference card in a single frame.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>2. Calibrate:</strong> Sample nominal reference patches (White, Gray, Blue, Red) to derive per-channel gain adjustments for ambient lighting.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>3. Analyse:</strong> Extract mean RGB, convert to HSV and CIE L*a*b* colour coordinates, and assess illumination reliability.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>4. Record:</strong> Generate a structured digital entry with operator details, timestamp, location, and SHA-256 byte digest.
          </li>
          <li>
            <strong>5. Verify:</strong> Confirm image file integrity at any point in the future by re-evaluating the cryptographic hash.
          </li>
        </ol>
      </div>

      <div className="panel">
        <h2>Reference Card Specification (CT-RC4)</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          To ensure reproducible demonstration, ColorTrace employs a standard 4-patch target:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px', background: 'var(--bg-surface-subtle)' }}>
            <div style={{ width: '100%', height: '28px', background: '#f0f0f0', border: '1px solid #ccc', marginBottom: '6px' }} />
            <strong>P1: Reference White</strong>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nominal: (240, 240, 240)</div>
          </div>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px', background: 'var(--bg-surface-subtle)' }}>
            <div style={{ width: '100%', height: '28px', background: '#808080', border: '1px solid #666', marginBottom: '6px' }} />
            <strong>P2: Neutral Gray</strong>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nominal: (128, 128, 128)</div>
          </div>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px', background: 'var(--bg-surface-subtle)' }}>
            <div style={{ width: '100%', height: '28px', background: '#2878c8', border: '1px solid #1a5694', marginBottom: '6px' }} />
            <strong>P3: Reference Blue</strong>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nominal: (40, 120, 200)</div>
          </div>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px', background: 'var(--bg-surface-subtle)' }}>
            <div style={{ width: '100%', height: '28px', background: '#c83246', border: '1px solid #8e1f2e', marginBottom: '6px' }} />
            <strong>P4: Reference Red</strong>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Nominal: (200, 50, 70)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
