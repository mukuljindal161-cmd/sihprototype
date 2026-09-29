import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { RegionOfInterest } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const Review: React.FC = () => {
  const navigate = useNavigate();
  const { session, setRegions } = useTestSession();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Default ROIs or restore from session
  const [refRoi, setRefRoi] = useState<RegionOfInterest>(
    session.referenceCardRoi || { x: 40, y: 120, width: 200, height: 240 }
  );
  const [testRoi, setTestRoi] = useState<RegionOfInterest>(
    session.testRoi || { x: 410, y: 210, width: 80, height: 80 }
  );

  const [activeRoiTarget, setActiveRoiTarget] = useState<'ref' | 'test'>('test');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redraw canvas with image and ROI overlays
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match natural image size
    canvas.width = img.naturalWidth || 640;
    canvas.height = img.naturalHeight || 480;

    // Draw background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 1. Draw Reference Card Box (Blue/Slate)
    ctx.strokeStyle = '#2b6cb0';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(refRoi.x, refRoi.y, refRoi.width, refRoi.height);

    ctx.fillStyle = 'rgba(43, 108, 176, 0.12)';
    ctx.fillRect(refRoi.x, refRoi.y, refRoi.width, refRoi.height);

    // Label for Reference Card
    ctx.setLineDash([]);
    ctx.fillStyle = '#2b6cb0';
    ctx.fillRect(refRoi.x, Math.max(0, refRoi.y - 20), 160, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Times New Roman", Times, serif';
    ctx.fillText('Reference Card Area', refRoi.x + 6, Math.max(14, refRoi.y - 5));

    // 2. Draw Test Region Box (Dark Green / Solid)
    ctx.strokeStyle = '#276749';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.strokeRect(testRoi.x, testRoi.y, testRoi.width, testRoi.height);

    ctx.fillStyle = 'rgba(39, 103, 73, 0.18)';
    ctx.fillRect(testRoi.x, testRoi.y, testRoi.width, testRoi.height);

    // Label for Test Region
    ctx.fillStyle = '#276749';
    ctx.fillRect(testRoi.x, Math.max(0, testRoi.y - 20), 150, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Times New Roman", Times, serif';
    ctx.fillText('Test Reaction ROI', testRoi.x + 6, Math.max(14, testRoi.y - 5));
  }, [refRoi, testRoi]);

  useEffect(() => {
    if (!session.imageDataUrl) return;
    const img = new Image();
    img.src = session.imageDataUrl;
    img.onload = () => {
      imageElementRef.current = img;
      renderCanvas();
    };
  }, [session.imageDataUrl, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [refRoi, testRoi, renderCanvas]);

  // Canvas Mouse & Touch Coordinate Mapper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    setIsDragging(true);
    setDragStart(pt);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) return;
    const current = getCanvasCoords(e);

    const x = Math.min(dragStart.x, current.x);
    const y = Math.min(dragStart.y, current.y);
    const width = Math.max(10, Math.abs(current.x - dragStart.x));
    const height = Math.max(10, Math.abs(current.y - dragStart.y));

    if (activeRoiTarget === 'ref') {
      setRefRoi({ x, y, width, height });
    } else {
      setTestRoi({ x, y, width, height });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Keyboard Nudge / Numeric Adjustments for Accessibility
  const adjustRoi = (
    field: keyof RegionOfInterest,
    val: number,
    target: 'ref' | 'test'
  ) => {
    const setter = target === 'ref' ? setRefRoi : setTestRoi;
    setter((prev) => ({
      ...prev,
      [field]: Math.max(field === 'width' || field === 'height' ? 10 : 0, val),
    }));
  };

  const handleProceed = () => {
    setErrorMsg(null);
    if (testRoi.width < 8 || testRoi.height < 8) {
      setErrorMsg('Test reaction region must be at least 8×8 pixels in size.');
      return;
    }
    if (refRoi.width < 15 || refRoi.height < 15) {
      setErrorMsg('Reference card region must be at least 15×15 pixels in size.');
      return;
    }

    setRegions(refRoi, testRoi);
    navigate('/test/analysis');
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Start New Test', path: '/test/new' },
          { label: 'Capture', path: '/test/capture' },
          { label: `Region Review (${session.testId})` },
        ]}
      />

      <div className="panel">
        <h1>Review &amp; Region of Interest Selection</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Session: <strong>{session.testId}</strong> &bull; Mark the calibration reference card and the
          test reaction sample using click-and-drag or the coordinate inputs below.
        </p>

        {errorMsg && (
          <div className="panel" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-border)', color: 'var(--status-danger-text)' }}>
            <strong>Validation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Region Target Selector */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold' }}>Active Drawing Target:</span>
          
          <button
            type="button"
            onClick={() => setActiveRoiTarget('test')}
            className={`btn ${activeRoiTarget === 'test' ? 'btn-primary' : 'btn-secondary'}`}
          >
            &#x25A0; Test Reaction ROI (Green Box)
          </button>

          <button
            type="button"
            onClick={() => setActiveRoiTarget('ref')}
            className={`btn ${activeRoiTarget === 'ref' ? 'btn-primary' : 'btn-secondary'}`}
          >
            &#x25A2; Reference Card ROI (Blue Dashed)
          </button>
        </div>

        {/* Interactive Canvas */}
        <div style={{ border: '1px solid var(--border-medium)', background: '#111', padding: '6px', textAlign: 'center', overflow: 'auto' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{
              maxWidth: '100%',
              height: 'auto',
              cursor: 'crosshair',
              display: 'block',
              margin: '0 auto',
            }}
            tabIndex={0}
            aria-label="Interactive test image canvas for selecting reference and reaction regions"
          />
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Tip: Click and drag on the canvas to draw the bounding box for the currently active target.
          On touch devices, drag across the region.
        </p>

        {/* Accessible Numeric Adjustment Coordinates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
          
          {/* Test ROI Coordinates */}
          <div className="panel-subtle" style={{ margin: 0 }}>
            <h3 style={{ color: '#276749' }}>Test Reaction ROI Coordinates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              <div>
                <label>X Position (px)</label>
                <input
                  type="number"
                  value={testRoi.x}
                  onChange={(e) => adjustRoi('x', parseInt(e.target.value) || 0, 'test')}
                />
              </div>
              <div>
                <label>Y Position (px)</label>
                <input
                  type="number"
                  value={testRoi.y}
                  onChange={(e) => adjustRoi('y', parseInt(e.target.value) || 0, 'test')}
                />
              </div>
              <div>
                <label>Width (px)</label>
                <input
                  type="number"
                  value={testRoi.width}
                  onChange={(e) => adjustRoi('width', parseInt(e.target.value) || 10, 'test')}
                />
              </div>
              <div>
                <label>Height (px)</label>
                <input
                  type="number"
                  value={testRoi.height}
                  onChange={(e) => adjustRoi('height', parseInt(e.target.value) || 10, 'test')}
                />
              </div>
            </div>
          </div>

          {/* Reference ROI Coordinates */}
          <div className="panel-subtle" style={{ margin: 0 }}>
            <h3 style={{ color: '#2b6cb0' }}>Reference Card ROI Coordinates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              <div>
                <label>X Position (px)</label>
                <input
                  type="number"
                  value={refRoi.x}
                  onChange={(e) => adjustRoi('x', parseInt(e.target.value) || 0, 'ref')}
                />
              </div>
              <div>
                <label>Y Position (px)</label>
                <input
                  type="number"
                  value={refRoi.y}
                  onChange={(e) => adjustRoi('y', parseInt(e.target.value) || 0, 'ref')}
                />
              </div>
              <div>
                <label>Width (px)</label>
                <input
                  type="number"
                  value={refRoi.width}
                  onChange={(e) => adjustRoi('width', parseInt(e.target.value) || 10, 'ref')}
                />
              </div>
              <div>
                <label>Height (px)</label>
                <input
                  type="number"
                  value={refRoi.height}
                  onChange={(e) => adjustRoi('height', parseInt(e.target.value) || 10, 'ref')}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Navigation Action Buttons */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button type="button" onClick={handleProceed} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Run Colour Analysis &rarr;
          </button>
          <Link to="/test/capture" className="btn btn-secondary">
            &larr; Retake Image
          </Link>
        </div>
      </div>
    </div>
  );
};
