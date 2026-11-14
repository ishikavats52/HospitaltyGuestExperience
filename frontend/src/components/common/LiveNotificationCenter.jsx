import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Utensils,
  Sparkles,
  Clock,
  User,
  Building,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { playHotelChime, playSuccessChime } from '../../utils/audioChime.js';

export const LiveNotificationCenter = ({ departmentFilter = null }) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_sound_alerts');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (_) {
      return true;
    }
  });

  // Top floating notification banner for brand new incoming requests
  const [activeBanner, setActiveBanner] = useState(null);

  // Complete Request & Fulfillment Details Modal
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const knownIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);
  const dropdownRef = useRef(null);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aura_sound_alerts', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const fetchLiveRequests = async () => {
    try {
      const res = await api.get('/service-requests');
      const all = Array.isArray(res.data) ? res.data : [];

      // Filter by department if specified
      let filtered = all;
      if (departmentFilter === 'KITCHEN') {
        filtered = all.filter((r) => r.requestType === 'DINING' || r.isFoodOrder);
      } else if (departmentFilter === 'HOUSEKEEPING') {
        filtered = all.filter(
          (r) =>
            r.requestType !== 'DINING' &&
            ['Housekeeping', 'Laundry', 'Room Service'].includes(r.serviceCategory)
        );
      } else if (departmentFilter === 'FRONT_DESK' || departmentFilter === 'RECEPTION') {
        filtered = all.filter(
          (r) =>
            r.requestType !== 'DINING' &&
            ['Front Desk', 'Concierge', 'Doctor', 'Luggage'].includes(r.serviceCategory)
        );
      }

      // Check for incoming requests
      const pendingItems = filtered.filter(
        (r) =>
          r.status !== 'DELIVERED' &&
          r.status !== 'COMPLETED' &&
          r.status !== 'FULFILLED' &&
          !r.isFulfilled
      );

      if (!isFirstLoadRef.current) {
        const brandNew = pendingItems.find((r) => !knownIdsRef.current.has(r._id));
        if (brandNew) {
          if (soundEnabled) {
            playHotelChime();
          }
          setActiveBanner(brandNew);
        }
      }

      // Populate known IDs
      filtered.forEach((r) => knownIdsRef.current.add(r._id));
      isFirstLoadRef.current = false;

      setRequests(filtered);
      setUnreadCount(pendingItems.length);
    } catch (err) {
      // Silently handle network polling hiccups
    }
  };

  useEffect(() => {
    fetchLiveRequests();
    const interval = setInterval(fetchLiveRequests, 3500);

    // BroadcastChannel listener
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('hospitality_live_dispatches');
        bc.onmessage = () => {
          fetchLiveRequests();
        };
      }
    } catch (_) {}

    // Storage event listener
    const handleStorage = (e) => {
      if (e.key === 'aura_last_dispatch_event' || e.key === 'aura_last_kitchen_order') {
        fetchLiveRequests();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Custom window event listener
    const handleCustomEvent = () => {
      fetchLiveRequests();
    };
    window.addEventListener('aura_live_dispatch', handleCustomEvent);
    window.addEventListener('new_kitchen_order', handleCustomEvent);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('aura_live_dispatch', handleCustomEvent);
      window.removeEventListener('new_kitchen_order', handleCustomEvent);
    };
  }, [soundEnabled, departmentFilter]);

  // Mark Request / Dish as Fulfilled
  const handleMarkFulfilled = async (item) => {
    if (!item?._id) return;
    setActionLoading(true);
    try {
      const actorName = currentUser?.name || 'Staff Attendant';
      const actorRole = currentUser?.role || 'HOTEL_STAFF';

      await api.patch(`/service-requests/${item._id}/status`, {
        status: 'DELIVERED',
        fulfilledBy: `${actorName} (${actorRole})`,
      });

      if (soundEnabled) {
        playSuccessChime();
      }

      // Close active banner if it's the same item
      if (activeBanner?._id === item._id) {
        setActiveBanner(null);
      }

      // Update detail modal state if open
      if (detailModalItem?._id === item._id) {
        setDetailModalItem((prev) => ({
          ...prev,
          status: 'DELIVERED',
          isFulfilled: true,
          fulfilledBy: `${actorName} (${actorRole})`,
          completedAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
        }));
      }

      await fetchLiveRequests();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter(
    (r) =>
      r.status !== 'DELIVERED' &&
      r.status !== 'COMPLETED' &&
      r.status !== 'FULFILLED' &&
      !r.isFulfilled
  );

  return (
    <>
      {/* 1. TOP FLOATING NOTIFICATION BANNER */}
      {activeBanner && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: '92%',
            maxWidth: '680px',
            background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(217, 119, 6, 0.4)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideDownFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: activeBanner.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                  color: activeBanner.isFoodOrder ? '#B45309' : '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {activeBanner.isFoodOrder ? <Utensils size={22} /> : <Sparkles size={22} />}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: activeBanner.isFoodOrder ? '#D97706' : '#2563EB',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeBanner.isFoodOrder ? '🍽️ Dining Order' : '🛎️ Amenity Request'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#D6D3D1' }}>
                    Room <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{activeBanner.roomNumber}</strong> • {activeBanner.guestName}
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FCD34D', marginTop: '4px', letterSpacing: '-0.01em' }}>
                  {activeBanner.serviceName}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#A8A29E', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {activeBanner.preparationTime && (
                    <span>⏱️ Prep Time: <strong style={{ color: '#FDE68A' }}>{activeBanner.preparationTime}</strong></span>
                  )}
                  {activeBanner.price > 0 && (
                    <span>💰 Total: <strong style={{ color: '#FDE68A' }}>₹{activeBanner.price}</strong></span>
                  )}
                  {activeBanner.specialInstructions && (
                    <span style={{ fontStyle: 'italic' }}>Note: "{activeBanner.specialInstructions}"</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveBanner(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#D6D3D1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Dismiss Alert"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setDetailModalItem(activeBanner)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileText size={14} /> View Full Details
            </button>

            <button
              type="button"
              onClick={() => handleMarkFulfilled(activeBanner)}
              disabled={actionLoading}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                border: 'none',
                color: '#FFFFFF',
                padding: '7px 18px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 size={16} /> Mark Fulfilled ✓
            </button>
          </div>
        </div>
      )}

      {/* 2. PERSISTENT HEADER BELL ICON & CONTROLS */}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }} ref={dropdownRef}>
        {/* Sound Mute/Unmute quick toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Chime sound is ENABLED (Click to mute)' : 'Chime sound is MUTED (Click to enable)'}
          style={{
            background: soundEnabled ? 'var(--gold-soft)' : '#F3F4F6',
            color: soundEnabled ? 'var(--gold-primary)' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Bell Icon with Live Badge */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          title="Live Guest Requests & Orders Queue"
          style={{
            position: 'relative',
            background: unreadCount > 0 ? '#FEF2F2' : '#FFFFFF',
            border: unreadCount > 0 ? '1px solid #FECACA' : '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: unreadCount > 0 ? '0 0 12px rgba(239, 68, 68, 0.25)' : 'none',
          }}
        >
          <Bell
            size={19}
            color={unreadCount > 0 ? '#DC2626' : 'var(--text-secondary)'}
            className={unreadCount > 0 ? 'animate-bounce' : ''}
          />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#DC2626',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '9999px',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                minWidth: '18px',
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* 3. DROPDOWN QUEUE POPOVER */}
        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '380px',
              maxWidth: '92vw',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)',
              zIndex: 1000,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '520px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Dropdown Header */}
            <div
              style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, var(--gold-soft) 0%, #FFFDF8 100%)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Live Guest Dispatches
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {unreadCount} Pending Request{unreadCount !== 1 ? 's' : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: soundEnabled ? 'var(--success)' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {soundEnabled ? '🔔 Chime On' : '🔕 Muted'}
                </span>
              </div>
            </div>

            {/* Dropdown List */}
            <div style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>All Clear!</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>No pending guest requests or food orders.</div>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      padding: '12px 14px',
                      background: '#FAFAFA',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: req.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                              color: req.isFoodOrder ? '#B45309' : '#1D4ED8',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {req.isFoodOrder ? 'Dining' : req.serviceCategory || 'Service'}
                          </span>
                          <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                            Room {req.roomNumber}
                          </strong>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {req.guestName || 'In-Stay Guest'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: req.isFree ? 'var(--success)' : 'var(--text-primary)' }}>
                          {req.isFree ? 'Free' : `₹${req.price}`}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {req.serviceName}
                    </div>

                    {req.preparationTime && (
                      <div style={{ fontSize: '0.72rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Prep Time: {req.preparationTime}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid #ECECEC' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDetailModalItem(req);
                          setDropdownOpen(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkFulfilled(req)}
                        disabled={actionLoading}
                        style={{
                          flex: 1.5,
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={13} /> Mark Fulfilled
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. COMPLETE REQUEST & FULFILLMENT AUDIT MODAL */}
      {detailModalItem && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 10000 }}
          onClick={() => setDetailModalItem(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', borderRadius: '20px', padding: '24px' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      background: detailModalItem.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                      color: detailModalItem.isFoodOrder ? '#B45309' : '#1D4ED8',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {detailModalItem.isFoodOrder ? '🍽️ Dining Order' : '🛎️ In-Stay Service'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ticket #{detailModalItem.orderNumber || detailModalItem._id?.slice(-6)}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
                  Room {detailModalItem.roomNumber} • {detailModalItem.guestName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
              {/* Itemized List */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Requested Items & Specifications
                </div>

                <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detailModalItem.items && detailModalItem.items.length > 0 ? (
                    detailModalItem.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {it.quantity || 1}x {it.name}
                          </strong>
                          {it.preparationTime && (
                            <div style={{ fontSize: '0.74rem', color: '#B45309' }}>
                              ⏱️ Preparation: {it.preparationTime}
                            </div>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{detailModalItem.serviceName}</strong>
                      <span style={{ fontWeight: 700, color: detailModalItem.isFree ? 'var(--success)' : 'var(--text-primary)' }}>
                        {detailModalItem.isFree ? 'Complimentary' : `₹${detailModalItem.price}`}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Total Folio Charge</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                      ₹{detailModalItem.price || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {(detailModalItem.specialInstructions || detailModalItem.guestNotes) && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Guest Notes & Instructions
                  </div>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem', color: '#92400E' }}>
                    {detailModalItem.specialInstructions || detailModalItem.guestNotes}
                  </div>
                </div>
              )}

              {/* Status & Fulfillment Audit Timeline */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Fulfillment Status & Timeline
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontWeight: 800, color: detailModalItem.isFulfilled || detailModalItem.status === 'DELIVERED' || detailModalItem.status === 'COMPLETED' ? 'var(--success)' : '#D97706', fontSize: '0.92rem' }}>
                      {detailModalItem.isFulfilled || detailModalItem.status === 'DELIVERED' || detailModalItem.status === 'COMPLETED' ? 'FULFILLED / DELIVERED' : detailModalItem.status}
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Placed At</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {detailModalItem.createdAt ? new Date(detailModalItem.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fulfilled By</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {detailModalItem.fulfilledBy || detailModalItem.assignedTo || 'Pending Fulfillment'}
                    </div>
                  </div>

                  {(detailModalItem.deliveredAt || detailModalItem.completedAt) && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#166534' }}>Completed At</div>
                      <div style={{ fontWeight: 700, color: '#15803D', fontSize: '0.85rem' }}>
                        {new Date(detailModalItem.deliveredAt || detailModalItem.completedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDetailModalItem(null)}
                className="btn btn-outline"
                style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>

              {!(detailModalItem.isFulfilled || detailModalItem.status === 'DELIVERED' || detailModalItem.status === 'COMPLETED') ? (
                <button
                  type="button"
                  onClick={() => handleMarkFulfilled(detailModalItem)}
                  disabled={actionLoading}
                  className="btn btn-gold"
                  style={{
                    padding: '9px 22px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} /> Mark as Fulfilled & Delivered ✓
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 800, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={18} /> Request Successfully Fulfilled
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveNotificationCenter;
