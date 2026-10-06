import React, { useState, useEffect } from 'react';
import { Receipt, Check, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const MyBillPage = () => {
  const { currentUser } = useAuth();
  const [folio, setFolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [settled, setSettled] = useState(false);

  const stayId = currentUser?.stay?._id || currentUser?.stayId || (typeof currentUser?.stay === 'string' ? currentUser?.stay : null);

  useEffect(() => {
    const fetchFolio = async () => {
      try {
        if (stayId) {
          const res = await api.get(`/billing/stay/${stayId}/folio`);
          setFolio(res.data);
        }
      } catch (err) {
        console.error('Failed to load folio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFolio();
  }, [stayId]);

  const handleSettleFolio = async () => {
    setSettling(true);
    try {
      await api.post(`/billing/stay/${stayId}/settle`, {
        paymentMethod: 'RAZORPAY_UPI',
        amountPaid: folio?.totalAmount || 0,
      });
      setSettled(true);
    } catch (err) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Live Guest Folio
        </div>
        <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
          Statement & Settle
        </h2>
        <p className="page-subtitle">
          Real-time charges for room, dining, and hotel services.
        </p>
      </div>

      {settled && (
        <div style={{ padding: '16px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(28, 108, 67, 0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={20} />
          <div>
            <div style={{ fontWeight: 600 }}>Checkout Completed & Settled</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Thank you for staying with us. A tax invoice has been sent to your email.</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Compiling folio statement...
        </div>
      ) : folio ? (
        <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3.5vw, 24px)', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Folio Reference</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>{folio.bookingNumber}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Assigned Room</div>
              <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.05rem' }}>Room {folio.roomNumber}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {folio.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginRight: '8px' }}>
                    {item.itemType}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{item.totalPrice}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{folio.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Taxes & GST (12%)</span>
              <span>₹{folio.taxAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <span>Net Balance Due</span>
              <span>₹{folio.totalAmount}</span>
            </div>
          </div>

          {!settled && (
            <button
              onClick={handleSettleFolio}
              disabled={settling}
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '24px', padding: '13px' }}
            >
              <CreditCard size={18} /> {settling ? 'Processing Settlement...' : `Pay & Express Checkout (₹${folio.totalAmount})`}
            </button>
          )}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={15} color="var(--gold-primary)" /> Verified Payment Gateway Integration
      </div>
    </div>
  );
};
