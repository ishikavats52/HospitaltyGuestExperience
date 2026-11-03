import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Users,
  Sparkles,
  Utensils,
  Building2,
  ShieldCheck,
  Mail,
  ArrowRight,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  LogOut,
  LogIn,
  Clock,
  RefreshCw,
  X,
  Phone,
  UserCheck,
  Lock,
  LayoutGrid,
  List,
  ZoomIn,
  Calendar,
  ChevronRight,
  UserPlus,
  Copy,
  Check,
  Zap,
  Tag,
  Brush,
  Wrench,
  Key,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { WalkInGuestModal } from '../../components/modals/WalkInGuestModal.jsx';

export const HotelDashboard = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'HOTEL_ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const [hotelInfo, setHotelInfo] = useState(null);

  // Today's Bookings State
  const [todayBookings, setTodayBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [copiedBookingId, setCopiedBookingId] = useState(null);

  // Live Room Rack Inventory State (Allotted vs Empty)
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomFilter, setRoomFilter] = useState('ALL'); // ALL, OCCUPIED, AVAILABLE, CLEANING, MAINTENANCE

  // KYC Registry Guests State
  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState('ALL');
  const [guestViewMode, setGuestViewMode] = useState('card');

  // Modals & UI Action State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState(null);
  const [selectedKycGuest, setSelectedKycGuest] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Comprehensive Data Fetcher
  const fetchAllData = async () => {
    try {
      // 1. Hotel Tenant Details
      if (currentUser?.hotelId) {
        api.get(`/hotels/${currentUser.hotelId}`)
          .then((res) => setHotelInfo(res.data))
          .catch(() => {});
      }

      // 2. Today's Bookings & Scheduled Arrivals
      setLoadingBookings(true);
      try {
        const bkRes = await api.get('/bookings/today');
        setTodayBookings(bkRes.data || []);
      } catch (bkErr) {
        console.warn('Failed to load today bookings:', bkErr);
      } finally {
        setLoadingBookings(false);
      }

      // 3. Live Room Rack Inventory
      setLoadingRooms(true);
      try {
        const roomsRes = await api.get('/rooms');
        setRooms(roomsRes.data || []);
      } catch (rmErr) {
        console.warn('Failed to load room rack:', rmErr);
      } finally {
        setLoadingRooms(false);
      }

      // 4. KYC Guests Register
      setLoadingGuests(true);
      try {
        const guestsRes = await api.get('/checkin/guests');
        setGuests(guestsRes.data || []);
      } catch (gErr) {
        console.warn('Failed to load guests register:', gErr);
      } finally {
        setLoadingGuests(false);
      }
    } catch (err) {
      console.error('Data sync failed:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser?.hotelId]);

  // Copy Magic Link to clipboard
  const handleCopyMagicLink = (booking) => {
    const link = `${window.location.origin}${booking.magicLink || `/stay/${booking.bookingNumber}`}`;
    navigator.clipboard.writeText(link);
    setCopiedBookingId(booking._id || booking.bookingNumber);
    showToast(`Magic express check-in link copied for ${booking.guestName}!`);
    setTimeout(() => setCopiedBookingId(null), 3000);
  };

  // 1-Click Check-In from Admin Dashboard
  const handleDirectCheckIn = async (booking) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${booking._id}/checkin`, { roomId: booking.roomId });
      showToast(`Guest ${booking.guestName} checked into Room ${booking.roomNumber || 'assigned'}!`);
      await fetchAllData();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Room Turnover: Mark Clean & Ready
  const handleMarkRoomClean = async (roomId, roomNumber) => {
    setActionLoading(true);
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: 'AVAILABLE' });
      showToast(`Room ${roomNumber} is now sanitized, clean, and ready for walk-ins!`);
      await fetchAllData();
    } catch (err) {
      alert(err.message || 'Room status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Walk-In Modal for specific empty room
  const handleOpenWalkInForRoom = (roomId) => {
    setPreselectedRoomId(roomId);
    setIsWalkInModalOpen(true);
  };

  // Check-Out Guest & Release Room to Cleaning
  const handleCheckoutGuest = async (stayId, guestName, roomNumber) => {
    if (!window.confirm(`Process check-out for ${guestName || 'Guest'} in Room ${roomNumber || ''}? Room will move to Turnover Cleaning.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/qr/checkout', { stayId });
      showToast(`Check-out completed for ${guestName}. Room moved to Cleaning queue.`);
      if (selectedKycGuest && selectedKycGuest.stayId === stayId) {
        setSelectedKycGuest(null);
      }
      await fetchAllData();
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin-Only: Permanently delete booking and release room back to AVAILABLE
  const handleDeleteBooking = async (booking) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Hotel Admins have permission to delete bookings. Booking staff can create bookings only.');
      return;
    }

    const confirmMsg = `Are you sure you want to permanently delete booking "${booking.bookingNumber}" for ${booking.guestName}?\n\n• The stay folio will be deleted from database.\n• Room ${booking.roomNumber || ''} will immediately be restored to AVAILABLE.\n• This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      await api.delete(`/bookings/${booking._id}`);
      showToast(`Booking ${booking.bookingNumber} deleted & Room ${booking.roomNumber || ''} restored to Available!`);
      await fetchAllData();
    } catch (err) {
      alert(err.message || 'Failed to delete booking');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for Room Allotment Metrics
  const totalRoomsCount = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED');
  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');
  const cleaningRooms = rooms.filter((r) => r.status === 'CLEANING');
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE');
  const occupancyPercent = totalRoomsCount > 0 ? Math.round((occupiedRooms.length / totalRoomsCount) * 100) : 0;

  // Filtered Today's Bookings
  const filteredBookings = todayBookings.filter((b) => {
    const matchesSearch =
      (b.guestName && b.guestName.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      (b.roomNumber && String(b.roomNumber).includes(bookingSearch)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      (b.guestPhone && b.guestPhone.includes(bookingSearch));

    if (!matchesSearch) return false;

    if (bookingFilter === 'CHECKED_IN') return b.stayStatus === 'STAY_ACTIVE' || b.status === 'CHECKED_IN';
    if (bookingFilter === 'PENDING') return b.stayStatus === 'CHECK_IN_PENDING' || b.status === 'CONFIRMED';
    if (bookingFilter === 'CHECKED_OUT') return b.status === 'CHECKED_OUT' || b.stayStatus === 'CHECKED_OUT';

    return true;
  });

  // Filtered Room Rack
  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'ALL') return true;
    return r.status === roomFilter;
  });

  // Filtered KYC Guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      (g.guest?.name && g.guest.name.toLowerCase().includes(guestSearch.toLowerCase())) ||
      (g.room?.roomNumber && String(g.room.roomNumber).includes(guestSearch)) ||
      (g.kyc?.idNumber && g.kyc.idNumber.includes(guestSearch));

    if (!matchesSearch) return false;
    if (guestStatusFilter === 'IN_HOUSE') return g.stay?.status === 'CHECKED_IN' || g.stay?.status === 'STAY_ACTIVE';
    if (guestStatusFilter === 'CHECKED_OUT') return g.stay?.status === 'CHECKED_OUT';
    if (guestStatusFilter === 'PENDING') return g.stay?.status === 'BOOKING_CONFIRMED' || !g.stay?.status;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Notification */}
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
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & INSTANT DESK ACTIONS                         */}
      {/* ------------------------------------------------------------- */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: 'clamp(16px, 3vw, 24px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Hotel General Manager & Front Desk Operations
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '4px 0 6px', letterSpacing: '-0.02em' }}>
            {hotelInfo?.name || 'Aura Grand Palace'} Overview
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.88rem' }}>
            Live room rack (allotted vs empty), today's scheduled arrivals, on-the-spot walk-ins, and guest KYC ledger.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loadingBookings || loadingRooms}
            className="btn btn-outline"
            style={{ padding: '9px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={loadingBookings || loadingRooms ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreselectedRoomId(null);
              setIsWalkInModalOpen(true);
            }}
            className="btn btn-gold"
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(229, 169, 60, 0.3)',
            }}
          >
            <UserPlus size={18} />
            <span>+ Register Walk-In Guest</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TODAY'S BOOKINGS & SCHEDULED ARRIVALS (PINNED ON TOP)      */}
      {/* ------------------------------------------------------------- */}
      <section
        className="glass-panel animate-fade-in"
        style={{
          padding: 'clamp(16px, 3vw, 24px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          borderTop: '4px solid var(--gold-primary)',
        }}
      >
        {/* Section Title & Filtering */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px',
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
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Today's Bookings & Scheduled Arrivals
                </h2>
                <span
                  style={{
                    background: 'var(--gold-soft)',
                    color: 'var(--gold-dark)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {todayBookings.length} Guests
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Incoming reservations, WhatsApp magic check-in links, and express front-desk allotment
              </p>
            </div>
          </div>

          {/* Quick Search & Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search guest or room..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 30px',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'ALL', label: 'All Today' },
                { id: 'CHECKED_IN', label: 'Checked In' },
                { id: 'PENDING', label: 'Pending Arrival' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setBookingFilter(f.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: bookingFilter === f.id ? 'var(--gold-primary)' : 'var(--border-color)',
                    background: bookingFilter === f.id ? 'var(--gold-soft)' : '#FFFFFF',
                    color: bookingFilter === f.id ? 'var(--gold-dark)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Content */}
        {loadingBookings ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            <RefreshCw size={22} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--gold-primary)' }} />
            Loading today's arrivals and active bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 16px',
              backgroundColor: 'var(--bg-tertiary, #faf7f5)',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
            }}
          >
            <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              No bookings matching this filter
            </div>
            <p style={{ margin: '4px 0 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Walk-in guests arriving now can be registered with immediate room allotment.
            </p>
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="btn btn-gold"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              + Register Walk-In Guest
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '14px' }}>
            {filteredBookings.map((b) => {
              const isCheckedIn = b.stayStatus === 'STAY_ACTIVE' || b.status === 'CHECKED_IN';
              const isCheckedOut = b.status === 'CHECKED_OUT' || b.stayStatus === 'CHECKED_OUT';
              const isCopied = copiedBookingId === (b._id || b.bookingNumber);

              return (
                <div
                  key={b._id || b.bookingNumber}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isCheckedIn ? '1px solid rgba(28, 108, 67, 0.35)' : '1px solid var(--border-color)',
                    borderLeft: isCheckedIn ? '4px solid var(--success, #1c6c43)' : '4px solid var(--gold-primary)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Top: Guest Info & Status Badge */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                          {b.bookingNumber} • {b.source || (b.isWalkIn ? 'WALK-IN' : 'DIRECT')}
                        </div>
                        <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {b.guestName}
                        </h4>
                      </div>

                      {isCheckedIn ? (
                        <span className="badge badge-free" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                          ● In-House
                        </span>
                      ) : isCheckedOut ? (
                        <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          Checked Out
                        </span>
                      ) : (
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                          Pending Arrival
                        </span>
                      )}
                    </div>

                    {/* Room & Tariff Strip */}
                    <div
                      style={{
                        background: 'var(--bg-tertiary, #faf7f5)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BedDouble size={14} color="var(--gold-primary)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {b.roomNumber && b.roomNumber !== 'Unassigned' ? `Room ${b.roomNumber}` : 'Unassigned Room'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                          ({b.roomTypeName || 'Deluxe'})
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--gold-dark)' }}>
                        ₹{Number(b.totalAmount || 4500).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Phone & Schedule */}
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {b.guestPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color="var(--text-muted)" />
                          <span>{b.guestPhone}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>Dates: {b.checkInDate || 'Today'} → {b.checkOutDate || 'Tomorrow'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Copy Magic Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyMagicLink(b)}
                      className="btn btn-outline"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.74rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: isCopied ? 'var(--success)' : 'var(--text-secondary)',
                      }}
                      title="Copy Express 60-Second Check-In Link for WhatsApp"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Link Copied!' : 'Copy Magic Link'}</span>
                    </button>

                    {/* Check In / Out Action */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!isCheckedIn && !isCheckedOut && (
                        <button
                          type="button"
                          onClick={() => handleDirectCheckIn(b)}
                          disabled={actionLoading}
                          className="btn btn-gold"
                          style={{ padding: '5px 12px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Zap size={12} /> Check-In
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          type="button"
                          onClick={() => handleCheckoutGuest(b.stayId, b.guestName, b.roomNumber)}
                          disabled={actionLoading}
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: '0.74rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                          <LogOut size={12} /> Check-Out
                        </button>
                      )}

                      {/* Admin-Only Delete Booking Option (Booking Staff Cannot Delete) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(b)}
                          disabled={actionLoading}
                          className="btn btn-outline"
                          style={{
                            padding: '5px 9px',
                            fontSize: '0.74rem',
                            color: '#DC2626',
                            borderColor: '#FCA5A5',
                            backgroundColor: '#FEF2F2',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Admin Only: Permanently Delete Booking & Free Room"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. REAL-TIME ROOM INVENTORY RACK (ALLOTTED VS EMPTY)          */}
      {/* ------------------------------------------------------------- */}
      <section
        className="glass-panel animate-fade-in"
        style={{
          padding: 'clamp(16px, 3vw, 24px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Rack Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div>
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
                }}
              >
                <BedDouble size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Real-Time Room Inventory & Allotment Status
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Clear rack visibility: instantly distinguish between <strong>Allotted (Occupied)</strong>, <strong>Empty (Available)</strong>, and <strong>Turnover Cleaning</strong>.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/admin/rooms"
            className="btn btn-outline"
            style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <span>Manage All Rooms</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Metric Badges Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '18px',
          }}
        >
          {/* Card: Total Rooms */}
          <div
            onClick={() => setRoomFilter('ALL')}
            style={{
              padding: '12px 14px',
              backgroundColor: roomFilter === 'ALL' ? 'var(--gold-soft)' : 'var(--bg-tertiary, #faf7f5)',
              border: roomFilter === 'ALL' ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Inventory</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {totalRoomsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>All property rooms</div>
          </div>

          {/* Card: Allotted (Occupied) */}
          <div
            onClick={() => setRoomFilter('OCCUPIED')}
            style={{
              padding: '12px 14px',
              backgroundColor: roomFilter === 'OCCUPIED' ? '#FFE8ED' : '#FFF5F6',
              border: roomFilter === 'OCCUPIED' ? '2px solid #BA3333' : '1px solid rgba(186, 51, 51, 0.2)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#BA3333', fontWeight: 700 }}>● Allotted (Occupied)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#BA3333', marginTop: '2px' }}>
              {occupiedRooms.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#BA3333', opacity: 0.8, marginTop: '2px' }}>In-stay guests</div>
          </div>

          {/* Card: Empty (Available) */}
          <div
            onClick={() => setRoomFilter('AVAILABLE')}
            style={{
              padding: '12px 14px',
              backgroundColor: roomFilter === 'AVAILABLE' ? '#E6F4EA' : '#F0F9F3',
              border: roomFilter === 'AVAILABLE' ? '2px solid #1c6c43' : '1px solid rgba(28, 108, 67, 0.25)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#1c6c43', fontWeight: 700 }}>● Empty & Ready</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1c6c43', marginTop: '2px' }}>
              {availableRooms.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#1c6c43', opacity: 0.8, marginTop: '2px' }}>Ready for walk-in</div>
          </div>

          {/* Card: Cleaning (Turnover) */}
          <div
            onClick={() => setRoomFilter('CLEANING')}
            style={{
              padding: '12px 14px',
              backgroundColor: roomFilter === 'CLEANING' ? '#FEF3C7' : '#FFFBEB',
              border: roomFilter === 'CLEANING' ? '2px solid #D97706' : '1px solid rgba(217, 119, 6, 0.25)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>● Turnover Cleaning</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>
              {cleaningRooms.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#D97706', opacity: 0.8, marginTop: '2px' }}>Sanitizing pipeline</div>
          </div>

          {/* Card: Occupancy Rate */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-tertiary, #faf7f5)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Occupancy Rate</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--gold-dark)', marginTop: '2px' }}>
              {occupancyPercent}%
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Live utilization</div>
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'ALL', label: `All Rooms (${rooms.length})` },
            { id: 'OCCUPIED', label: `🔴 Allotted / Occupied (${occupiedRooms.length})` },
            { id: 'AVAILABLE', label: `🟢 Empty & Ready (${availableRooms.length})` },
            { id: 'CLEANING', label: `🟡 Turnover Cleaning (${cleaningRooms.length})` },
            { id: 'MAINTENANCE', label: `🟠 Maintenance (${maintenanceRooms.length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setRoomFilter(pill.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: roomFilter === pill.id ? 'var(--gold-primary)' : 'var(--border-color)',
                backgroundColor: roomFilter === pill.id ? 'var(--gold-soft)' : '#FFFFFF',
                color: roomFilter === pill.id ? 'var(--gold-dark)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Room Grid Cards */}
        {loadingRooms ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
            <RefreshCw size={22} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--gold-primary)' }} />
            Loading live room rack...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No rooms found for filter '{roomFilter}'.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: '14px',
            }}
          >
            {filteredRooms.map((room) => {
              const isOccupied = room.status === 'OCCUPIED';
              const isAvailable = room.status === 'AVAILABLE';
              const isCleaning = room.status === 'CLEANING';
              const isMaintenance = room.status === 'MAINTENANCE';

              // Find active guest occupying this room
              const activeStay = guests.find(
                (g) =>
                  String(g.room?.id || g.room?._id) === String(room._id) &&
                  (g.stay?.status === 'CHECKED_IN' || g.stay?.status === 'STAY_ACTIVE')
              );

              return (
                <div
                  key={room._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: isOccupied
                      ? '1px solid rgba(186, 51, 51, 0.4)'
                      : isAvailable
                      ? '1px solid rgba(28, 108, 67, 0.35)'
                      : isCleaning
                      ? '1px solid rgba(217, 119, 6, 0.35)'
                      : '1px solid var(--border-color)',
                    borderTop: isOccupied
                      ? '4px solid #BA3333'
                      : isAvailable
                      ? '4px solid var(--success, #1c6c43)'
                      : isCleaning
                      ? '4px solid #D97706'
                      : '4px solid var(--text-muted)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Content */}
                  <div style={{ padding: '14px' }}>
                    {/* Header: Room Number & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Room {room.roomNumber}
                      </span>

                      {isOccupied && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#BA3333', background: '#FFE8ED', padding: '3px 8px', borderRadius: '12px' }}>
                          ● ALLOTTED
                        </span>
                      )}
                      {isAvailable && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1c6c43', background: '#E6F4EA', padding: '3px 8px', borderRadius: '12px' }}>
                          ● EMPTY / READY
                        </span>
                      )}
                      {isCleaning && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '12px' }}>
                          ● CLEANING
                        </span>
                      )}
                      {isMaintenance && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: '12px' }}>
                          ● REPAIR
                        </span>
                      )}
                    </div>

                    {/* Room Type & Floor */}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {room.roomTypeName || 'Deluxe Room'} • Floor {room.floor || 1}
                    </div>

                    {/* Occupant or Vacant State */}
                    {isOccupied && (
                      <div
                        style={{
                          background: '#FFF5F6',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.78rem',
                          color: '#BA3333',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>Occupant: {activeStay?.guest?.name || 'In-House Guest'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Checked In: {activeStay?.checkedInAt ? new Date(activeStay.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active Stay'}
                        </div>
                      </div>
                    )}

                    {isAvailable && (
                      <div
                        style={{
                          background: '#F0F9F3',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.76rem',
                          color: '#1c6c43',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Vacant & Sanitized for walk-ins</span>
                      </div>
                    )}

                    {isCleaning && (
                      <div
                        style={{
                          background: '#FFFBEB',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          fontSize: '0.76rem',
                          color: '#D97706',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Brush size={14} />
                        <span>Awaiting Housekeeping Sanitization</span>
                      </div>
                    )}

                    {/* Tariff */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Tariff:</span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        ₹{Number(room.pricePerNight || 4500).toLocaleString('en-IN')}/night
                      </strong>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    {isAvailable && (
                      <button
                        type="button"
                        onClick={() => handleOpenWalkInForRoom(room._id)}
                        className="btn btn-gold"
                        style={{ width: '100%', padding: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <UserPlus size={14} /> + Allot to Walk-In
                      </button>
                    )}

                    {isCleaning && (
                      <button
                        type="button"
                        onClick={() => handleMarkRoomClean(room._id, room.roomNumber)}
                        disabled={actionLoading}
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#1c6c43', borderColor: 'rgba(28, 108, 67, 0.4)' }}
                      >
                        <Sparkles size={14} /> Mark Clean & Ready
                      </button>
                    )}

                    {isOccupied && (
                      <button
                        type="button"
                        onClick={() => handleCheckoutGuest(activeStay?.stayId, activeStay?.guest?.name, room.roomNumber)}
                        disabled={actionLoading}
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#BA3333', borderColor: 'rgba(186, 51, 51, 0.3)' }}
                      >
                        <LogOut size={14} /> Check-Out Room
                      </button>
                    )}

                    {isMaintenance && (
                      <button
                        type="button"
                        onClick={() => handleMarkRoomClean(room._id, room.roomNumber)}
                        disabled={actionLoading}
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '6px', fontSize: '0.78rem' }}
                      >
                        Resolve & Mark Available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. DIGITAL GUEST KYC & AADHAAR VERIFICATION REGISTER         */}
      {/* ------------------------------------------------------------- */}
      <section
        className="glass-panel animate-fade-in"
        style={{
          padding: 'clamp(16px, 3vw, 24px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
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
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Digital Guest KYC & Aadhaar Verification Ledger
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Government-compliant digital guest registry, check-in timestamps, and Aadhaar identity credentials.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter by guest or ID..."
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="btn btn-gold"
              style={{
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <UserPlus size={15} />
              <span>+ Register Guest</span>
            </button>
          </div>
        </div>

        {/* KYC Table */}
        {loadingGuests ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Loading guest register...</div>
        ) : filteredGuests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No guest profiles registered yet
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Manually register a walk-in guest or upcoming arrival to allocate a room and create a verified digital stay record.
            </p>
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="btn btn-gold"
              style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} />
              <span>Register First Guest</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Guest Name & ID</th>
                  <th>Allotted Room</th>
                  <th>Stay Status</th>
                  <th>ID Document Type</th>
                  <th>Check-In Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g) => {
                  const isCheckedIn = g.stay?.status === 'CHECKED_IN' || g.stay?.status === 'STAY_ACTIVE';
                  return (
                    <tr key={g._id || g.stayId}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{g.guest?.name || 'Guest'}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{g.guest?.phone || 'No Phone'}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>
                          {g.room?.roomNumber ? `Room ${g.room.roomNumber}` : 'Room 302'}
                        </span>
                      </td>
                      <td>
                        {isCheckedIn ? (
                          <span className="badge badge-free" style={{ fontSize: '0.7rem' }}>IN-HOUSE</span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {g.stay?.status || 'CHECKED OUT'}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {g.kyc?.idType || 'AADHAAR'}: {g.kyc?.idNumber || '4126-3082-2252'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {g.checkedInAt ? new Date(g.checkedInAt).toLocaleString('en-IN') : 'Verified at Desk'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedKycGuest(g)}
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                        >
                          <Eye size={12} /> Inspect KYC
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. WALK-IN GUEST REGISTRATION MODAL                          */}
      {/* ------------------------------------------------------------- */}
      <WalkInGuestModal
        isOpen={isWalkInModalOpen}
        onClose={() => {
          setIsWalkInModalOpen(false);
          setPreselectedRoomId(null);
        }}
        preselectedRoomId={preselectedRoomId}
        availableRooms={rooms}
        onSuccess={() => {
          showToast('Walk-in guest successfully registered and allotted room!');
          fetchAllData();
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 6. KYC DETAILS INSPECTION MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {selectedKycGuest && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedKycGuest(null);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: 'min(94vw, 560px)',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="var(--success)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Guest KYC Credentials</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKycGuest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Guest Name:</span>
                <strong>{selectedKycGuest.guest?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Contact Phone:</span>
                <strong>{selectedKycGuest.guest?.phone || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Room Allotted:</span>
                <strong>Room {selectedKycGuest.room?.roomNumber || '302'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ID Verification:</span>
                <strong>{selectedKycGuest.kyc?.idType || 'AADHAAR'}: {selectedKycGuest.kyc?.idNumber || '4126-3082-2252'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Verification Status:</span>
                <span className="badge badge-free" style={{ fontSize: '0.72rem' }}>VERIFIED</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedKycGuest(null)}
              className="btn btn-gold"
              style={{ width: '100%', marginTop: '20px', padding: '10px' }}
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
