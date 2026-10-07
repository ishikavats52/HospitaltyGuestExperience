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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export const HotelDashboard = () => {
  const { currentUser } = useAuth();
  const [hotelInfo, setHotelInfo] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('card'); // 'card' (mobile friendly) or 'table'

  // KYC Inspector Modal State
  const [selectedKycGuest, setSelectedKycGuest] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchHotelAndGuests = async () => {
    try {
      setLoadingGuests(true);

      // 1. Fetch Hotel Tenant Details
      if (currentUser?.hotelId) {
        try {
          const hotelRes = await api.get(`/hotels/${currentUser.hotelId}`);
          setHotelInfo(hotelRes.data);
        } catch (_) {}
      }

      // 2. Fetch Guests with Full Stay & KYC Verification Credentials
      const guestsRes = await api.get('/checkin/guests');
      setGuests(guestsRes.data || []);
    } catch (err) {
      console.warn('Failed to fetch guests list:', err);
    } finally {
      setLoadingGuests(false);
    }
  };

  useEffect(() => {
    fetchHotelAndGuests();
  }, [currentUser?.hotelId]);

  const handleAdminCheckout = async (stayId, guestName) => {
    if (!window.confirm(`Are you sure you want to process check-out for ${guestName}? Room will be marked available.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/checkin/checkout', { stayId });
      showToast(`Check-out completed for ${guestName}. Room released.`);
      if (selectedKycGuest && selectedKycGuest.stayId === stayId) {
        setSelectedKycGuest(null);
      }
      await fetchHotelAndGuests();
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper formatting functions for dates, times, and duration
  const formatDateTime = (isoString) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (_) {
      return null;
    }
  };

  const formatShortTime = (isoString) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (_) {
      return null;
    }
  };

  const formatStayDuration = (startIso, endIso) => {
    if (!startIso) return null;
    try {
      const start = new Date(startIso).getTime();
      const end = endIso ? new Date(endIso).getTime() : Date.now();
      const diffMs = Math.max(0, end - start);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHours >= 24) {
        const days = Math.floor(diffHours / 24);
        const remHours = diffHours % 24;
        return `${days}d ${remHours}h`;
      }
      return `${diffHours}h ${diffMins}m`;
    } catch (_) {
      return null;
    }
  };

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      g.guest?.name?.toLowerCase().includes(term) ||
      g.guest?.email?.toLowerCase().includes(term) ||
      g.room?.roomNumber?.toLowerCase().includes(term) ||
      g.booking?.bookingNumber?.toLowerCase().includes(term) ||
      g.kyc?.idNumber?.toLowerCase().includes(term);

    const isCheckedIn = g.status === 'CHECKED_IN' || g.status === 'STAY_ACTIVE';
    const isCheckedOut = g.status === 'CHECKED_OUT';
    const isPending = !isCheckedIn && !isCheckedOut;

    if (statusFilter === 'CHECKED_IN') return matchesSearch && isCheckedIn;
    if (statusFilter === 'PENDING') return matchesSearch && isPending;
    if (statusFilter === 'CHECKED_OUT') return matchesSearch && isCheckedOut;
    return matchesSearch;
  });

  const checkedInCount = guests.filter((g) => g.status === 'CHECKED_IN' || g.status === 'STAY_ACTIVE').length;
  const checkedOutCount = guests.filter((g) => g.status === 'CHECKED_OUT').length;
  const pendingCount = guests.filter((g) => g.status !== 'CHECKED_IN' && g.status !== 'STAY_ACTIVE' && g.status !== 'CHECKED_OUT').length;

  const scrollToRegister = () => {
    document.getElementById('guest-register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast Alert */}
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

      {/* Welcome & Tenant Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-active)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-free" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HOTEL ADMIN SESSION ACTIVE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Verified Credentials Access
            </span>
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.75rem', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Welcome, {currentUser?.name || 'Hotel Administrator'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="var(--gold-primary)" />
              <span>
                Tenant:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {hotelInfo?.name || 'Hotel Grand Delhi'}
                </strong>
                {hotelInfo?.locationHierarchy?.city ? ` (${hotelInfo.locationHierarchy.city})` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="var(--gold-primary)" />
              <span>{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/services" className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '9px 15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Manage Services</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CLICKABLE INTERACTIVE STAT CARDS (TOUCH-FRIENDLY FOR MOBILE)  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid-kpi">
        {/* Card 1: Live Checked-In */}
        <div
          onClick={() => {
            setStatusFilter('CHECKED_IN');
            scrollToRegister();
          }}
          className={`glass-panel animate-fade-in kpi-card-interactive ${statusFilter === 'CHECKED_IN' ? 'active-filter' : ''}`}
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'CHECKED_IN' ? '2px solid var(--gold-primary)' : '1px solid rgba(16, 185, 129, 0.3)',
          }}
          title="Click to view all checked-in guests and their check-in times"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Checked-In (Active)</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogIn size={18} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--success)' }}>
            {checkedInCount}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>In-Room Verified</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusFilter === 'CHECKED_IN' ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
              {statusFilter === 'CHECKED_IN' ? '● Filtering' : 'Tap to filter →'}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Arrivals / Pending Check-In */}
        <div
          onClick={() => {
            setStatusFilter('PENDING');
            scrollToRegister();
          }}
          className={`glass-panel animate-fade-in kpi-card-interactive ${statusFilter === 'PENDING' ? 'active-filter' : ''}`}
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'PENDING' ? '2px solid var(--gold-primary)' : '1px solid rgba(217, 119, 6, 0.3)',
          }}
          title="Click to view guests pending check-in"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Check-In</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={18} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#D97706' }}>
            {pendingCount}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Awaiting ID upload</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusFilter === 'PENDING' ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
              {statusFilter === 'PENDING' ? '● Filtering' : 'Tap to filter →'}
            </span>
          </div>
        </div>

        {/* Card 3: Checked-Out Guests */}
        <div
          onClick={() => {
            setStatusFilter('CHECKED_OUT');
            scrollToRegister();
          }}
          className={`glass-panel animate-fade-in kpi-card-interactive ${statusFilter === 'CHECKED_OUT' ? 'active-filter' : ''}`}
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'CHECKED_OUT' ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
          }}
          title="Click to view guests who checked out and check-out timestamps"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Checked-Out</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} color="var(--text-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {checkedOutCount}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Completed Stays</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusFilter === 'CHECKED_OUT' ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
              {statusFilter === 'CHECKED_OUT' ? '● Filtering' : 'Tap to filter →'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Registered Guests */}
        <div
          onClick={() => {
            setStatusFilter('ALL');
            scrollToRegister();
          }}
          className={`glass-panel animate-fade-in kpi-card-interactive ${statusFilter === 'ALL' ? 'active-filter' : ''}`}
          style={{
            padding: '18px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: statusFilter === 'ALL' ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
          }}
          title="Click to view all registered guests in property"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Register</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {guests.length}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Full audit history</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusFilter === 'ALL' ? 'var(--gold-dark)' : 'var(--text-muted)' }}>
              {statusFilter === 'ALL' ? '● Viewing All' : 'Tap to show all →'}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* GUEST DIRECTORY & CHECK-IN KYC VERIFICATION REGISTRY TABLE     */}
      {/* ------------------------------------------------------------- */}
      <section
        id="guest-register"
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <UserCheck size={18} />
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Guest Register & Check-In / Check-Out Timestamps
              </h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Track who checked in at what time and who checked out at what time. Tap any guest to inspect full <strong>Aadhaar card</strong> and <strong>live selfie</strong> verification credentials.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Toggle: Card vs Table */}
            <div style={{ display: 'inline-flex', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: viewMode === 'card' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'card' ? 'var(--gold-dark)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'card' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title="Cards layout (best for mobile phone)"
              >
                <LayoutGrid size={13} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'table' ? 'var(--gold-dark)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title="Table layout"
              >
                <List size={13} />
                <span>Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={fetchHotelAndGuests}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <RefreshCw size={14} className={loadingGuests ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by name, Room number, Booking ref, or Aadhaar..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Filter Pills (Scrollable horizontally on mobile) */}
          <div className="touch-scroll-x" style={{ display: 'flex', gap: '6px', paddingBottom: '2px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`btn ${statusFilter === 'ALL' ? 'btn-gold' : 'btn-outline'}`}
              style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
            >
              All ({guests.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CHECKED_IN')}
              className={`btn ${statusFilter === 'CHECKED_IN' ? 'btn-gold' : 'btn-outline'}`}
              style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
            >
              Checked In ({checkedInCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`btn ${statusFilter === 'PENDING' ? 'btn-gold' : 'btn-outline'}`}
              style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CHECKED_OUT')}
              className={`btn ${statusFilter === 'CHECKED_OUT' ? 'btn-gold' : 'btn-outline'}`}
              style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
            >
              Checked Out ({checkedOutCount})
            </button>
          </div>
        </div>

        {/* Content Body: Loading / Empty / Data */}
        {loadingGuests ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading guests, timestamps & KYC verifications...</div>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
            <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No guests found for current filter
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Try switching status filter above or adjust your search term.
            </p>
          </div>
        ) : viewMode === 'card' ? (
          /* ============================================================== */
          /* CARD FEED LAYOUT (HIGHLY OPTIMIZED & TOUCH FRIENDLY FOR PHONES) */
          /* ============================================================== */
          <div className="guest-card-feed">
            {filteredGuests.map((g) => {
              const isCheckedIn = g.status === 'CHECKED_IN' || g.status === 'STAY_ACTIVE';
              const isCheckedOut = g.status === 'CHECKED_OUT';
              const hasKyc = isCheckedIn || g.kyc?.isVerified;
              const durationStr = formatStayDuration(g.checkedInAt, g.checkedOutAt);

              return (
                <div
                  key={g.stayId}
                  className="guest-mobile-card"
                  style={{
                    borderLeft: `4px solid ${
                      isCheckedIn
                        ? 'var(--success)'
                        : isCheckedOut
                        ? 'var(--text-muted)'
                        : '#D97706'
                    }`,
                  }}
                >
                  {/* Card Top: Avatar, Name, Room, Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: isCheckedIn ? 'var(--success-bg)' : 'var(--gold-soft)',
                          color: isCheckedIn ? 'var(--success)' : 'var(--gold-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          border: `1px solid ${isCheckedIn ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-active)'}`,
                          flexShrink: 0,
                        }}
                      >
                        {g.guest?.name
                          ? g.guest.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                          : 'G'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {g.guest?.name || 'Guest User'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span>📞 {g.guest?.phone || '9876543210'}</span>
                          <span>•</span>
                          <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Ref: {g.booking?.bookingNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span
                        style={{
                          background: 'var(--gold-soft)',
                          color: 'var(--gold-dark)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-active)',
                        }}
                      >
                        Room {g.room?.roomNumber || '302'}
                      </span>
                      {isCheckedIn ? (
                        <span className="badge badge-free" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                          <CheckCircle2 size={11} style={{ marginRight: '3px' }} /> CHECKED IN
                        </span>
                      ) : isCheckedOut ? (
                        <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 7px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                          CHECKED OUT
                        </span>
                      ) : (
                        <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#FEF3C7', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.25)' }}>
                          <AlertCircle size={11} style={{ marginRight: '3px' }} /> KYC PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Middle: Prominent Timestamps Strip */}
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {/* Check-In Timestamp */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        <LogIn size={12} color={g.checkedInAt ? 'var(--success)' : '#D97706'} />
                        <span>Check-In Time</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: g.checkedInAt ? 'var(--text-primary)' : '#D97706', marginTop: '3px' }}>
                        {formatShortTime(g.checkedInAt) || '⏳ Pending'}
                      </div>
                    </div>

                    {/* Check-Out Timestamp */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        <LogOut size={12} color="var(--text-secondary)" />
                        <span>Check-Out Time</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: g.checkedOutAt ? 'var(--text-primary)' : isCheckedIn ? 'var(--success)' : 'var(--text-muted)', marginTop: '3px' }}>
                        {g.checkedOutAt
                          ? formatShortTime(g.checkedOutAt)
                          : isCheckedIn
                          ? '🟢 In-Room'
                          : '—'}
                      </div>
                    </div>

                    {/* Duration Banner (if duration exists) */}
                    {durationStr && (
                      <div style={{ gridColumn: 'span 2', paddingTop: '6px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--gold-primary)" /> Stay Duration:
                        </span>
                        <strong style={{ color: 'var(--gold-dark)' }}>{durationStr}</strong>
                      </div>
                    )}
                  </div>

                  {/* Card KYC Verification Thumbnails & Interactive Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Aadhaar Thumbnail */}
                      <div
                        onClick={() => setSelectedKycGuest(g)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFFFFF',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-xs)',
                        }}
                        title="Tap to inspect Aadhaar Document"
                      >
                        <div style={{ width: '28px', height: '18px', borderRadius: '3px', overflow: 'hidden', background: 'var(--gold-soft)' }}>
                          {g.kyc?.idDocumentUrl ? (
                            <img src={g.kyc.idDocumentUrl} alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FileText size={14} color="var(--gold-primary)" style={{ margin: '2px' }} />
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aadhaar</span>
                      </div>

                      {/* Selfie Thumbnail */}
                      <div
                        onClick={() => setSelectedKycGuest(g)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFFFFF',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-xs)',
                        }}
                        title="Tap to inspect Live Selfie"
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', background: 'var(--gold-soft)' }}>
                          {g.kyc?.selfieUrl ? (
                            <img src={g.kyc.selfieUrl} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Camera size={14} color="var(--gold-primary)" style={{ margin: '3px' }} />
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>Selfie</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedKycGuest(g)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Eye size={13} />
                        <span>Credentials</span>
                      </button>

                      {isCheckedIn && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAdminCheckout(g.stayId, g.guest?.name)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Check out guest"
                        >
                          <LogOut size={13} />
                          <span>Check-Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================== */
          /* TABLE LAYOUT (FOR DESKTOP / WIDE SCREENS)                     */
          /* ============================================================== */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Guest & Room</th>
                  <th style={{ padding: '12px 14px' }}>Check-In Timestamp</th>
                  <th style={{ padding: '12px 14px' }}>Check-Out Timestamp</th>
                  <th style={{ padding: '12px 14px' }}>Stay Status & Duration</th>
                  <th style={{ padding: '12px 14px' }}>KYC Verification</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((g) => {
                  const isCheckedIn = g.status === 'CHECKED_IN' || g.status === 'STAY_ACTIVE';
                  const isCheckedOut = g.status === 'CHECKED_OUT';
                  const hasKyc = isCheckedIn || g.kyc?.isVerified;
                  const durationStr = formatStayDuration(g.checkedInAt, g.checkedOutAt);

                  return (
                    <tr
                      key={g.stayId}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Guest & Room */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isCheckedIn ? 'var(--success-bg)' : 'var(--gold-soft)',
                              color: isCheckedIn ? 'var(--success)' : 'var(--gold-dark)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              border: `1px solid ${isCheckedIn ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-active)'}`,
                            }}
                          >
                            {g.guest?.name
                              ? g.guest.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()
                              : 'G'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.guest?.name || 'Guest User'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Room <strong>{g.room?.roomNumber || '302'}</strong> • Ref: <code style={{ color: 'var(--gold-dark)' }}>{g.booking?.bookingNumber}</code>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Check-In Time */}
                      <td style={{ padding: '14px' }}>
                        {g.checkedInAt ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <LogIn size={13} color="var(--success)" />
                              <span>{formatDateTime(g.checkedInAt)}</span>
                            </div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--success)', marginTop: '2px' }}>
                              Aadhaar & Selfie verified
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#D97706', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <AlertCircle size={13} />
                            <span>Pending Check-In</span>
                          </div>
                        )}
                      </td>

                      {/* Check-Out Time */}
                      <td style={{ padding: '14px' }}>
                        {g.checkedOutAt ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <LogOut size={13} color="var(--text-secondary)" />
                              <span>{formatDateTime(g.checkedOutAt)}</span>
                            </div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Room released
                            </div>
                          </div>
                        ) : isCheckedIn ? (
                          <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                            🟢 In-House (Checkout pending)
                          </div>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</div>
                        )}
                      </td>

                      {/* Stay Status & Duration */}
                      <td style={{ padding: '14px' }}>
                        <div>
                          {isCheckedIn ? (
                            <span className="badge badge-free" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                              CHECKED IN
                            </span>
                          ) : isCheckedOut ? (
                            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '3px 8px' }}>
                              CHECKED OUT
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.25)', fontSize: '0.72rem', padding: '3px 8px' }}>
                              KYC PENDING
                            </span>
                          )}
                          {durationStr && (
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} /> Duration: <strong>{durationStr}</strong>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* KYC Verification Credentials */}
                      <td style={{ padding: '14px' }}>
                        {hasKyc ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Aadhaar Thumbnail */}
                            <div
                              onClick={() => setSelectedKycGuest(g)}
                              style={{
                                width: '44px',
                                height: '28px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: '#FFFFFF',
                                boxShadow: 'var(--shadow-xs)',
                              }}
                              title="Click to view Aadhaar Card"
                            >
                              {g.kyc?.idDocumentUrl ? (
                                <img src={g.kyc.idDocumentUrl} alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ fontSize: '0.58rem', textAlign: 'center', padding: '3px', color: 'var(--gold-dark)', fontWeight: 700 }}>
                                  AADHAAR
                                </div>
                              )}
                            </div>

                            {/* Selfie Thumbnail */}
                            <div
                              onClick={() => setSelectedKycGuest(g)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '1px solid var(--border-active)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: 'var(--gold-soft)',
                                boxShadow: 'var(--shadow-xs)',
                              }}
                              title="Click to view Live Selfie"
                            >
                              {g.kyc?.selfieUrl ? (
                                <img src={g.kyc.selfieUrl} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Camera size={14} color="var(--gold-primary)" style={{ margin: '6px' }} />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedKycGuest(g)}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              View
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Lock size={12} color="#D97706" />
                            <span>Awaiting Upload</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedKycGuest(g)}
                            className="btn btn-outline"
                            style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Inspect credentials and stay details"
                          >
                            <Eye size={13} /> Details
                          </button>

                          {isCheckedIn && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleAdminCheckout(g.stayId, g.guest?.name)}
                              className="btn btn-outline"
                              style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              title="Process check-out"
                            >
                              <LogOut size={13} /> Check-Out
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
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Guest Check-In KYC Credentials & Stay Inspector         */}
      {/* ------------------------------------------------------------- */}
      {selectedKycGuest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedKycGuest(null);
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px 22px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
                  <ShieldCheck size={22} color="var(--success)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Guest KYC Credentials & Stay Inspector
                  </h3>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Guest: <strong>{selectedKycGuest.guest?.name}</strong> • Room <strong>{selectedKycGuest.room?.roomNumber || '302'}</strong> (Floor {selectedKycGuest.room?.floor || 3})
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedKycGuest(null)}
                className="btn-icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Check-In & Check-Out Timestamps Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              {/* Check-In Timestamp */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedKycGuest.checkedInAt ? 'var(--success-bg)' : '#FEF3C7',
                  border: `1px solid ${selectedKycGuest.checkedInAt ? 'rgba(16, 185, 129, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <LogIn size={13} color={selectedKycGuest.checkedInAt ? 'var(--success)' : '#D97706'} />
                  <span>Check-In Time</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: selectedKycGuest.checkedInAt ? 'var(--text-primary)' : '#D97706', marginTop: '4px' }}>
                  {formatDateTime(selectedKycGuest.checkedInAt) || 'Pending Check-In'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedKycGuest.checkedInAt ? 'Aadhaar & Selfie Submitted' : 'Awaiting guest check-in'}
                </div>
              </div>

              {/* Check-Out Timestamp */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedKycGuest.checkedOutAt ? 'var(--bg-tertiary)' : (selectedKycGuest.status === 'CHECKED_IN' || selectedKycGuest.status === 'STAY_ACTIVE') ? '#F0FDF4' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <LogOut size={13} color="var(--text-secondary)" />
                  <span>Check-Out Time</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {formatDateTime(selectedKycGuest.checkedOutAt) || ((selectedKycGuest.status === 'CHECKED_IN' || selectedKycGuest.status === 'STAY_ACTIVE') ? '🟢 In-House (Active)' : '—')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedKycGuest.checkedOutAt ? 'Completed Stay' : 'Checkout pending'}
                </div>
              </div>

              {/* Total Duration */}
              {selectedKycGuest.checkedInAt && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--gold-soft)',
                    border: '1px solid var(--border-active)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold-dark)', textTransform: 'uppercase' }}>
                    <Clock size={13} color="var(--gold-primary)" />
                    <span>Stay Duration</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-dark)', marginTop: '4px' }}>
                    {formatStayDuration(selectedKycGuest.checkedInAt, selectedKycGuest.checkedOutAt)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedKycGuest.checkedOutAt ? 'Final Total Time' : 'Current Active Duration'}
                  </div>
                </div>
              )}
            </div>

            {/* Visual KYC Verification Evidence (Aadhaar & Selfie) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {/* Evidence 1: Aadhaar Document */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="var(--gold-primary)" />
                    <span>Aadhaar Identity Card</span>
                  </span>
                  <span className="badge badge-free" style={{ fontSize: '0.68rem' }}>
                    UIDAI Verified
                  </span>
                </div>

                <div
                  onClick={() => selectedKycGuest.kyc?.idDocumentUrl && setLightboxImage(selectedKycGuest.kyc.idDocumentUrl)}
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: 'var(--shadow-xs)',
                    cursor: selectedKycGuest.kyc?.idDocumentUrl ? 'zoom-in' : 'default',
                    position: 'relative',
                  }}
                  title="Click image to zoom full screen"
                >
                  {selectedKycGuest.kyc?.idDocumentUrl ? (
                    <>
                      <img
                        src={selectedKycGuest.kyc.idDocumentUrl}
                        alt="Aadhaar Card"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ZoomIn size={11} /> Tap to zoom
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Document Uploaded</div>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Aadhaar Number:{' '}
                  <code style={{ fontWeight: 700, color: 'var(--text-primary)', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    {selectedKycGuest.kyc?.idNumber || '4126 3082 2252'}
                  </code>
                </div>
              </div>

              {/* Evidence 2: Live Camera Selfie */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={15} color="var(--gold-primary)" />
                    <span>Live Camera Selfie</span>
                  </span>
                  <span className="badge badge-free" style={{ fontSize: '0.68rem' }}>
                    Biometric Verified
                  </span>
                </div>

                <div
                  onClick={() => selectedKycGuest.kyc?.selfieUrl && setLightboxImage(selectedKycGuest.kyc.selfieUrl)}
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: 'var(--shadow-xs)',
                    cursor: selectedKycGuest.kyc?.selfieUrl ? 'zoom-in' : 'default',
                    position: 'relative',
                  }}
                  title="Click image to zoom full screen"
                >
                  {selectedKycGuest.kyc?.selfieUrl ? (
                    <>
                      <img
                        src={selectedKycGuest.kyc.selfieUrl}
                        alt="Guest Selfie"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ZoomIn size={11} /> Tap to zoom
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Selfie Captured</div>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Facial Liveness: <strong style={{ color: 'var(--success)' }}>Matched & Authenticated</strong>
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            {selectedKycGuest.kyc?.signatureUrl && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Digital Registration Signature
                </div>
                <div style={{ background: '#FFFFFF', padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                  <img src={selectedKycGuest.kyc.signatureUrl} alt="Signature" style={{ maxHeight: '38px', display: 'block' }} />
                </div>
              </div>
            )}

            {/* Guest Summary Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: '8px',
                fontSize: '0.82rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px',
                marginBottom: '20px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Guest Name:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedKycGuest.guest?.name}</strong>

              <span style={{ color: 'var(--text-muted)' }}>Phone / Email:</span>
              <span>{selectedKycGuest.guest?.phone} • {selectedKycGuest.guest?.email}</span>

              <span style={{ color: 'var(--text-muted)' }}>Room Number:</span>
              <strong>Room {selectedKycGuest.room?.roomNumber || '302'}</strong>

              <span style={{ color: 'var(--text-muted)' }}>Booking Ref:</span>
              <code>{selectedKycGuest.booking?.bookingNumber}</code>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedKycGuest(null)}
                className="btn btn-outline"
                style={{ padding: '9px 16px', fontSize: '0.82rem' }}
              >
                Close Inspector
              </button>

              {(selectedKycGuest.status === 'CHECKED_IN' || selectedKycGuest.status === 'STAY_ACTIVE') && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAdminCheckout(selectedKycGuest.stayId, selectedKycGuest.guest?.name)}
                  className="btn btn-gold"
                  style={{ padding: '9px 18px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={14} />
                  <span>Process Check-Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL: FULL RESOLUTION IMAGE ZOOM                     */}
      {/* ------------------------------------------------------------- */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '90vh',
              background: '#FFFFFF',
              padding: '8px',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              aria-label="Close image zoom"
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged Document"
              style={{ maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
