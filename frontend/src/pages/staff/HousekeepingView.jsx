import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BedDouble,
  CheckCircle2,
  Clock,
  Check,
  RefreshCw,
  AlertCircle,
  Bell,
  Volume2,
  VolumeX,
  ArrowRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const HousekeepingView = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  const [toastMessage, setToastMessage] = useState(null);
  const [newRequestAlert, setNewRequestAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevRequestsCountRef = useRef(0);
  const knownRequestIdsRef = useRef(new Set());

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Audible notification chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (_) {}
  };

  const fetchData = async () => {
    try {
      const [reqRes, roomsRes] = await Promise.all([
        api.get('/service-requests'),
        api.get('/rooms').catch(() => ({ data: [] })),
      ]);

      const fetchedRequests = reqRes.data || [];
      const fetchedRooms = roomsRes.data || [];

      // Detect incoming new requests
      if (prevRequestsCountRef.current > 0 && fetchedRequests.length > prevRequestsCountRef.current) {
        const brandNew = fetchedRequests.find((r) => !knownRequestIdsRef.current.has(r._id));
        if (brandNew) {
          playChime();
          const roomNum = brandNew.roomId?.roomNumber || 'Guest';
          const servName = brandNew.serviceCatalogueId?.name || 'Service Facility';
          setNewRequestAlert({
            roomNumber: roomNum,
            serviceName: servName,
            notes: brandNew.guestNotes,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
          showToast(`🔔 New Guest Request: Room ${roomNum} requested ${servName}!`);
        }
      }

      // Update known IDs
      fetchedRequests.forEach((r) => knownRequestIdsRef.current.add(r._id));
      prevRequestsCountRef.current = fetchedRequests.length;

      setRequests(fetchedRequests);
      setRooms(fetchedRooms);
    } catch (err) {
      console.error('Failed to load housekeeping queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 7000); // Live 7s polling
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateTaskStatus = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    try {
      await api.patch(`/service-requests/${requestId}/status`, { status: nextStatus });
      showToast(`Housekeeping request marked as ${nextStatus}`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateRoomStatus = async (roomId, nextStatus) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: nextStatus });
      showToast(`Room marked as ${nextStatus}`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Room status update failed');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const inProgressRequests = requests.filter((r) => r.status === 'IN_PROGRESS');
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'PENDING') return r.status === 'PENDING';
    if (statusFilter === 'IN_PROGRESS') return r.status === 'IN_PROGRESS';
    if (statusFilter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 99999,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Live Incoming Alert Banner */}
      {newRequestAlert && (
        <div
          style={{
            background: '#FEF2F2',
            border: '2px solid #F87171',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.12)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={22} className="animate-bounce" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.98rem' }}>
                🔔 New Guest Service Request Received at {newRequestAlert.time}!
              </div>
              <div style={{ color: '#7F1D1D', fontSize: '0.86rem', marginTop: '2px' }}>
                <strong>Room {newRequestAlert.roomNumber}</strong> requested:{' '}
                <span style={{ textDecoration: 'underline' }}>{newRequestAlert.serviceName}</span>
                {newRequestAlert.notes && ` ("${newRequestAlert.notes}")`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNewRequestAlert(null)}
            className="btn btn-gold"
            style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      {/* Housekeeping Workspace Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'var(--gold-soft)',
              color: 'var(--gold-primary)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>Sanitation, Amenities & Service Dispatch</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Housekeeping Operational Board
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Real-time guest amenity requests, automatic chime notifications, and live room cleaning readiness.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-outline"
            style={{ padding: '9px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title={soundEnabled ? 'Mute Chime Alerts' : 'Enable Chime Alerts'}
          >
            {soundEnabled ? <Volume2 size={15} color="var(--success)" /> : <VolumeX size={15} color="var(--text-muted)" />}
            <span>{soundEnabled ? 'Sound Alerts: ON' : 'Sound: OFF'}</span>
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-outline"
            style={{ padding: '9px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Room Cleaning & Readiness States */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BedDouble size={18} color="var(--gold-primary)" /> Room Cleaning & Readiness States ({rooms.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Turnover cleaning marks rooms READY for next guest check-in.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
          {rooms.map((room) => (
            <div
              key={room._id}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: room.status === 'CLEANING' ? 'var(--gold-soft)' : 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                  Room {room.roomNumber}
                </span>
                <span className={`badge ${room.status === 'AVAILABLE' ? 'badge-free' : room.status === 'CLEANING' ? 'badge-blue' : 'badge-gold'}`}>
                  {room.status}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Floor {room.floor || 1} • {room.roomTypeId?.name || room.roomTypeName || 'Deluxe'}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {room.status !== 'AVAILABLE' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateRoomStatus(room._id, 'AVAILABLE')}
                    className="btn btn-gold"
                    style={{ padding: '5px 8px', fontSize: '0.74rem', flex: 1, fontWeight: 700 }}
                  >
                    Mark Clean
                  </button>
                )}
                {room.status !== 'CLEANING' && room.status !== 'OCCUPIED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateRoomStatus(room._id, 'CLEANING')}
                    className="btn btn-outline"
                    style={{ padding: '5px 8px', fontSize: '0.74rem', flex: 1 }}
                  >
                    Start Cleaning
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Service Dispatch Tickets Queue */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--gold-primary)" />
              Guest Service Dispatch Tickets ({requests.length})
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              In-stay guest requests for fresh linen, sanitization, toiletries, and maintenance facilities.
            </p>
          </div>

          {/* Ticket Status Filter Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                border: 'none',
                background: statusFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                fontWeight: statusFilter === 'ALL' ? 700 : 500,
                color: statusFilter === 'ALL' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              All Tickets ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              style={{
                border: 'none',
                background: statusFilter === 'PENDING' ? '#FFFFFF' : 'transparent',
                fontWeight: statusFilter === 'PENDING' ? 700 : 500,
                color: statusFilter === 'PENDING' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'PENDING' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              🚨 Pending ({pendingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              style={{
                border: 'none',
                background: statusFilter === 'IN_PROGRESS' ? '#FFFFFF' : 'transparent',
                fontWeight: statusFilter === 'IN_PROGRESS' ? 700 : 500,
                color: statusFilter === 'IN_PROGRESS' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'IN_PROGRESS' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              ⏳ In Progress ({inProgressRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              style={{
                border: 'none',
                background: statusFilter === 'COMPLETED' ? '#FFFFFF' : 'transparent',
                fontWeight: statusFilter === 'COMPLETED' ? 700 : 500,
                color: statusFilter === 'COMPLETED' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'COMPLETED' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              ✅ Completed ({completedRequests.length})
            </button>
          </div>
        </div>

        {loading && requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading live housekeeping requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>No service requests in this view.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Facility / Service</th>
                  <th>Guest Room</th>
                  <th>Guest Notes / Instructions</th>
                  <th>Time Logged</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Dispatch Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {req.serviceCatalogueId?.name || 'Amenity / Housekeeping Request'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--gold-dark)',
                          background: 'var(--gold-soft)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-active)',
                        }}
                      >
                        Room {req.roomId?.roomNumber || '302'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      {req.guestNotes || 'In-room guest amenity request'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          req.status === 'COMPLETED'
                            ? 'badge-free'
                            : req.status === 'IN_PROGRESS'
                            ? 'badge-blue'
                            : 'badge-gold'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {req.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(req._id, 'IN_PROGRESS')}
                            disabled={updatingId === req._id}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 600 }}
                          >
                            Claim / In Progress
                          </button>
                        )}
                        {req.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(req._id, 'COMPLETED')}
                            disabled={updatingId === req._id}
                            className="btn btn-gold"
                            style={{ padding: '6px 14px', fontSize: '0.76rem', fontWeight: 700 }}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
