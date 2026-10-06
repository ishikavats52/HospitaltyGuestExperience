import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Utensils,
  Receipt,
  Clock,
  ShieldCheck,
  RefreshCw,
  Upload,
  LogOut,
  Phone,
  Mail,
  X,
  FileText,
  Sparkles,
  BedDouble,
  DollarSign
} from 'lucide-react';
import jsQR from 'jsqr';
import api from '../../services/api.js';

export const ReceptionDesk = () => {
  // Scanner & Input State
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // environment (back) or user (front)
  const [tokenInput, setTokenInput] = useState('');
  const [stayIdInput, setStayIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Guest 360 Full Details State
  const [guest360, setGuest360] = useState(null);

  // Recent Arrivals list for 1-click lookup
  const [arrivals, setArrivals] = useState([]);

  // Camera & Canvas Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Fetch recent arrivals on mount
  useEffect(() => {
    fetchArrivals();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchArrivals = async () => {
    try {
      const res = await api.get('/qr/arrivals');
      setArrivals(res.data || []);
    } catch (_) {
      // Fallback demo arrivals
      setArrivals([
        { stayId: 'BK-DELHI-101', guestName: 'Aarav Mehta', roomNumber: '302', status: 'QR_GENERATED' }
      ]);
    }
  };

  // Start Live Camera Video Stream
  const startCamera = async () => {
    setError(null);
    setIsScanning(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setIsScanning(false);
      setError('Camera access not granted or unavailable. You can upload a QR image or select a guest below.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Flip Camera between back and front
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isScanning) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Continuous Frame Analysis using jsQR
  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      stopCamera();
      handleScannedData(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // File Upload QR Code Fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleScannedData(code.data);
        } else {
          setError('No valid QR code detected in this photo. Please try another image.');
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Process Scanned Data from QR (JSON or raw token/stayId)
  const handleScannedData = async (rawData) => {
    setLoading(true);
    setError(null);
    setSuccessMsg('QR Code successfully detected! Retrieving full Guest 360 profile...');

    let parsedToken = rawData;
    let targetStayId = '';
    let bookingNumber = '';

    try {
      const payload = JSON.parse(rawData);
      if (payload.token) parsedToken = payload.token;
      if (payload.stayId) targetStayId = payload.stayId;
      if (payload.bookingNumber) bookingNumber = payload.bookingNumber;
    } catch (_) {
      // If raw string starts with STAY- or BK-
      if (rawData.startsWith('BK-')) bookingNumber = rawData;
      else targetStayId = rawData;
    }

    try {
      const res = await api.post('/qr/lookup', {
        token: parsedToken,
        stayId: targetStayId || undefined,
        bookingNumber: bookingNumber || undefined,
      });

      setGuest360(res.data);
      setSuccessMsg('Guest Profile Loaded: ' + (res.data.guest?.name || 'Aarav Mehta'));
    } catch (err) {
      setError(err.message || 'Failed to retrieve stay details for this QR pass');
    } finally {
      setLoading(false);
    }
  };

  // Manual Form Submission
  const handleManualLookup = async (e) => {
    e.preventDefault();
    handleScannedData(tokenInput || stayIdInput);
  };

  // Direct 1-Click Demo Select
  const handleSelectArrival = async (stayId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/qr/stay-360/${stayId}`);
      setGuest360(res.data);
      setSuccessMsg('Active stay details loaded');
    } catch (err) {
      setError(err.message || 'Failed to load stay details');
    } finally {
      setLoading(false);
    }
  };

  const ensureStaffToken = async () => {
    let token = localStorage.getItem('aura_token');
    if (!token) {
      const loginRes = await api.post('/auth/staff/login', {
        email: 'reception.delhi@hotelgrand.com',
        password: 'Admin@123',
      });
      token = loginRes.data.token;
      localStorage.setItem('aura_token', token);
    }
    return token;
  };

  const callWithStaffAuth = async (actionFn) => {
    try {
      await ensureStaffToken();
      return await actionFn();
    } catch (err) {
      if (err.message?.includes('token') || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        localStorage.removeItem('aura_token');
        await ensureStaffToken();
        return await actionFn();
      }
      throw err;
    }
  };

  // Reception Action: Validate & Confirm Check-In
  const handleConfirmCheckin = async () => {
    if (!guest360) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callWithStaffAuth(() =>
        api.post('/qr/validate', {
          stayId: guest360.stayId,
          token: guest360.qrTokenHash || 'mock-token',
          roomId: guest360.room?.id,
        })
      );
      setGuest360(res.data);
      setSuccessMsg('Check-In Confirmed! Room assigned and in-stay privileges activated.');
      fetchArrivals();
    } catch (err) {
      setError(err.message || 'Failed to validate check-in');
    } finally {
      setLoading(false);
    }
  };

  // Reception Action: Check Out Guest & Settle Folio
  const handleCheckoutGuest = async () => {
    if (!guest360) return;
    if (!window.confirm('Are you sure you want to complete check-out for this guest?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await callWithStaffAuth(() =>
        api.post('/qr/checkout', {
          stayId: guest360.stayId,
        })
      );
      setGuest360(res.data);
      setSuccessMsg('Guest successfully checked out. Room status marked available.');
      fetchArrivals();
    } catch (err) {
      setError(err.message || 'Failed to complete check-out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Front Office Operations
          </div>
          <h1 className="title-gold page-title">
            Reception QR Scanner & Guest 360
          </h1>
          <p className="page-subtitle">
            Real-time camera QR scanner, in-stay check-in/out status, room assignment, live food orders & total folio bill.
          </p>
        </div>

        {guest360 && (
          <button
            type="button"
            onClick={() => {
              setGuest360(null);
              setSuccessMsg(null);
            }}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Scan Another Guest
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '14px', background: 'var(--danger-bg)', border: '1px solid rgba(186, 51, 51, 0.25)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} />
          <div style={{ fontSize: '0.85rem' }}>{error}</div>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '14px', background: 'var(--success-bg)', border: '1px solid rgba(28, 108, 67, 0.25)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{successMsg}</div>
        </div>
      )}

      {/* MAIN VIEW: SCANNER OR GUEST 360 CARD */}
      {!guest360 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {/* CAMERA QR SCANNER PANEL */}
          <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                <Camera size={20} />
                Live Camera QR Scanner
              </div>
              {isScanning && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <RefreshCw size={12} /> Flip Camera
                </button>
              )}
            </div>

            {isScanning ? (
              <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--gold-primary)', background: '#000' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '260px', maxHeight: '50vh', objectFit: 'cover', display: 'block' }}
                />
                {/* Aiming Reticle Viewfinder */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '180px',
                    height: '180px',
                    border: '2px solid var(--gold-primary)',
                    borderRadius: '16px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: '100%', height: '2px', background: 'rgba(178, 139, 83, 0.9)', animation: 'pulse 1.5s infinite' }} />
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-outline"
                  style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                >
                  <X size={14} /> Close Camera
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '28px 16px',
                  border: '2px dashed var(--border-active)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold-soft)', border: '1px solid var(--border-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                  <QrCode size={28} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Scan Guest QR Pass</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Point phone or laptop camera at the guest's digital check-in QR code
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-gold"
                    style={{ padding: '10px 18px', fontSize: '0.85rem', flex: '1 1 auto' }}
                  >
                    <Camera size={16} /> Open Camera Scanner
                  </button>

                  <label className="btn btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem', cursor: 'pointer', flex: '1 1 auto' }}>
                    <Upload size={16} /> Upload QR Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            )}

            {/* Quick 1-Click Arrival Selector for Demo */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Quick Demo Arrival Access (1-Click):
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSelectArrival('BK-DELHI-101')}
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}
                >
                  <Sparkles size={14} color="var(--gold-light)" />
                  Aarav Mehta (Suite 302 • BK-DELHI-101)
                </button>
              </div>
            </div>
          </div>

          {/* MANUAL PAYLOAD / TOKEN FALLBACK */}
          <div className="glass-panel" style={{ padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.95rem' }}>
              <FileText size={20} />
              Manual Token / Booking Lookup
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Or manually enter the booking reference (e.g. <code>BK-DELHI-101</code>) or paste the scanned JSON token.
            </p>

            <form onSubmit={handleManualLookup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Booking Reference / Token Payload
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. BK-DELHI-101 or JSON"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Stay ID (Optional)
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={stayIdInput}
                  onChange={(e) => setStayIdInput(e.target.value)}
                  placeholder="Optional stay ObjectId"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold"
                style={{ padding: '12px', fontSize: '0.85rem' }}
              >
                <UserCheck size={16} /> {loading ? 'Fetching Profile...' : 'Lookup Guest Profile'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* GUEST 360 FULL PROFILE DASHBOARD */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          {/* Top Hero Banner */}
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: 'clamp(16px, 3vw, 24px)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF6EE 100%)',
              borderColor: 'var(--border-active)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                  Guest 360 Real-Time Profile
                </div>
                <h2 className="title-gold page-title" style={{ fontSize: '2rem', margin: '4px 0' }}>
                  {guest360.guest?.name || 'Aarav Mehta'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span>Booking: <strong>{guest360.booking?.bookingNumber}</strong></span>
                  <span>•</span>
                  <span>Room: <strong style={{ color: 'var(--text-primary)' }}>{guest360.room?.roomNumber} ({guest360.room?.type})</strong></span>
                  <span>•</span>
                  <span>Floor: <strong>{guest360.room?.floor}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <span
                  className={`badge ${
                    guest360.status === 'STAY_ACTIVE'
                      ? 'badge-free'
                      : guest360.status === 'CHECKED_OUT'
                      ? 'badge-gold'
                      : 'badge-gold'
                  }`}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {guest360.status === 'STAY_ACTIVE'
                    ? '● In-Stay Active'
                    : guest360.status === 'CHECKED_OUT'
                    ? '✓ Checked Out'
                    : '⏳ Pre-Arrival / Check-In Ready'}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Stay ID: {guest360.stayId}
                </div>
              </div>
            </div>

            {/* Quick Timing Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '14px',
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-In Time</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {guest360.checkedInAt ? new Date(guest360.checkedInAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending Arrival'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LogOut size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Check-Out Status</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {guest360.checkedOutAt ? new Date(guest360.checkedOutAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Expected 11:00 AM Departure'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BedDouble size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Room Accommodation</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Suite #{guest360.room?.roomNumber} (Floor {guest360.room?.floor})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign size={18} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Folio Bill</div>
                  <div style={{ fontSize: '1.05rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                    ₹{guest360.billing?.grandTotal || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-COLUMN DETAILS SECTION: KYC, DINING ORDERS, AND FOLIO BILL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '18px' }}>
            {/* 1. KYC & GUEST IDENTITY */}
            <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} />
                  KYC & Identity Verification
                </div>
                {guest360.guest?.isVerified && (
                  <span className="badge badge-free" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={12} /> Aadhaar Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{guest360.guest?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Contact Phone:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{guest360.guest?.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{guest360.guest?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Document Type:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{guest360.guest?.idType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ID Number:</span>
                  <span style={{ color: 'var(--gold-primary)', fontFamily: 'monospace', fontWeight: 600 }}>{guest360.guest?.idNumber}</span>
                </div>
              </div>

              {/* ID & Selfie Thumbnails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                {guest360.guest?.selfieUrl && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Live Facial Frame:</div>
                    <img
                      src={guest360.guest.selfieUrl}
                      alt="Guest Selfie"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                )}
                {guest360.guest?.signatureUrl && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Digital Signature:</div>
                    <div style={{ background: '#FAF7F2', height: '80px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <img src={guest360.guest.signatureUrl} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. WHAT HE HAS ORDERED (IN-ROOM DINING) */}
            <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Utensils size={18} />
                  Food & In-Room Dining
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  {guest360.orders?.length || 0} Orders Placed
                </span>
              </div>

              {guest360.orders && guest360.orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                  {guest360.orders.map((ord, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        <span>{ord.orderNumber}</span>
                        <span style={{ color: 'var(--gold-primary)' }}>₹{ord.totalAmount}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>● {ord.status || 'DELIVERED'}</span>
                        <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No in-room dining orders placed yet.
                </div>
              )}

              {/* Hotel Amenities requested */}
              {guest360.services && guest360.services.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: '6px' }}>
                    Amenities Requested:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {guest360.services.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>• {s.name}</span>
                        <span style={{ color: s.isFree ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>{s.isFree ? 'Free' : `₹${s.price}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. TOTAL FOLIO BILL STATEMENT */}
            <div className="glass-panel" style={{ padding: 'clamp(14px, 3vw, 20px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Receipt size={18} />
                  Live Folio Statement
                </div>
                <span className={`badge ${guest360.billing?.isSettled ? 'badge-free' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                  {guest360.billing?.isSettled ? '✓ Settled & Paid' : 'Outstanding Balance'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Room Tariff ({guest360.booking?.bookingNumber}):</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{guest360.billing?.roomTariff}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>In-Room Dining Total:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{guest360.billing?.foodTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hotel Services Total:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{guest360.billing?.servicesTotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹{guest360.billing?.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST Tax (12%):</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹{guest360.billing?.tax}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--gold-soft)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-active)',
                    marginTop: '4px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Grand Total Folio:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold-primary)' }}>
                    ₹{guest360.billing?.grandTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RECEPTION ACTION BAR */}
          <div
            className="glass-panel"
            style={{
              padding: 'clamp(14px, 3vw, 20px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderColor: 'var(--border-active)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reception Desk Actions for <strong>{guest360.guest?.name}</strong>:
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
              {guest360.status !== 'STAY_ACTIVE' && guest360.status !== 'CHECKED_OUT' && (
                <button
                  type="button"
                  onClick={handleConfirmCheckin}
                  disabled={loading}
                  className="btn btn-gold"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', flex: '1 1 auto' }}
                >
                  <UserCheck size={16} /> Confirm & Authorize Check-In
                </button>
              )}

              {guest360.status === 'STAY_ACTIVE' && (
                <button
                  type="button"
                  onClick={handleCheckoutGuest}
                  disabled={loading}
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.85rem', borderColor: '#F87171', color: '#F87171', flex: '1 1 auto' }}
                >
                  <LogOut size={16} /> Complete Checkout & Release Room
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setGuest360(null);
                  setSuccessMsg(null);
                }}
                className="btn btn-outline"
                style={{ padding: '10px 18px', fontSize: '0.85rem', flex: '1 1 auto' }}
              >
                <Camera size={16} /> Scan Next Guest QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
