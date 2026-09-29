import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { generateNextTestId, seedDemoRecordsIfEmpty } from '../services/storage';
import { LocationData } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const StartTest: React.FC = () => {
  const navigate = useNavigate();
  const { startNewSession } = useTestSession();

  const [testId, setTestId] = useState<string>('Loading...');
  const [operatorId, setOperatorId] = useState<string>('OP-001 (DEMO)');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [location, setLocation] = useState<LocationData>({ status: 'not_requested' });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    // Ensure seeds exist and compute next sequential ID
    async function init() {
      await seedDemoRecordsIfEmpty();
      const id = await generateNextTestId();
      setTestId(id);
      
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    }
    init();
  }, []);

  const handleRequestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocation({
        status: 'unavailable',
        reason: 'Geolocation API is not supported by this browser.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          status: 'recorded',
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setIsLocating(false);
      },
      (err) => {
        let reason = 'Unknown location error.';
        if (err.code === err.PERMISSION_DENIED) {
          reason = 'Permission was denied by operator/browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reason = 'Position information is unavailable from device sensors.';
        } else if (err.code === err.TIMEOUT) {
          reason = 'Request to obtain location timed out.';
        }
        setLocation({
          status: 'denied',
          reason,
        });
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId || testId === 'Loading...') return;

    // Start session in context
    startNewSession(testId, operatorId, location);
    navigate('/test/capture');
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Start New Test' }]} />

      <div className="panel">
        <h1>Initiate Field Test Record</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Please review the session metadata prior to image acquisition. The Test ID is sequentially
          generated based on stored historical records.
        </p>

        <form onSubmit={handleProceed}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            <div>
              <label htmlFor="test-id" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                Test Identifier (Auto-generated)
              </label>
              <input
                id="test-id"
                type="text"
                value={testId}
                readOnly
                style={{ backgroundColor: 'var(--bg-surface-subtle)', fontWeight: 'bold' }}
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Format: CT-YYYY-NNNN. Increments automatically.
              </span>
            </div>

            <div>
              <label htmlFor="operator-id" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                Operator Identifier
              </label>
              <input
                id="operator-id"
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                required
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Demo operator profile. Prototype does not require authentication.
              </span>
            </div>

            <div>
              <label htmlFor="timestamp" style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                Session Timestamp
              </label>
              <input
                id="timestamp"
                type="text"
                value={currentTime}
                readOnly
                style={{ backgroundColor: 'var(--bg-surface-subtle)' }}
              />
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Device local time at initiation.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                Geolocation Acquisition
              </label>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className="btn btn-secondary btn-sm"
                >
                  {isLocating ? 'Acquiring...' : location.status === 'recorded' ? 'Re-acquire Location' : 'Acquire GPS Coordinates'}
                </button>
              </div>

              <div style={{ fontSize: '13.5px', padding: '6px 8px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                {location.status === 'recorded' && (
                  <div>
                    <strong>Recorded:</strong> Lat {location.latitude}°, Lon {location.longitude}° (±{location.accuracy}m)
                  </div>
                )}
                {location.status === 'denied' && (
                  <div style={{ color: 'var(--status-danger-text)' }}>
                    <strong>Denied:</strong> {location.reason}
                  </div>
                )}
                {location.status === 'unavailable' && (
                  <div style={{ color: 'var(--text-muted)' }}>
                    <strong>Unavailable:</strong> {location.reason}
                  </div>
                )}
                {location.status === 'not_requested' && (
                  <div style={{ color: 'var(--text-muted)' }}>
                    Coordinates not requested. You may proceed without GPS.
                  </div>
                )}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Continue to Image Capture
            </button>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
