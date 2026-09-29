import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const NotFound: React.FC = () => {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Page Not Found' }]} />

      <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '600px', margin: '20px auto' }}>
        <h1 style={{ marginBottom: '12px' }}>404 &mdash; Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
          The requested URL path does not exist in ColorTrace. Please verify the URL or return to
          the home screen to start a new field test or view existing records.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/records" className="btn btn-secondary">
            View Test History
          </Link>
        </div>
      </div>
    </div>
  );
};
