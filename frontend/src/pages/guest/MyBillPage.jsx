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

  const stayId = currentUser?.stay?._id || currentUser?.stayId || currentUser?.bookingId || (typeof currentUser?.stay === 'string' ? currentUser?.stay : 'me');

  useEffect(() => {
    const fetchFolio = async () => {
      try {
        const idToQuery = stayId || 'me';
        const res = await api.get(`/billing/stay/${idToQuery}/folio`);
        setFolio(res.data);
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
      const targetStayId = folio?.stayId || stayId || 'me';
      await api.post(`/billing/stay/${targetStayId}/settle`, {
        paymentMethod: 'RAZORPAY_UPI',
        amountPaid: netTotal || 0,
      });
      setSettled(true);
    } catch (err) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  // Strictly in-stay items ordered by guest after check-in (kitchen dining & hotel services)
  const billableItems = (folio?.items || []).filter((item) => item.itemType !== 'ROOM');
  const subtotal = billableItems.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const taxAmount = Math.round(subtotal * 0.12);
  const netTotal = subtotal + taxAmount;

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
          Real-time charges for room dining orders and requested hotel services.
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

          {billableItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ECFDF5', color: '#047857', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Check size={24} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Zero Pending Charges
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.4 }}>
                You have not ordered any culinary dishes from the kitchen yet. Any in-room dining orders will appear here automatically.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {billableItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                  <div style={{ flex: 1, paddingRight: '10px' }}>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.65rem',
                        marginRight: '8px',
                        background: item.itemType === 'FOOD' ? '#ECFDF5' : '#EFF6FF',
                        color: item.itemType === 'FOOD' ? '#047857' : '#1D4ED8',
                        border: `1px solid ${item.itemType === 'FOOD' ? '#A7F3D0' : '#BFDBFE'}`,
                        fontWeight: 700,
                      }}
                    >
                      {item.itemType === 'FOOD' ? 'DINING' : 'SERVICE'}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{item.totalPrice}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Taxes & GST (12%)</span>
              <span>₹{taxAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-primary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
              <span>Net Balance Due</span>
              <span>₹{netTotal}</span>
            </div>
          </div>

          {!settled && (
            netTotal > 0 ? (
              <button
                onClick={handleSettleFolio}
                disabled={settling}
                className="btn btn-gold"
                style={{ width: '100%', marginTop: '24px', padding: '13px' }}
              >
                <CreditCard size={18} /> {settling ? 'Processing Settlement...' : `Pay & Express Checkout (₹${netTotal})`}
              </button>
            ) : (
              <div
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                ✓ All Settled • No Outstanding Balance
              </div>
            )
          )}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={15} color="var(--gold-primary)" /> Verified Payment Gateway Integration
      </div>
    </div>
  );
};
