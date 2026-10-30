import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, CheckCircle2, UserCheck, Eye, RefreshCw, CreditCard } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const AccountsFolio = () => {
  const { currentUser } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStayId, setSelectedStayId] = useState(null);
  const [folioData, setFolioData] = useState(null);
  const [loadingFolio, setLoadingFolio] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/checkin/guests');
      setGuests(res.data || []);
      if (res.data?.length > 0 && !selectedStayId) {
        handleViewFolio(res.data[0].stayId);
      }
    } catch (err) {
      console.error('Failed to load guest registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleViewFolio = async (stayId) => {
    setSelectedStayId(stayId);
    setLoadingFolio(true);
    try {
      const res = await api.get(`/billing/stay/${stayId}/folio`);
      setFolioData(res.data);
    } catch (err) {
      console.warn('Folio load error:', err);
    } finally {
      setLoadingFolio(false);
    }
  };

  const handleSettleFolio = async (stayId) => {
    try {
      await api.post(`/billing/stay/${stayId}/settle`, { paymentMethod: 'CARD' });
      showToast('Guest folio settled and marked paid in full!');
      await handleViewFolio(stayId);
      await fetchGuests();
    } catch (err) {
      alert(err.message || 'Folio settlement failed');
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
            Accounts & Billing Desk
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
            Guest Folio Audits & Settlement
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Itemized guest charge logs, room tariffs, culinary tickets, paid amenities, and tax breakdowns.
          </p>
        </div>

        <button onClick={fetchGuests} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh Folios
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
        {/* Left Guest Folio Selection List */}
        <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Active Guest Reservations ({guests.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
            {guests.map((g) => {
              const isSelected = g.stayId === selectedStayId;
              return (
                <div
                  key={g._id}
                  onClick={() => handleViewFolio(g.stayId)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--gold-soft)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                      {g.guest?.name || 'Registered Guest'}
                    </span>
                    <span className="badge badge-gold">
                      Room {g.room?.roomNumber || '302'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>Booking: {g.booking?.bookingNumber || 'BK-101'}</span>
                    <span style={{ fontWeight: 600 }}>₹{g.booking?.totalAmount || 4500} Base</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Itemized Folio Details */}
        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} color="var(--gold-primary)" /> Itemized Guest Folio Statement
          </h3>

          {loadingFolio ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Calculating itemized folio statement...
            </div>
          ) : !folioData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Select a reservation on the left to inspect folio charges.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Folio Reference</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {folioData.bookingNumber || 'BK-DELHI-101'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suite</div>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                    Room {folioData.roomNumber || '302'}
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {folioData.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.description}
                      </div>
                      <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                        {item.itemType}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700 }}>₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div style={{ borderTop: '2px dashed var(--border-active)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal Net</span>
                  <span>₹{folioData.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Hospitality GST (12%)</span>
                  <span>₹{folioData.taxAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-dark)', marginTop: '4px' }}>
                  <span>Total Payable</span>
                  <span>₹{folioData.totalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSettleFolio(selectedStayId)}
                className="btn btn-gold"
                style={{ padding: '12px', width: '100%', marginTop: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CreditCard size={16} /> Settle & Close Folio (Mark Paid)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
