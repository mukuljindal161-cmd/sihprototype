import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getSampleImages, SampleImageItem } from '../services/sampleImages';

export const Capture: React.FC = () => {
  const navigate = useNavigate();
  const { session, setImage, setRegions } = useTestSession();

  const [previewUrl, setPreviewUrl] = useState<string | null>(session.imageDataUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sampleImages = getSampleImages();

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser. Please use the file upload option below.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera permission denied or camera device unavailable.';
      setCameraError(`Camera Error: ${msg} Please upload an image file instead.`);
      setIsCameraActive(false);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPreviewUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type (JPEG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`Invalid file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.`);
      return;
    }

    // Validate size limit (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File is too large (${sizeMb} MB). Maximum supported size is 10 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        stopCamera();
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file from disk. Please choose a different file.');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = (sample: SampleImageItem) => {
    setPreviewUrl(sample.dataUrl);
    setRegions(sample.defaultRefRoi, sample.defaultTestRoi);
    setErrorMessage(null);
    stopCamera();
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (!previewUrl) {
      setErrorMessage('Please capture or upload an image before proceeding.');
      return;
    }
    setImage(previewUrl);
    navigate('/test/review');
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Start New Test', path: '/test/new' },
          { label: `Capture (${session.testId || 'New'})` },
        ]}
      />

      <div className="panel">
        <h1>Image Acquisition</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Active Session: <strong>{session.testId}</strong> &bull; Operator: <strong>{session.operatorId}</strong>
        </p>

        <div className="disclaimer-banner">
          <strong>Alignment Requirement:</strong> Capture both the <strong>field-test reaction vessel/well</strong> and
          the <strong>4-patch reference card</strong> within the same frame under uniform, diffuse ambient lighting.
          Avoid direct reflective glare and extreme shadows.
        </div>

        {errorMessage && (
          <div className="panel" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-border)', color: 'var(--status-danger-text)' }}>
            <strong>Image Error:</strong> {errorMessage}
          </div>
        )}

        {cameraError && (
          <div className="panel" style={{ background: 'var(--status-negative-bg)', borderColor: 'var(--status-negative-border)', color: 'var(--status-negative-text)' }}>
            <strong>Camera Notice:</strong> {cameraError}
          </div>
        )}

        {/* Live Camera View */}
        {isCameraActive && (
          <div style={{ marginBottom: '20px', border: '1px solid var(--border-medium)', padding: '12px', background: '#000' }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', maxHeight: '440px', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
              <button type="button" onClick={handleCaptureSnapshot} className="btn btn-primary">
                Snap Photo
              </button>
              <button type="button" onClick={stopCamera} className="btn btn-secondary" style={{ color: '#fff', borderColor: '#888' }}>
                Cancel Camera
              </button>
            </div>
          </div>
        )}

        {/* Captured/Uploaded Preview */}
        {previewUrl && !isCameraActive && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px' }}>Captured Image Preview</h3>
            <div style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', padding: '10px', textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Captured field test showing reaction vessel and reference color card"
                style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', border: '1px solid var(--border-medium)' }}
              />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
              <button type="button" onClick={handleConfirm} className="btn btn-primary" style={{ padding: '10px 22px' }}>
                Confirm &amp; Proceed to Region Review
              </button>
              <button type="button" onClick={handleRetake} className="btn btn-secondary">
                Retake / Change Image
              </button>
            </div>
          </div>
        )}

        {/* Capture / Upload Options (Shown when no preview is active) */}
        {!previewUrl && !isCameraActive && (
          <div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button type="button" onClick={startCamera} className="btn btn-primary">
                Use Device Camera
              </button>

              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                Upload Image File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Offline Reproducible Evaluation Samples */}
            <div className="panel-subtle" style={{ marginTop: '20px' }}>
              <h3>Standard Evaluation Test Samples</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                If testing in an environment without physical test strips or a camera, select one of the standardized
                test targets below to evaluate the complete end-to-end ColorTrace workflow:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {sampleImages.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      border: '1px solid var(--border-medium)',
                      padding: '10px',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px' }}>{s.name}</strong>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>
                        {s.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadSample(s)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      Load {s.expectedResult}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link to="/test/new" className="btn btn-secondary btn-sm">
            &larr; Back to Test Info
          </Link>
        </div>
      </div>
    </div>
  );
};
