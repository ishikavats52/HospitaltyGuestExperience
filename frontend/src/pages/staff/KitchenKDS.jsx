import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Clock, CheckCircle2, ArrowRight, Bell, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';

const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
};

export const KitchenKDS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const previousOrdersRef = useRef([]);

  const fetchOrders = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      const res = await api.get('/orders');
      const incoming = res.data || [];

      // Check if new orders arrived compared to previous state
      if (previousOrdersRef.current.length > 0 && incoming.length > previousOrdersRef.current.length) {
        const latestOrder = incoming[0];
        playOrderChime();
        setNewOrderAlert(`Ticket #${latestOrder?.orderNumber || 'New'} (Room ${latestOrder?.roomNumber || 'Assigned'})`);
        setTimeout(() => setNewOrderAlert(null), 8000);
      }
      previousOrdersRef.current = incoming;
      setOrders(incoming);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 3000); // 3s polling for real-time kitchen updates

    // Real-time broadcast channel listener
    let bc = null;
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('hospitality_kitchen_orders');
        bc.onmessage = () => {
          fetchOrders(false);
        };
      } catch (_) {}
    }

    const handleStorageEvent = (e) => {
      if (e.key === 'aura_last_kitchen_order') {
        fetchOrders(false);
      }
    };

    const handleCustomEvent = () => {
      fetchOrders(false);
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('new_kitchen_order', handleCustomEvent);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('new_kitchen_order', handleCustomEvent);
    };
  }, []);

  const handleNextStatus = async (orderId, currentStatus) => {
    let nextStatus = 'ACCEPTED';
    if (currentStatus === 'PENDING' || currentStatus === 'PLACED') nextStatus = 'ACCEPTED';
    else if (currentStatus === 'ACCEPTED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'DELIVERED';

    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      await fetchOrders(false);
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Real-time Order Alert Banner */}
      {newOrderAlert && (
        <div
          style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} className="animate-bounce" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
              🔔 NEW CULINARY ORDER RECEIVED: {newOrderAlert}
            </span>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
            Culinary Operations
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
            Kitchen Display System (KDS)
          </h1>
          <p className="page-subtitle">
            Live incoming guest food tickets and preparation pipeline (Auto-syncing every 3s).
          </p>
        </div>

        <button onClick={() => fetchOrders(true)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
          Refresh Queue
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading live kitchen queue...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF' }}>
          No active food orders in queue.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
          {orders.map((order) => (
            <div key={order._id} className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.95rem' }}>
                    Ticket #{order.orderNumber}
                  </span>
                  <span className={`badge ${order.status === 'DELIVERED' ? 'badge-free' : 'badge-gold'}`}>
                    {order.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Room: <strong>{order.roomNumber || order.roomId?.roomNumber || 'Room Assigned'}</strong>
                </div>

                {order.specialInstructions && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                    Note: {order.specialInstructions}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {order.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {it.quantity}x {it.name}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                {order.status !== 'DELIVERED' ? (
                  <button
                    onClick={() => handleNextStatus(order._id, order.status)}
                    className="btn btn-gold"
                    style={{ width: '100%', padding: '9px', fontSize: '0.82rem' }}
                  >
                    Advance Status ({order.status} →)
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Delivered to Room
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
