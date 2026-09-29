import React from 'react';
import { Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';

interface FlowGuardProps {
  children: React.ReactNode;
  requireImage?: boolean;
  requireRegions?: boolean;
  requireAnalysis?: boolean;
}

export const FlowGuard: React.FC<FlowGuardProps> = ({
  children,
  requireImage = false,
  requireRegions = false,
  requireAnalysis = false,
}) => {
  const { session } = useTestSession();

  if (!session.testId) {
    return (
      <div className="panel" role="alert">
        <h2>No Active Test Session Found</h2>
        <p>
          You accessed a mid-workflow page directly without initiating a test record.
          Each test requires an auto-generated Test ID and operator assignment before proceeding.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to="/test/new" className="btn btn-primary">
            Start New Test
          </Link>
          <Link to="/" className="btn btn-secondary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (requireImage && !session.imageDataUrl) {
    return (
      <div className="panel" role="alert">
        <h2>Image Not Yet Captured</h2>
        <p>
          Test session <strong>{session.testId}</strong> is active, but an image of the test result
          and reference card has not been captured or uploaded yet.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to="/test/capture" className="btn btn-primary">
            Go to Capture Screen
          </Link>
          <Link to="/" className="btn btn-secondary">
            Cancel Test
          </Link>
        </div>
      </div>
    );
  }

  if (requireRegions && (!session.referenceCardRoi || !session.testRoi)) {
    return (
      <div className="panel" role="alert">
        <h2>Regions of Interest Not Selected</h2>
        <p>
          Please select the reference card area and test reaction region on the review screen before proceeding.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to="/test/review" className="btn btn-primary">
            Return to Image Review
          </Link>
        </div>
      </div>
    );
  }

  if (requireAnalysis && (!session.measurements || !session.classification)) {
    return (
      <div className="panel" role="alert">
        <h2>Colour Analysis Not Yet Completed</h2>
        <p>
          Calibration and colour extraction must be performed before viewing the final test result.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to="/test/analysis" className="btn btn-primary">
            Run Colour Analysis
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
