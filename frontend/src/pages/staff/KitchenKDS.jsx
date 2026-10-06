import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';

export const KitchenKDS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleNextStatus = async (orderId, currentStatus) => {
    let nextStatus = 'ACCEPTED';
    if (currentStatus === 'PENDING') nextStatus = 'ACCEPTED';
    else if (currentStatus === 'ACCEPTED') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'DELIVERED';

    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
            Culinary Operations
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
            Kitchen Display System (KDS)
          </h1>
          <p className="page-subtitle">
            Live incoming guest food tickets and preparation pipeline.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
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

                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Room: <strong>{order.roomId?.roomNumber || '302'}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {order.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
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
