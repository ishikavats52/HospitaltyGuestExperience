import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Search,
  Filter,
  Eye,
  Calendar,
  X,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const BillingPage = () => {
  const { currentUser } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Folio Audit Modal
  const [selectedStayId, setSelectedStayId] = useState(null);
  const [folioData, setFolioData] = useState(null);
  const [loadingFolio, setLoadingFolio] = useState(false);
  const [settling, setSettling] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGuestsAndBilling = async () => {
    try {
      setLoading(true);
      const res = await api.get('/checkin/guests');
      setGuests(res.data || []);
    } catch (err) {
      console.error('Failed to load billing guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestsAndBilling();
  }, []);

  const handleOpenFolio = async (stayId) => {
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

  const handleSettleFolio = async (stayId, paymentMethod = 'CARD') => {
    setSettling(true);
    try {
      await api.post(`/billing/stay/${stayId}/settle`, { paymentMethod });
      showToast('Guest invoice settled and marked PAID in full!');
      await handleOpenFolio(stayId);
      await fetchGuestsAndBilling();
    } catch (err) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const isSettled = g.stayStatus === 'CHECKED_OUT' || g.status === 'CHECKED_OUT';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SETTLED' && isSettled) ||
      (statusFilter === 'PENDING' && !isSettled);

    return matchesSearch && matchesStatus;
  });

  const totalCalculatedRevenue = guests.reduce((acc, g) => acc + (g.folioBalance || 4500), 0);
  const settledCount = guests.filter((g) => g.stayStatus === 'CHECKED_OUT' || g.status === 'CHECKED_OUT').length;
  const pendingCount = guests.length - settledCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={20} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--gold-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 800,
            }}
          >
            Hotel Admin Operations
          </div>
          <h1
            className="title-gold page-title"
            style={{ fontSize: '2.2rem', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 800 }}
          >
            Billing & Invoices Hub
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Real-time guest folios, settlement audits, dining invoices, room tariffs, and tax compliance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-outline"
          style={{
            padding: '12px 22px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Printer size={16} />
          <span>Print Billing Ledger</span>
        </button>
      </div>

      {/* Key Financial Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--gold-soft)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Billed Revenue</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ₹{totalCalculatedRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 600 }}>
              Live Gross Value
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#E6F7F7',
              color: '#008489',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Settled Invoices</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#008489', lineHeight: 1.1 }}>
              {settledCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Paid in full
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#FFF0F3',
              color: 'var(--gold-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Settlement</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1.1 }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              In-house active folios
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--gold-soft)',
              color: 'var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taxes & GST (12%)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ₹{Math.round(totalCalculatedRevenue * 0.12).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Statutory hospitality tax
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: '280px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--gold-primary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              placeholder="Search by guest name, booking number, room..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Payment Status:
            </span>
            <select
              className="input-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '130px', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Folios</option>
              <option value="PENDING">Pending Settlement</option>
              <option value="SETTLED">Settled & Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Folios Registry Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
            <Receipt size={36} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading guest folios & billing registry...</div>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <Receipt size={44} color="var(--gold-primary)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No guest folios found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try modifying your search or filter options.'
              : 'Guest billing charges will automatically appear as guests check in and make orders.'}
          </p>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Guest Details
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Room / Property
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Booking Ref
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Folio Balance
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g, idx) => {
                  const isSettled = g.stayStatus === 'CHECKED_OUT' || g.status === 'CHECKED_OUT';
                  return (
                    <tr
                      key={g.stayId || idx}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {g.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {g.phone || g.email || 'Registered Guest'}
                        </div>
                      </td>

                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--gold-dark)' }}>
                          <span style={{ padding: '2px 8px', background: 'var(--gold-soft)', borderRadius: '6px' }}>
                            Room {g.roomNumber || '302'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {g.propertyName || 'Grand Delhi Main Wing'}
                        </div>
                      </td>

                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {g.bookingNumber || 'BK-DELHI-101'}
                        </span>
                      </td>

                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ₹{(g.folioBalance || 4500).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          incl. 12% GST
                        </div>
                      </td>

                      <td style={{ padding: '18px 20px' }}>
                        {isSettled ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              background: '#E6F7F7',
                              color: '#008489',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Paid in Full</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              background: '#FFF0F3',
                              color: 'var(--gold-dark)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            <CreditCard size={13} />
                            <span>Pending Settlement</span>
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenFolio(g.stayId)}
                            className="btn btn-outline"
                            style={{
                              padding: '7px 12px',
                              fontSize: '0.78rem',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Eye size={14} />
                            <span>Audit Folio</span>
                          </button>

                          {!isSettled && (
                            <button
                              type="button"
                              onClick={() => handleSettleFolio(g.stayId)}
                              className="btn btn-gold"
                              style={{
                                padding: '7px 14px',
                                fontSize: '0.78rem',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              Settle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Itemized Folio Audit Modal */}
      {selectedStayId && (
        <div className="modal-backdrop active" onClick={() => setSelectedStayId(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '90%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Official Tax Invoice
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                  Guest Folio Statement
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStayId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {loadingFolio ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>
                  <Receipt size={30} color="var(--gold-primary)" />
                </div>
                <div>Fetching itemized charge ledger...</div>
              </div>
            ) : folioData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Folio Metadata */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.84rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Room Number: </span>
                    <strong style={{ color: 'var(--gold-dark)' }}>{folioData.roomNumber || '302'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Booking Ref: </span>
                    <strong>{folioData.bookingNumber || 'BK-DELHI-101'}</strong>
                  </div>
                </div>

                {/* Itemized Charge Line Items */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Itemized Billing Charges
                  </div>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    {folioData.items?.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: i < folioData.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                          background: i % 2 === 0 ? '#FFFFFF' : 'var(--bg-primary)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Type: {item.itemType}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{item.totalPrice?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & Taxes */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: '#FFF9FA',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Net Subtotal:</span>
                    <span>₹{folioData.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hospitality GST (12%):</span>
                    <span>₹{folioData.taxAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      color: 'var(--gold-dark)',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '8px',
                      marginTop: '4px',
                    }}
                  >
                    <span>Total Amount Payable:</span>
                    <span>₹{folioData.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-outline"
                    style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} /> Print Receipt
                  </button>

                  <button
                    type="button"
                    disabled={settling}
                    onClick={() => handleSettleFolio(selectedStayId)}
                    className="btn btn-gold"
                    style={{ padding: '11px 24px', borderRadius: 'var(--radius-full)' }}
                  >
                    {settling ? 'Processing...' : 'Settle Folio (Paid in Full)'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px' }}>Failed to retrieve folio data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;

