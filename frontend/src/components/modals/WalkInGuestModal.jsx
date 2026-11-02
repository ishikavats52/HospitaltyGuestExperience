import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  BedDouble,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Sparkles,
  Building2,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api.js';

export const WalkInGuestModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedRoomId = null,
  availableRooms = [],
  properties = [],
}) => {
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    email: '',
    idType: 'AADHAAR',
    idNumber: '',
    propertyId: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalAmount: '',
    directCheckIn: true,
    notes: '',
  });

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsList, setRoomsList] = useState(availableRooms || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const bodyScrollRef = useRef(null);

  // If availableRooms was not passed or empty, fetch them
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCreatedResult(null);
      setCopiedLink(false);

      if (availableRooms && availableRooms.length > 0) {
        setRoomsList(availableRooms);
      } else {
        fetchRooms();
      }
    }
  }, [isOpen, availableRooms]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get('/rooms');
      const loaded = res.data || [];
      setRoomsList(loaded);
    } catch (_) {
      setRoomsList([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Pre-fill preselected room or default first available room
  useEffect(() => {
    if (isOpen && roomsList.length > 0) {
      const targetRoom = preselectedRoomId
        ? roomsList.find((r) => String(r._id) === String(preselectedRoomId))
        : roomsList.find((r) => r.status === 'AVAILABLE') || roomsList[0];

      if (targetRoom) {
        setFormData((prev) => ({
          ...prev,
          roomId: prev.roomId || targetRoom._id,
          propertyId: targetRoom.propertyId?._id || targetRoom.propertyId || prev.propertyId,
          totalAmount: prev.totalAmount || targetRoom.pricePerNight || 4500,
        }));
      }
    }
  }, [isOpen, preselectedRoomId, roomsList]);

  if (!isOpen) return null;

  const handleRoomChange = (e) => {
    const selectedId = e.target.value;
    const selected = roomsList.find((r) => String(r._id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      roomId: selectedId,
      propertyId: selected?.propertyId?._id || selected?.propertyId || prev.propertyId,
      totalAmount: selected?.pricePerNight || prev.totalAmount,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Client-side validations with clear visual error messaging
    if (!formData.guestName.trim()) {
      setError('Please provide the guest full name.');
      bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please provide the guest mobile / WhatsApp contact number.');
      bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.roomId) {
      if (roomsList.length === 0) {
        setError('No rooms are currently registered in your hotel inventory. Please go to Room Manager to add rooms before check-in.');
      } else {
        setError('Please select an available room from the inventory dropdown to allot to this guest.');
      }
      bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedRoom = roomsList.find((r) => String(r._id) === String(formData.roomId));

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        guestName: formData.guestName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        propertyId: formData.propertyId || selectedRoom?.propertyId,
        roomId: formData.roomId || undefined,
        roomNumber: selectedRoom?.roomNumber || undefined,
        roomTypeName: selectedRoom?.roomTypeName || undefined,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        totalAmount: Number(formData.totalAmount) || selectedRoom?.pricePerNight || 4500,
        isWalkIn: true,
        directCheckIn: formData.directCheckIn,
        notes: formData.notes,
      };

      const res = await api.post('/bookings', payload);
      setCreatedResult(res.data);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      console.error('Walk-in booking error:', err);
      setError(err.message || 'Failed to register walk-in guest. Please try again.');
      bodyScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyMagicLink = () => {
    if (!createdResult?.magicLink) return;
    const fullUrl = `${window.location.origin}${createdResult.magicLink}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="modal-content has-modal-body"
        style={{
          width: 'min(96vw, 640px)',
          height: '90vh',
          maxHeight: '92dvh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Sticky Header */}
        <div
          className="modal-header"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--gold-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)',
                flexShrink: 0,
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register Walk-In Guest
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Immediate front desk allotment & active stay folio generation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body or Form */}
        <div
          ref={bodyScrollRef}
          className="modal-body"
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* SUCCESS STATE */}
          {createdResult ? (
            <div style={{ textAlign: 'center', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(28, 108, 67, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1c6c43',
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Guest Registered Successfully!
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Stay is activated and room <strong>{createdResult.room?.roomNumber || createdResult.booking?.roomNumber}</strong> is now marked <strong>OCCUPIED</strong>.
                </p>
              </div>

              {/* Booking Reference Card */}
              <div
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary, #faf7f5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Booking Reference
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                    {createdResult.booking?.bookingNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Guest Name</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {createdResult.guest?.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Room Category</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Room {createdResult.booking?.roomNumber} • {createdResult.booking?.roomTypeName}
                  </span>
                </div>
              </div>

              {/* Magic Check-In Link Box */}
              <div
                style={{
                  width: '100%',
                  background: 'var(--gold-soft)',
                  border: '1px solid var(--border-active)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={16} color="var(--gold-primary)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
                    Express Magic Link (WhatsApp / SMS)
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Guest can open this link on their mobile to access in-room dining, smart services, and bill without typing any password:
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${createdResult.magicLink}`}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={copyMagicLink}
                    className="btn btn-gold"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-gold"
                style={{ width: '100%', padding: '12px', fontWeight: 700, fontSize: '0.92rem' }}
              >
                Complete & Return to Dashboard
              </button>
            </div>
          ) : (
            <form
              id="walk-in-form"
              noValidate
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Prominent Error Banner */}
              {error && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: '1px solid #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. GUEST PERSONAL INFORMATION */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  1. Guest Identification & Contact
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Guest Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Malhotra"
                      value={formData.guestName}
                      onChange={(e) => {
                        setFormData({ ...formData, guestName: e.target.value });
                        if (error) setError(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Mobile / WhatsApp Number <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (error) setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 32px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Email Address (Optional)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        placeholder="guest@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 32px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. KYC IDENTITY DETAILS */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  2. Government ID / KYC Verification
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      ID Document Type
                    </label>
                    <select
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.88rem',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="AADHAAR">Aadhaar Card (UIDAI)</option>
                      <option value="PASSPORT">International Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="VOTER_ID">Voter ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      ID Document Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="e.g. 4126-3082-2252"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 32px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ROOM ALLOTMENT & TARIFF */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  3. Room Allotment & Stay Tariff
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Select Room from Available Inventory <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      {roomsList.length > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {roomsList.filter((r) => r.status === 'AVAILABLE').length} Available
                        </span>
                      )}
                    </div>

                    {roomsList.length === 0 ? (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          color: '#92400E',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>No rooms found. Please add rooms in Room Manager first.</span>
                      </div>
                    ) : (
                      <select
                        value={formData.roomId}
                        onChange={handleRoomChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: error && !formData.roomId ? '2px solid #DC2626' : '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">-- Choose Room from Inventory --</option>
                        {roomsList.map((r) => {
                          const isAvailable = r.status === 'AVAILABLE';
                          return (
                            <option key={r._id} value={r._id}>
                              {isAvailable ? '🟢' : '⚪'} Room {r.roomNumber} • {r.roomTypeName || 'Deluxe'} • Floor {r.floor || 1} • ₹{r.pricePerNight || 4500}/night [{r.status}]
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Room Tariff Per Night (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="4500"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 30px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. INSTANT CHECK-IN TOGGLE */}
              <div
                style={{
                  background: 'var(--gold-soft)',
                  border: '1px solid var(--border-active)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={20} color="var(--gold-primary)" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Instant Check-In & Room Key Activation
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Guest is at the desk: mark room OCCUPIED and activate stay immediately
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={formData.directCheckIn}
                  onChange={(e) => setFormData({ ...formData, directCheckIn: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--gold-primary)' }}
                />
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer */}
        {!createdResult && (
          <div
            className="modal-footer"
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-outline"
              style={{ padding: '9px 18px', fontSize: '0.86rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-gold"
              style={{
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '200px',
                justifyContent: 'center',
              }}
            >
              {submitting ? (
                <>Registering & Allotting...</>
              ) : (
                <>
                  <Check size={16} /> Allot Room & Check In
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
