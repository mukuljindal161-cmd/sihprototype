import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecords, seedDemoRecordsIfEmpty } from '../services/storage';
import { TestRecord } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const History: React.FC = () => {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      await seedDemoRecordsIfEmpty();
      const all = await getAllRecords();
      setRecords(all);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredRecords = records.filter((r) => {
    // Search query matches test ID or operator ID
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !q || 
      r.id.toLowerCase().includes(q) || 
      r.operatorId.toLowerCase().includes(q);

    // Result filter
    const matchesResult = 
      resultFilter === 'all' || 
      r.result === resultFilter;

    // Verification filter
    const matchesVerification = 
      verificationFilter === 'all' || 
      r.verificationStatus === verificationFilter;

    return matchesSearch && matchesResult && matchesVerification;
  });

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'presumptive_positive':
        return <span className="status-badge status-badge-positive">&#x25C6; POSITIVE</span>;
      case 'presumptive_negative':
        return <span className="status-badge status-badge-negative">&#x25CB; NEGATIVE</span>;
      case 'inconclusive':
      default:
        return <span className="status-badge status-badge-inconclusive">&#x25B2; INCONCLUSIVE</span>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span style={{ color: 'var(--status-positive-text)', fontWeight: 'bold' }}>&#x2713; Verified</span>;
      case 'failed':
        return <span style={{ color: 'var(--status-danger-text)', fontWeight: 'bold' }}>&#x26A0; Mismatch</span>;
      case 'not_verified':
      default:
        return <span style={{ color: 'var(--text-dim)' }}>Not Checked</span>;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setResultFilter('all');
    setVerificationFilter('all');
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Test History' }]} />

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Field Test History</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Audit log of captured field tests and cryptographic verification records.
            </p>
          </div>
          <Link to="/test/new" className="btn btn-primary">
            + Start New Test
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '20px 0', background: 'var(--bg-surface-subtle)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <label htmlFor="search-input" style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
              Search (Test ID / Operator)
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="e.g. CT-2026 or OP-001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="result-filter" style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
              Filter by Presumptive Outcome
            </label>
            <select
              id="result-filter"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="presumptive_positive">Presumptive Positive</option>
              <option value="presumptive_negative">Presumptive Negative</option>
              <option value="inconclusive">Inconclusive</option>
            </select>
          </div>

          <div>
            <label htmlFor="verification-filter" style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
              Filter by Hash Integrity
            </label>
            <select
              id="verification-filter"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="all">All Integrity States</option>
              <option value="verified">Verified (Match)</option>
              <option value="not_verified">Not Checked</option>
              <option value="failed">Failed (Mismatch)</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Loading audit records from persistent storage...
          </div>
        )}

        {/* Empty Database State */}
        {!isLoading && records.length === 0 && (
          <div className="panel-subtle" style={{ textAlign: 'center', padding: '36px' }}>
            <h3>No Records in Storage</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              No field test records have been performed or saved yet.
            </p>
            <Link to="/test/new" className="btn btn-primary">
              Perform First Test
            </Link>
          </div>
        )}

        {/* Empty Filtered State */}
        {!isLoading && records.length > 0 && filteredRecords.length === 0 && (
          <div className="panel-subtle" style={{ textAlign: 'center', padding: '24px' }}>
            <p><strong>No records match the current filter criteria.</strong></p>
            <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Records Table / Stacked Card on Mobile */}
        {!isLoading && filteredRecords.length > 0 && (
          <table className="data-table table-responsive-stack">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Tested Date &amp; Time</th>
                <th>Presumptive Result</th>
                <th>Operator</th>
                <th>Integrity Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td data-label="Test ID">
                    <strong>{r.id}</strong>
                  </td>
                  <td data-label="Tested Date &amp; Time">
                    {new Date(r.testedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td data-label="Presumptive Result">
                    {getResultBadge(r.result)}
                  </td>
                  <td data-label="Operator">
                    {r.operatorId}
                  </td>
                  <td data-label="Integrity Status">
                    {getVerificationBadge(r.verificationStatus)}
                  </td>
                  <td data-label="Actions">
                    <Link to={`/records/${r.id}`} className="btn btn-secondary btn-sm">
                      Open Record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
