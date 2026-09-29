import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecordById, saveRecord } from '../services/storage';
import { verifyImageIntegrity, VerificationResult } from '../services/crypto';
import { TestRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const RecordDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [record, setRecord] = useState<TestRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      const found = await getRecordById(id);
      if (!found) {
        setNotFound(true);
      } else {
        setRecord(found);
      }
      setIsLoading(false);
    }

    fetchRecord();
  }, [id]);

  // Real SHA-256 verification against stored image data
  const handleVerifyStoredImage = async () => {
    if (!record) return;
    setIsVerifying(true);
    setVerificationResult(null);

    const result = await verifyImageIntegrity(record.imageDataUrl, record.imageHash);
    setVerificationResult(result);

    // Update stored verification status
    const updatedRecord: TestRecord = {
      ...record,
      verificationStatus: result.verified ? 'verified' : 'failed',
      lastVerifiedAt: result.timestamp,
    };
    await saveRecord(updatedRecord);
    setRecord(updatedRecord);
    setIsVerifying(false);
  };

  // Demo Mismatch Utility: verify against an alternate uploaded image to prove mismatch detection
  const handleTestMismatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !record) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        setIsVerifying(true);
        // Compute hash of this alternative image against the record's expected hash
        const altDataUrl = reader.result;
        const result = await verifyImageIntegrity(altDataUrl, record.imageHash);
        
        setVerificationResult({
          ...result,
          message: result.verified
            ? 'INTEGRITY VERIFIED: Uploaded image bytes matched expected hash.'
            : 'DEMO MISMATCH DETECTED: The hash of the uploaded alternate test file did NOT match this record\'s stored SHA-256 hash. Demonstrates that any bit modification or substitution is cryptographically flagged.',
        });
        setIsVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '36px' }}>
        <p>Loading record from persistent storage...</p>
      </div>
    );
  }

  if (notFound || !record) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Test History', path: '/records' }, { label: 'Not Found' }]} />
        <div className="panel" role="alert">
          <h2>Record Not Found</h2>
          <p>
            The requested test record identifier <strong>"{id}"</strong> could not be located in local storage.
            It may have been purged or the URL might be invalid.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/records" className="btn btn-primary">
              Return to Test History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getResultBadge = () => {
    switch (record.result) {
      case 'presumptive_positive':
        return <span className="status-badge status-badge-positive" style={{ fontSize: '16px' }}>&#x25C6; PRESUMPTIVE POSITIVE</span>;
      case 'presumptive_negative':
        return <span className="status-badge status-badge-negative" style={{ fontSize: '16px' }}>&#x25CB; PRESUMPTIVE NEGATIVE</span>;
      case 'inconclusive':
      default:
        return <span className="status-badge status-badge-inconclusive" style={{ fontSize: '16px' }}>&#x25B2; INCONCLUSIVE</span>;
    }
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Test History', path: '/records' },
          { label: record.id },
        ]}
      />

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Field Record: {record.id}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Recorded on {new Date(record.createdAt).toLocaleString('en-GB')} by {record.operatorId}
            </div>
          </div>
          <div>{getResultBadge()}</div>
        </div>

        {/* Scientific Honesty Notice */}
        <div className="disclaimer-banner">
          <strong>Traceable Record Notice:</strong> This digital entry preserves observable test data
          and image bytes for auditability. It does NOT constitute laboratory or legal certification.
        </div>

        {/* Record Metadata & Image Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Metadata Table */}
          <div>
            <h2>Record Metadata</h2>
            <table className="data-table">
              <tbody>
                <tr>
                  <td><strong>Test ID</strong></td>
                  <td>{record.id}</td>
                </tr>
                <tr>
                  <td><strong>Operator</strong></td>
                  <td>{record.operatorId}</td>
                </tr>
                <tr>
                  <td><strong>Tested Timestamp</strong></td>
                  <td>{new Date(record.testedAt).toLocaleString('en-GB')}</td>
                </tr>
                <tr>
                  <td><strong>Location</strong></td>
                  <td>
                    {record.location.status === 'recorded' && (
                      <span>Lat {record.location.latitude}&deg;, Lon {record.location.longitude}&deg; (&plusmn;{record.location.accuracy}m)</span>
                    )}
                    {record.location.status === 'denied' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded ({record.location.reason})</span>
                    )}
                    {record.location.status === 'unavailable' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded (Unavailable)</span>
                    )}
                    {record.location.status === 'not_requested' && (
                      <span style={{ color: 'var(--text-muted)' }}>Location not recorded</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Analysis Status</strong></td>
                  <td>{record.analysisStatus}</td>
                </tr>
                <tr>
                  <td><strong>Calibrated RGB</strong></td>
                  <td>R: {record.measurements?.calibratedTestRgb?.r}, G: {record.measurements?.calibratedTestRgb?.g}, B: {record.measurements?.calibratedTestRgb?.b}</td>
                </tr>
                <tr>
                  <td><strong>HSV &amp; Luminance</strong></td>
                  <td>H: {record.measurements?.hsv?.h}&deg;, S: {record.measurements?.hsv?.s}%, L: {record.measurements?.meanLuminance}/255</td>
                </tr>
                <tr>
                  <td><strong>CIE L*a*b*</strong></td>
                  <td>L: {record.measurements?.cielab?.l}, a: {record.measurements?.cielab?.a}, b: {record.measurements?.cielab?.b}</td>
                </tr>
              </tbody>
            </table>

            {/* Rationale */}
            <div className="panel-subtle">
              <h3>Classification Rationale</h3>
              <p style={{ margin: '6px 0', fontSize: '14px' }}>
                {record.classificationDetails?.rationale || 'Deterministic threshold evaluation applied.'}
              </p>
              {record.classificationDetails?.inconclusiveReason && (
                <div style={{ color: 'var(--status-danger-text)', fontSize: '13px' }}>
                  <strong>Trigger:</strong> {record.classificationDetails.inconclusiveReason}
                </div>
              )}
            </div>
          </div>

          {/* Stored Photo */}
          <div>
            <h2>Stored Evidence Image</h2>
            <div style={{ border: '1px solid var(--border-medium)', background: '#f5f5f0', padding: '8px', textAlign: 'center' }}>
              <img
                src={record.imageDataUrl}
                alt={`Test evidence image for ${record.id}`}
                style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', border: '1px solid #ccc' }}
              />
            </div>
          </div>

        </div>

        {/* Cryptographic Hash & Verification Panel */}
        <div className="panel-subtle" style={{ marginTop: '24px' }}>
          <h2>IMAGE INTEGRITY &amp; CRYPTOGRAPHIC AUDIT</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Cryptographic SHA-256 hash computed directly on raw stored image bytes using the browser Web Crypto API:
          </p>

          <div style={{ background: '#fff', padding: '10px', border: '1px solid var(--border-medium)', fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all', marginBottom: '14px' }}>
            <strong>RECORDED SHA-256:</strong><br />
            {record.imageHash}
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleVerifyStoredImage}
              disabled={isVerifying}
              className="btn btn-primary"
            >
              {isVerifying ? 'Verifying...' : 'Verify Stored Image Integrity'}
            </button>

            {/* Demonstrable Mismatch Action */}
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Demo Mismatch Test (Select Other File)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleTestMismatchUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Verification Result Display */}
          {verificationResult && (
            <div
              className="panel"
              style={{
                background: verificationResult.verified ? 'var(--status-positive-bg)' : 'var(--status-danger-bg)',
                borderColor: verificationResult.verified ? 'var(--status-positive-border)' : 'var(--status-danger-border)',
                color: verificationResult.verified ? 'var(--status-positive-text)' : 'var(--status-danger-text)',
                margin: '12px 0 0 0',
              }}
              role="alert"
            >
              <h3 style={{ margin: '0 0 6px 0', color: 'inherit' }}>
                {verificationResult.verified ? '&#x2713; INTEGRITY VERIFIED' : '&#x26A0; INTEGRITY CHECK FAILED'}
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                {verificationResult.message}
              </p>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Tested Hash: {verificationResult.computedHash}
              </div>
            </div>
          )}

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
            <em>Note: A cryptographic hash detects bit-level modifications or byte alterations to the stored image.
            Hashing alone does not make a standalone system legally tamper-proof.</em>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link to="/records" className="btn btn-secondary">
            &larr; Back to Test History
          </Link>
        </div>
      </div>
    </div>
  );
};
