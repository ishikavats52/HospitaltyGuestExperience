import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  UserPlus,
  BedDouble,
  Search,
  RefreshCw,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  Globe,
  Footprints,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { WalkInGuestModal } from '../../components/modals/WalkInGuestModal.jsx';

export const BookingDesk = () => {
  const { currentUser, isHotelAdmin, isSuperAdmin } = useAuth();
  const isAdmin = isHotelAdmin || isSuperAdmin;

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL'); // 'ALL' | 'WALK_IN' | 'ONLINE'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const [bkRes, rmRes] = await Promise.all([
        api.get('/bookings').catch(() => ({ data: [] })),
        api.get('/rooms').catch(() => ({ data: [] })),
      ]);

      const rawBookings = bkRes.data?.bookings || bkRes.data || [];
      setBookings(Array.isArray(rawBookings) ? rawBookings : []);
      setRooms(rmRes.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
    const interval = setInterval(fetchBookingsData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyMagicLink = (booking) => {
    const link = `${window.location.origin}${booking.magicLink || `/stay/${booking.bookingNumber}`}`;
    navigator.clipboard.writeText(link);
    setCopiedId(booking._id || booking.bookingNumber);
    showToast(`WhatsApp Express Stay link copied for ${booking.guestName}!`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Determine channel (walk-in vs online)
  const getBookingChannel = (booking) => {
    if (booking.channel) return booking.channel;
    if (booking.isWalkIn || booking.source === 'WALK_IN' || (booking.bookingNumber && booking.bookingNumber.startsWith('BK-'))) {
      return 'WALK_IN';
    }
    return 'ONLINE';
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (b.guestName && b.guestName.toLowerCase().includes(term)) ||
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(term)) ||
      (b.phone && b.phone.includes(term)) ||
      (b.email && b.email.toLowerCase().includes(term)) ||
      (b.roomNumber && String(b.roomNumber).includes(term));

    const channel = getBookingChannel(b);
    const matchesChannel =
      channelFilter === 'ALL' ||
      (channelFilter === 'WALK_IN' && channel === 'WALK_IN') ||
      (channelFilter === 'ONLINE' && channel === 'ONLINE');

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONFIRMED' && (b.status === 'CONFIRMED' || b.status === 'ACTIVE')) ||
      (statusFilter === 'CHECKED_IN' && b.status === 'CHECKED_IN') ||
      (statusFilter === 'CHECKED_OUT' && b.status === 'CHECKED_OUT');

    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Calculate Metrics
  const walkInCount = bookings.filter((b) => getBookingChannel(b) === 'WALK_IN').length;
  const onlineCount = bookings.filter((b) => getBookingChannel(b) === 'ONLINE').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'AVAILABLE').length;

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

      {/* Desk Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
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
              <CalendarCheck size={14} />
              <span>Reservations & Front Office Intake</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Booking & Reservations Desk
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Manage customer walk-in bookings, inspect online reservations, allot available rooms, and share WhatsApp Express links.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={fetchBookingsData}
              className="btn btn-outline"
              style={{ padding: '10px 14px', fontSize: '0.84rem' }}
              title="Refresh ledger"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="btn btn-gold"
              style={{
                padding: '11px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-gold)',
                cursor: 'pointer',
              }}
            >
              <UserPlus size={16} />
              <span>+ Register Walk-In Guest</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--gold-soft)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{bookings.length}</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFF0F3', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Footprints size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Walk-In Guests</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1.1 }}>{walkInCount}</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#E6F7F7', color: '#008489', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Online Bookings</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#008489', lineHeight: 1.1 }}>{onlineCount}</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Available Rooms</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>{availableRoomsCount} Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Channel Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Guest Name, Room #, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
            />
          </div>
        </div>

        {/* Channel & Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setChannelFilter('ALL')}
              style={{
                border: 'none',
                background: channelFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                fontWeight: channelFilter === 'ALL' ? 700 : 500,
                color: channelFilter === 'ALL' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: channelFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              All Channels ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('WALK_IN')}
              style={{
                border: 'none',
                background: channelFilter === 'WALK_IN' ? '#FFFFFF' : 'transparent',
                fontWeight: channelFilter === 'WALK_IN' ? 700 : 500,
                color: channelFilter === 'WALK_IN' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: channelFilter === 'WALK_IN' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              🚶 Walk-Ins ({walkInCount})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('ONLINE')}
              style={{
                border: 'none',
                background: channelFilter === 'ONLINE' ? '#FFFFFF' : 'transparent',
                fontWeight: channelFilter === 'ONLINE' ? 700 : 500,
                color: channelFilter === 'ONLINE' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                boxShadow: channelFilter === 'ONLINE' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              🌐 Online ({onlineCount})
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Active / Confirmed</option>
            <option value="CHECKED_IN">Checked-In</option>
            <option value="CHECKED_OUT">Checked-Out</option>
          </select>
        </div>
      </div>

      {/* Bookings Ledger Table */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Reservations Ledger ({filteredBookings.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Notice: Booking staff can create & allot reservations; booking cancellation is governed by Admin.
          </span>
        </div>

        {loading && bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading bookings ledger...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <CalendarCheck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>No Reservations Found</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '4px auto 16px' }}>
              No bookings match your current search or channel filter. Click below to take a walk-in intake.
            </p>
            <button
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="btn btn-gold"
              style={{ padding: '9px 18px', fontSize: '0.84rem', fontWeight: 700 }}
            >
              + Register Walk-In Guest
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking Ref / Channel</th>
                  <th>Guest Identification</th>
                  <th>Allotted Room</th>
                  <th>Reservation Dates</th>
                  <th>Tariff</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Guest Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const channel = getBookingChannel(b);
                  return (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--gold-dark)', fontSize: '0.84rem' }}>
                          {b.bookingNumber}
                        </div>
                        <span
                          className={`badge ${channel === 'WALK_IN' ? 'badge-gold' : 'badge-blue'}`}
                          style={{ fontSize: '0.68rem', marginTop: '3px', display: 'inline-block' }}
                        >
                          {channel === 'WALK_IN' ? '🚶 Walk-In' : '🌐 Online'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {b.guestName || b.guestId?.name || 'Walk-In Guest'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={12} color="var(--gold-primary)" />
                          <span>{b.phone || b.guestId?.phone || 'No phone'}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              background: 'var(--gold-soft)',
                              color: 'var(--gold-primary)',
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-active)',
                            }}
                          >
                            Room {b.roomNumber || b.roomId?.roomNumber || 'TBD'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {b.roomTypeName || b.roomType || 'Standard'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {b.checkInDate} → {b.checkOutDate}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {Math.max(1, Math.round((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)))} night(s)
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          ₹{Number(b.totalAmount || b.roomPrice || 4500).toLocaleString()}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            b.status === 'CHECKED_IN'
                              ? 'badge-free'
                              : b.status === 'CONFIRMED' || b.status === 'ACTIVE'
                              ? 'badge-blue'
                              : 'badge-gold'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyMagicLink(b)}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Copy guest contactless magic link"
                          >
                            {copiedId === (b._id || b.bookingNumber) ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                            <span>{copiedId === (b._id || b.bookingNumber) ? 'Copied!' : 'WhatsApp Link'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-In Registration Modal */}
      <WalkInGuestModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        availableRooms={rooms}
        onSuccess={() => {
          showToast('Walk-in guest successfully registered and allotted room!');
          fetchBookingsData();
        }}
      />
    </div>
  );
};

