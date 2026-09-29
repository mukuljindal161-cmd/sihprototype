import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { saveRecord } from '../services/storage';
import { TestRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const { session, setSavedRecordId } = useTestSession();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!session.classification || !session.measurements || !session.testId || !session.imageDataUrl) {
    return (
      <div className="panel">
        <h2>Missing Result Data</h2>
        <p>Analysis must be completed before viewing the result summary.</p>
        <Link to="/test/analysis" className="btn btn-primary">Return to Analysis</Link>
      </div>
    );
  }

  const { classification, measurements, testId, operatorId, testedAt, location, imageDataUrl, imageHash } = session;

  const getResultBadge = () => {
    switch (classification.result) {
      case 'presumptive_positive':
        return (
          <div className="status-badge status-badge-positive" style={{ fontSize: '18px', padding: '8px 16px' }}>
            <span>&#x25C6;</span> {/* Diamond icon */}
            <span>PRESUMPTIVE POSITIVE</span>
          </div>
        );
      case 'presumptive_negative':
        return (
          <div className="status-badge status-badge-negative" style={{ fontSize: '18px', padding: '8px 16px' }}>
            <span>&#x25CB;</span> {/* Circle icon */}
            <span>PRESUMPTIVE NEGATIVE</span>
          </div>
        );
      case 'inconclusive':
      default:
        return (
          <div className="status-badge status-badge-inconclusive" style={{ fontSize: '18px', padding: '8px 16px' }}>
            <span>&#x25B2;</span> {/* Triangle icon */}
            <span>INCONCLUSIVE</span>
          </div>
        );
    }
  };

  const handleSaveRecord = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const record: TestRecord = {
        id: testId,
        operatorId,
        createdAt: new Date().toISOString(),
        testedAt: testedAt || new Date().toISOString(),
        location,
        imageDataUrl,
        imageHash: imageHash || 'UNHASHED',
        result: classification.result,
        analysisStatus: classification.inconclusiveReason ? 'completed_with_warnings' : 'completed',
        measurements,
        classificationDetails: classification,
        verificationStatus: 'not_verified',
      };

      await saveRecord(record);
      setSavedRecordId(testId);
      navigate('/test/saved');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage write failed.';
      setSaveError(`Failed to save record into persistent storage: ${msg}`);
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Start New Test', path: '/test/new' },
          { label: 'Capture', path: '/test/capture' },
          { label: 'Region Review', path: '/test/review' },
          { label: 'Analysis', path: '/test/analysis' },
          { label: `Result (${testId})` },
        ]}
      />

      <div className="panel">
        <h1>COLORTRACE RESULT</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Record Status: <strong>NOT YET SAVED</strong>
        </p>

        {saveError && (
          <div className="panel" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-border)', color: 'var(--status-danger-text)' }}>
            <strong>Storage Error:</strong> {saveError}
          </div>
        )}

        {/* Classification Banner */}
        <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Field Test Presumptive Outcome
            </div>
            {getResultBadge()}
          </div>
          
          <button
            type="button"
            onClick={handleSaveRecord}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '16px' }}
          >
            {isSaving ? 'Persisting Record...' : 'Save Test Record'}
          </button>
        </div>

        {/* Scientific Honesty Notice */}
        <div className="disclaimer-banner">
          <strong>Mandatory Field Notice:</strong> This is a presumptive field-test evaluation.
          It classifies observable colour changes under calibrated illumination and does NOT confirm
          specific chemical identity. Confirmatory laboratory testing is required for legal and forensic proceedings.
        </div>

        {/* Metadata Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
          
          {/* Metadata Details */}
          <div>
            <h2>Record Information</h2>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Test ID</strong></td>
                  <td>{testId}</td>
                </tr>
                <tr>
                  <td><strong>Operator ID</strong></td>
                  <td>{operatorId}</td>
                </tr>
                <tr>
                  <td><strong>Tested Date &amp; Time</strong></td>
                  <td>{new Date(testedAt).toLocaleString('en-GB')}</td>
                </tr>
                <tr>
                  <td><strong>Geolocation</strong></td>
                  <td>
                    {location.status === 'recorded' && (
                      <span>Lat {location.latitude}&deg;, Lon {location.longitude}&deg; (&plusmn;{location.accuracy}m)</span>
                    )}
                    {location.status === 'denied' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded (Denied: {location.reason})</span>
                    )}
                    {location.status === 'unavailable' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded (Unavailable)</span>
                    )}
                    {location.status === 'not_requested' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded (Not requested)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Analysis Status</strong></td>
                  <td>{classification.inconclusiveReason ? 'Completed with Warnings' : 'Completed Normally'}</td>
                </tr>
                <tr>
                  <td><strong>Cryptographic Hash (SHA-256)</strong></td>
                  <td style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '12px' }}>
                    {imageHash}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Rationale and Details */}
            <div className="panel-subtle" style={{ marginTop: '14px' }}>
              <h3>Decision Rule Rationale</h3>
              <p style={{ margin: '6px 0', fontSize: '14px' }}>{classification.rationale}</p>
              {classification.inconclusiveReason && (
                <div style={{ marginTop: '6px', color: 'var(--status-danger-text)', fontSize: '13px' }}>
                  <strong>Trigger Condition:</strong> {classification.inconclusiveReason}
                </div>
              )}
            </div>
          </div>

          {/* Captured Image Display */}
          <div>
            <h2>Captured Test Photo</h2>
            <div style={{ border: '1px solid var(--border-medium)', background: '#f5f5f0', padding: '8px', textAlign: 'center' }}>
              <img
                src={imageDataUrl}
                alt="Captured field test showing test reaction vessel and reference card"
                style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Raw image bytes stored directly with record for cryptographic audit.
            </div>
          </div>

        </div>

        {/* Back link */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link to="/test/analysis" className="btn btn-secondary btn-sm">
            &larr; Back to Analysis Output
          </Link>
        </div>
      </div>
    </div>
  );
};
