import React, { useState, useEffect } from 'react';
import { Sparkles, BedDouble, CheckCircle2, Clock, Check, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const HousekeepingView = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, roomsRes] = await Promise.all([
        api.get('/service-requests'),
        api.get('/rooms').catch(() => ({ data: [] })),
      ]);
      setRequests(reqRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (err) {
      console.error('Failed to load housekeeping queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateTaskStatus = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    try {
      await api.patch(`/service-requests/${requestId}/status`, { status: nextStatus });
      showToast(`Housekeeping request updated to ${nextStatus}`);
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
            zIndex: 9999,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Housekeeping & Cleanliness Dispatch
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
            Housekeeping Operational Board
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Live room sanitation pipeline and active in-stay guest amenity requests.
          </p>
        </div>

        <button onClick={fetchData} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh Board
        </button>
      </div>

      {/* Room Cleaning Grid */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BedDouble size={18} color="var(--gold-primary)" /> Room Cleaning & Readiness States ({rooms.length})
        </h3>

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
                Floor {room.floor || 1} • {room.roomTypeId?.name || 'Deluxe'}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {room.status !== 'AVAILABLE' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateRoomStatus(room._id, 'AVAILABLE')}
                    className="btn btn-gold"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1 }}
                  >
                    Mark Clean
                  </button>
                )}
                {room.status !== 'CLEANING' && room.status !== 'OCCUPIED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateRoomStatus(room._id, 'CLEANING')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1 }}
                  >
                    Start Cleaning
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Service Requests Queue */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--gold-primary)" /> Guest Service Dispatch Tickets ({requests.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No active housekeeping or amenity requests in queue.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requested Service</th>
                  <th>Room</th>
                  <th>Guest Notes</th>
                  <th>Time Logged</th>
                  <th>Task State</th>
                  <th>Dispatch Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {req.serviceCatalogueId?.name || 'Amenity Request'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>
                        Room {req.roomId?.roomNumber || '302'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {req.guestNotes || 'In-room guest request'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'COMPLETED' ? 'badge-free' : 'badge-gold'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {req.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStatus(req._id, 'IN_PROGRESS')}
                            disabled={updatingId === req._id}
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
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
                            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
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
