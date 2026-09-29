import React from 'react';
import { Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Saved: React.FC = () => {
  const { session } = useTestSession();
  const testId = session.savedRecordId || session.testId || 'CT-RECORD';

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Start New Test', path: '/test/new' },
          { label: 'Record Saved' },
        ]}
      />

      <div className="panel" style={{ padding: '36px 28px', maxWidth: '640px', margin: '20px auto' }}>
        <h1 style={{ marginBottom: '8px' }}>TEST RECORD SAVED</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
          Test ID: <strong>{testId}</strong>
        </p>

        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Integrity record generated successfully. The captured image data and calculated metrics
          have been committed to local persistent storage with an immutable SHA-256 cryptographic digest.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to={`/records/${testId}`} className="btn btn-primary">
            View Record Details
          </Link>
          <Link to="/records" className="btn btn-secondary">
            Back to Test History
          </Link>
          <Link to="/test/new" className="btn btn-secondary">
            Start Another Test
          </Link>
        </div>
      </div>
    </div>
  );
};
