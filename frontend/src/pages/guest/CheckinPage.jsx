import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Camera,
  PenTool,
  CheckCircle2,
  ArrowRight,
  Upload,
  RefreshCw,
  AlertCircle,
  QrCode,
  Sparkles,
  X,
  Eye,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const CheckinPage = () => {
  const { currentUser, refreshSession } = useAuth();
  const navigate = useNavigate();

  const stay = currentUser?.stay;
  const isAlreadyCheckedIn = stay?.status === 'CHECKED_IN' || stay?.status === 'STAY_ACTIVE';

  // ID Document State
  const [idType, setIdType] = useState('AADHAAR');
  const [idNumber, setIdNumber] = useState(currentUser?.stay?.idNumber || '');
  const [idImage, setIdImage] = useState(null);
  const [idFileName, setIdFileName] = useState('');

  // Camera & Selfie State
  const [cameraActive, setCameraActive] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Digital Signature Pad State
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);

  // Form State
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const stayId =
    currentUser?.stay?._id ||
    currentUser?.stayId ||
    (typeof currentUser?.stay === 'string' ? currentUser?.stay : null) ||
    currentUser?.bookingId ||
    'BK-DELHI-101';

  // Aadhaar ID number format validation
  const handleIdNumberChange = (val) => {
    if (idType === 'AADHAAR') {
      const clean = val.replace(/\D/g, '').slice(0, 12);
      setIdNumber(clean);
    } else {
      setIdNumber(val.toUpperCase().slice(0, 20));
    }
  };

  const isIdValid = () => {
    if (!idNumber) return false;
    if (idType === 'AADHAAR') return idNumber.length === 12;
    return idNumber.length >= 6;
  };

  // Instant ID Document File Upload (Zero fake delays, zero fake OCR)
  const handleIdFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image file (JPG, PNG, WEBP) for verification');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdImage(reader.result);
      setIdFileName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeIdDocument = () => {
    setIdImage(null);
    setIdFileName('');
  };

  // WebCam Camera Stream for Live Selfie
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn('WebCam unavailable:', err);
      setCameraError('Camera access unavailable on this device. Please upload a selfie photo instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setSelfieImage(dataUrl);
    stopCamera();
  };

  const handleSelfieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfieImage(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeSelfie = () => {
    setSelfieImage(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Digital Signature Canvas Handlers (Mouse + Touch Screen Support)
  const getCoordinates = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#D90429';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && signatureCanvasRef.current) {
      setIsDrawing(false);
      setSignatureImage(signatureCanvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureImage(null);
    }
  };

  // Check-In Form Submission
  const handleSubmitCheckin = async (e) => {
    e.preventDefault();

    if (!idImage) {
      setError('Please upload your Aadhaar card or government ID photo.');
      return;
    }

    if (!isIdValid()) {
      setError(
        idType === 'AADHAAR'
          ? 'Please enter a valid 12-digit Aadhaar number.'
          : 'Please enter a valid document identification number.'
      );
      return;
    }

    if (!selfieImage) {
      setError('Please take a camera selfie or upload a photo to verify your identity.');
      return;
    }

    if (!signatureImage) {
      setError('Please provide your digital signature on the pad below.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the hotel registration declaration.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/checkin/submit', {
        stayId: stayId || 'default-stay',
        idType,
        idNumber,
        idDocumentUrl: idImage,
        selfieUrl: selfieImage,
        signatureUrl: signatureImage,
      });

      if (refreshSession) {
        await refreshSession();
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/guest/dashboard?checkinCompleted=true');
      }, 900);
    } catch (err) {
      setError(err.message || 'Check-in submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          Contactless Guest Journey
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
          Contactless Mobile Check-In
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Submit your identification, selfie, and digital signature for instant room key issuance.
        </p>
      </div>

      {/* Already Checked-In Notice Banner */}
      {isAlreadyCheckedIn && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 18px',
            background: 'var(--gold-soft)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} color="var(--gold-primary)" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                Check-In Already Active
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Your suite reservation is confirmed and verified. You can access your Digital Pass or update your ID below.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/guest/qr-pass" className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <QrCode size={14} /> View Digital Pass
            </Link>
            <Link to="/guest/dashboard" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--success-bg)',
            color: 'var(--gold-dark)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} color="var(--gold-primary)" />
          <span>Check-in verified successfully! Unlocking your suite and generating digital pass...</span>
        </div>
      )}

      <form onSubmit={handleSubmitCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Step 1: Government Identity Proof */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
              <FileText size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Step 1: Aadhaar / Identity Verification</span>
            </div>
            {idImage && isIdValid() && (
              <span className="badge badge-free" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} /> Document Ready
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Document Type
                </label>
                <select
                  className="input-control"
                  value={idType}
                  onChange={(e) => {
                    setIdType(e.target.value);
                    setIdNumber('');
                  }}
                >
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID Card</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  {idType === 'AADHAAR' ? '12-Digit Aadhaar Number' : `${idType.replace('_', ' ')} Number`}
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={idNumber}
                  onChange={(e) => handleIdNumberChange(e.target.value)}
                  placeholder={idType === 'AADHAAR' ? 'e.g. 412630822252' : 'Enter document ID'}
                  maxLength={idType === 'AADHAAR' ? 12 : 20}
                  required
                />
                {idType === 'AADHAAR' && idNumber && idNumber.length < 12 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '4px' }}>
                    {12 - idNumber.length} more digits required
                  </div>
                )}
              </div>
            </div>

            {/* Document File Upload Dropzone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Upload {idType === 'AADHAAR' ? 'Aadhaar Card Photo' : 'Document Image'}
              </label>

              {idImage ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-active)',
                    background: 'var(--gold-soft)',
                  }}
                >
                  <img
                    src={idImage}
                    alt="Uploaded ID preview"
                    style={{
                      width: '74px',
                      height: '52px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {idFileName || `${idType.replace('_', ' ')} Uploaded`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <CheckCircle2 size={12} /> Image attached for registration
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <label
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Change
                      <input type="file" accept="image/*" onChange={handleIdFileUpload} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={removeIdDocument}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.74rem', color: 'var(--danger)' }}
                      title="Remove document"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '24px 16px',
                    border: '2px dashed var(--border-active)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--gold-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold-primary)',
                    }}
                  >
                    <Upload size={20} />
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Click or tap to upload {idType === 'AADHAAR' ? 'Aadhaar Card' : 'ID Document'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Supports JPG, PNG, WEBP (front photo of card)
                  </div>
                  <input type="file" accept="image/*" onChange={handleIdFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Live Camera Selfie Capture / Photo Upload */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
              <Camera size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Step 2: Guest Photo & Facial Match</span>
            </div>
            {selfieImage && (
              <span className="badge badge-free" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} /> Photo Captured
              </span>
            )}
          </div>

          {cameraError && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', marginBottom: '12px' }}>
              {cameraError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            {cameraActive ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--gold-primary)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', display: 'block', background: '#000' }}
                />
                <button
                  type="button"
                  onClick={captureSelfie}
                  className="btn btn-gold"
                  style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', padding: '8px 18px', fontSize: '0.82rem', zIndex: 10, whiteSpace: 'nowrap' }}
                >
                  <Camera size={15} /> Take Snapshot
                </button>
              </div>
            ) : selfieImage ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-active)',
                  background: 'var(--gold-soft)',
                }}
              >
                <img
                  src={selfieImage}
                  alt="Guest selfie preview"
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '2px solid var(--gold-primary)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Guest Photo Captured
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 size={12} /> Ready for contactless reception verification
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={removeSelfie}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '0.74rem', color: 'var(--danger)' }}
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  padding: '24px 16px',
                  border: '1px dashed var(--border-active)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--gold-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-primary)',
                  }}
                >
                  <Camera size={20} />
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Take a Quick Selfie Frame
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Capture a photo using your front camera or upload an existing picture
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-gold"
                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    <Camera size={14} /> Open Camera
                  </button>

                  <label
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Upload Photo File
                    <input type="file" accept="image/*" onChange={handleSelfieFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Digital Signature Pad */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
              <PenTool size={18} />
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Step 3: Guest Digital Signature</span>
            </div>
            {signatureImage && (
              <button
                type="button"
                onClick={clearSignature}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear & Redraw
              </button>
            )}
          </div>

          <div
            style={{
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-sm)',
              background: '#FFFDFD',
              position: 'relative',
              touchAction: 'none',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={signatureCanvasRef}
              width={340}
              height={90}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ width: '100%', height: '90px', display: 'block', cursor: 'crosshair' }}
            />
            {!signatureImage && !isDrawing && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  pointerEvents: 'none',
                }}
              >
                Sign with finger or mouse here
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Declaration Consent */}
        <div className="glass-panel" style={{ padding: '16px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '3px', accentColor: 'var(--gold-primary)' }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              I hereby declare that the identification details and photo provided are true and belong to me. I agree to the hotel guest policies, contactless check-in terms, and room folio management.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-gold"
          disabled={loading || !idImage || !isIdValid() || !selfieImage || !signatureImage}
          style={{
            padding: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            opacity: loading || !idImage || !isIdValid() || !selfieImage || !signatureImage ? 0.65 : 1,
            cursor: loading || !idImage || !isIdValid() || !selfieImage || !signatureImage ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RefreshCw size={16} className="animate-spin" /> Submitting Check-In...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Complete Check-In & Get Digital Key <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
