import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Tag,
  Search,
  Bell,
  Check,
  X,
  Edit3,
  UserCheck,
  Utensils,
  FileText,
  Eye,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { playSuccessChime } from '../../utils/audioChime.js';

export const ServiceManager = () => {
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SERVICES'); // 'SERVICES' | 'REQUESTS'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Live Requests Filtering & Detail Modal State
  const [requestFilterDept, setRequestFilterDept] = useState('ALL'); // 'ALL' | 'DINING' | 'HOUSEKEEPING' | 'FRONT_DESK'
  const [requestFilterStatus, setRequestFilterStatus] = useState('ACTIVE'); // 'ACTIVE' | 'FULFILLED' | 'ALL'
  const [viewingDetailItem, setViewingDetailItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Service Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Housekeeping');
  const [price, setPrice] = useState('0');
  const [isComplimentary, setIsComplimentary] = useState(true);
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Edit Service State
  const [editingService, setEditingService] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Toast / notification feedback
  const [toastMsg, setToastMsg] = useState(null);

  const hotelId = currentUser?.hotelId?._id || currentUser?.hotelId || 'HOTEL-DELHI-01';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchServicesAndRequests = async () => {
    try {
      setLoading(true);
      const [srvRes, reqRes] = await Promise.all([
        api.get(`/hotels/${hotelId}/services`).catch(() => ({ data: { services: [] } })),
        api.get('/service-requests').catch(() => ({ data: [] })),
      ]);

      setServices(srvRes.data?.services || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Failed to load services data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndRequests();
    const interval = setInterval(fetchServicesAndRequests, 10000);
    return () => clearInterval(interval);
  }, [hotelId]);

  // Toggle Service Availability (Available <-> Unavailable)
  const handleToggleAvailability = async (service) => {
    const newStatus = !service.isAvailable;
    setUpdatingId(service._id);
    try {
      await api.patch(`/hotels/${hotelId}/services/${service._id}`, {
        isAvailable: newStatus,
      });

      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isAvailable: newStatus } : s))
      );
      showToast(`Service "${service.name}" marked as ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    } catch (err) {
      alert(err.message || 'Failed to update service availability');
    } finally {
      setUpdatingId(null);
    }
  };

  // Create New Hotel Service
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await api.post(`/hotels/${hotelId}/services`, {
        name: name.trim(),
        category,
        description: description.trim(),
        price: isComplimentary ? 0 : Number(price) || 0,
        isComplimentary,
        isAvailable,
      });

      showToast(`Service "${name.trim()}" added and published for guests!`);
      setName('');
      setDescription('');
      setPrice('0');
      setIsComplimentary(true);
      setIsAvailable(true);
      setIsAddModalOpen(false);
      await fetchServicesAndRequests();
    } catch (err) {
      alert(err.message || 'Failed to add service');
    } finally {
      setCreating(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to remove "${serviceName}" from guest offerings?`)) return;

    try {
      await api.delete(`/hotels/${hotelId}/services/${serviceId}`);
      showToast(`Service "${serviceName}" removed.`);
      await fetchServicesAndRequests();
    } catch (err) {
      alert(err.message || 'Failed to delete service');
    }
  };

  // Mark Request / Dining Order as Fulfilled
  const handleMarkFulfilled = async (reqItem) => {
    if (!reqItem?._id) return;
    setActionLoading(true);
    try {
      const actor = `${currentUser?.name || 'Hotel Admin'} (${currentUser?.role || 'ADMIN'})`;
      await api.patch(`/service-requests/${reqItem._id}/status`, {
        status: 'DELIVERED',
        fulfilledBy: actor,
      });

      playSuccessChime();
      showToast(`Request for Room ${reqItem.roomNumber || ''} marked as FULFILLED!`);

      if (viewingDetailItem?._id === reqItem._id) {
        setViewingDetailItem((prev) => ({
          ...prev,
          status: 'DELIVERED',
          isFulfilled: true,
          fulfilledBy: actor,
          completedAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
        }));
      }

      await fetchServicesAndRequests();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const categories = ['ALL', ...new Set(services.map((s) => s.category).filter(Boolean))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
            Operational Settings & Guest Amenities
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
            Hotel Services & Offerings
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Add, configure, and manage real-time service availability visible on every guest’s portal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-gold"
            style={{ padding: '11px 20px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ padding: '12px 18px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(28, 108, 67, 0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '0.88rem' }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Primary Tab Switcher: Services List vs Incoming Guest Requests */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('SERVICES')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'SERVICES' ? 800 : 600,
            color: activeTab === 'SERVICES' ? 'var(--gold-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'SERVICES' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Sparkles size={16} /> Services Catalogue ({services.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REQUESTS')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 18px',
            fontSize: '0.92rem',
            fontWeight: activeTab === 'REQUESTS' ? 800 : 600,
            color: activeTab === 'REQUESTS' ? 'var(--gold-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'REQUESTS' ? '3px solid var(--gold-primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Bell size={16} /> Live Guest Requests
          {pendingRequestsCount > 0 && (
            <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '9999px', fontWeight: 800 }}>
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SERVICES CATALOGUE & REAL-TIME AVAILABILITY */}
      {activeTab === 'SERVICES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-control"
                  placeholder="Search services by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
                />
              </div>

              <select
                className="input-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto', minWidth: '160px', borderRadius: 'var(--radius-full)' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Loading hotel services catalogue...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#FFFFFF' }}>
              <Sparkles size={40} style={{ color: 'var(--gold-primary)', margin: '0 auto 12px', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px' }}>No services found</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Add your hotel’s first service offering for in-stay guests.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-gold"
                style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              >
                + Add Service
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredServices.map((srv) => {
                const isAvail = srv.isAvailable !== false;
                return (
                  <div
                    key={srv._id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      border: isAvail ? '1px solid var(--border-color)' : '1px solid #FED7AA',
                      background: isAvail ? '#FFFFFF' : '#FFFDF9',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                          {srv.category}
                        </span>

                        {/* Availability Pill */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            background: isAvail ? '#DCFCE7' : '#FEE2E2',
                            color: isAvail ? '#166534' : '#991B1B',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isAvail ? '#16A34A' : '#DC2626',
                            }}
                          />
                          {isAvail ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                        {srv.name}
                      </h3>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.45 }}>
                        {srv.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: srv.isComplimentary ? 'var(--success)' : 'var(--gold-primary)' }}>
                          {srv.isComplimentary ? 'Complimentary (Free)' : `₹${srv.price}`}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(srv)}
                        disabled={updatingId === srv._id}
                        className={isAvail ? 'btn btn-outline' : 'btn btn-gold'}
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Power size={13} />
                        <span>{isAvail ? 'Set Unavailable' : 'Make Available'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv._id, srv.name)}
                        className="btn btn-outline"
                        style={{ padding: '7px 10px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                        title="Remove service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING GUEST SERVICE REQUESTS & DINING TICKETS */}
      {activeTab === 'REQUESTS' && (() => {
        const diningRequests = requests.filter((r) => r.requestType === 'DINING' || r.isFoodOrder);
        const housekeepingRequests = requests.filter(
          (r) => r.requestType !== 'DINING' && ['Housekeeping', 'Laundry', 'Room Service'].includes(r.serviceCategory)
        );
        const frontDeskRequests = requests.filter(
          (r) => r.requestType !== 'DINING' && !['Housekeeping', 'Laundry', 'Room Service'].includes(r.serviceCategory)
        );

        const filteredByDept = requests.filter((r) => {
          if (requestFilterDept === 'DINING') return r.requestType === 'DINING' || r.isFoodOrder;
          if (requestFilterDept === 'HOUSEKEEPING')
            return r.requestType !== 'DINING' && ['Housekeeping', 'Laundry', 'Room Service'].includes(r.serviceCategory);
          if (requestFilterDept === 'FRONT_DESK')
            return r.requestType !== 'DINING' && !['Housekeeping', 'Laundry', 'Room Service'].includes(r.serviceCategory);
          return true;
        });

        const displayedRequests = filteredByDept.filter((r) => {
          const isDone = r.isFulfilled || r.status === 'DELIVERED' || r.status === 'COMPLETED' || r.status === 'FULFILLED';
          if (requestFilterStatus === 'ACTIVE') return !isDone;
          if (requestFilterStatus === 'FULFILLED') return isDone;
          return true;
        });

        const activeCount = requests.filter(
          (r) => !(r.isFulfilled || r.status === 'DELIVERED' || r.status === 'COMPLETED' || r.status === 'FULFILLED')
        ).length;

        const fulfilledCount = requests.filter(
          (r) => r.isFulfilled || r.status === 'DELIVERED' || r.status === 'COMPLETED' || r.status === 'FULFILLED'
        ).length;

        return (
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Active Guest Request & Dining Queue
                </h2>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Live incoming in-stay requests from guests. Real-time updates, immediate fulfillment & audit logs.
                </p>
              </div>

              {/* Status Switcher (Active vs Fulfilled) */}
              <div style={{ display: 'inline-flex', background: '#F3F4F6', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRequestFilterStatus('ACTIVE')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: requestFilterStatus === 'ACTIVE' ? 800 : 600,
                    background: requestFilterStatus === 'ACTIVE' ? '#FFFFFF' : 'transparent',
                    color: requestFilterStatus === 'ACTIVE' ? '#DC2626' : 'var(--text-secondary)',
                    boxShadow: requestFilterStatus === 'ACTIVE' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Active / Pending</span>
                  {activeCount > 0 && (
                    <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '9999px', fontWeight: 900 }}>
                      {activeCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRequestFilterStatus('FULFILLED')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: requestFilterStatus === 'FULFILLED' ? 800 : 600,
                    background: requestFilterStatus === 'FULFILLED' ? '#FFFFFF' : 'transparent',
                    color: requestFilterStatus === 'FULFILLED' ? 'var(--success)' : 'var(--text-secondary)',
                    boxShadow: requestFilterStatus === 'FULFILLED' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Fulfilled ({fulfilledCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestFilterStatus('ALL')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: requestFilterStatus === 'ALL' ? 800 : 600,
                    background: requestFilterStatus === 'ALL' ? '#FFFFFF' : 'transparent',
                    color: requestFilterStatus === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: requestFilterStatus === 'ALL' ? 'var(--shadow-xs)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  All ({requests.length})
                </button>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setRequestFilterDept('ALL')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: requestFilterDept === 'ALL' ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                  background: requestFilterDept === 'ALL' ? 'var(--gold-soft)' : '#FFFFFF',
                  color: requestFilterDept === 'ALL' ? 'var(--gold-dark)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: requestFilterDept === 'ALL' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                All Departments ({requests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestFilterDept('DINING')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: requestFilterDept === 'DINING' ? '1px solid #D97706' : '1px solid var(--border-color)',
                  background: requestFilterDept === 'DINING' ? '#FEF3C7' : '#FFFFFF',
                  color: requestFilterDept === 'DINING' ? '#B45309' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: requestFilterDept === 'DINING' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Utensils size={13} /> Culinary & Dining ({diningRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestFilterDept('HOUSEKEEPING')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: requestFilterDept === 'HOUSEKEEPING' ? '1px solid #2563EB' : '1px solid var(--border-color)',
                  background: requestFilterDept === 'HOUSEKEEPING' ? '#EFF6FF' : '#FFFFFF',
                  color: requestFilterDept === 'HOUSEKEEPING' ? '#1D4ED8' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: requestFilterDept === 'HOUSEKEEPING' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} /> Housekeeping & Linen ({housekeepingRequests.length})
              </button>

              <button
                type="button"
                onClick={() => setRequestFilterDept('FRONT_DESK')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  border: requestFilterDept === 'FRONT_DESK' ? '1px solid #7C3AED' : '1px solid var(--border-color)',
                  background: requestFilterDept === 'FRONT_DESK' ? '#F5F3FF' : '#FFFFFF',
                  color: requestFilterDept === 'FRONT_DESK' ? '#6D28D9' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: requestFilterDept === 'FRONT_DESK' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserCheck size={13} /> Front Desk & Concierge ({frontDeskRequests.length})
              </button>
            </div>

            {displayedRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={42} color="var(--success)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {requestFilterStatus === 'ACTIVE'
                    ? 'No Active Requests Pending!'
                    : 'No requests match this filter.'}
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>
                  {requestFilterStatus === 'ACTIVE'
                    ? 'All in-stay guests are served. You will be alerted instantly when a guest makes a new request.'
                    : 'Try selecting another department or status filter above.'}
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room & Guest</th>
                      <th>Requested Item / Service</th>
                      <th>Department</th>
                      <th>Folio Charge</th>
                      <th>Notes & Prep Time</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRequests.map((req) => {
                      const isDone =
                        req.isFulfilled ||
                        req.status === 'DELIVERED' ||
                        req.status === 'COMPLETED' ||
                        req.status === 'FULFILLED';

                      return (
                        <tr key={req._id}>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.92rem' }}>
                              Room {req.roomNumber || 'Assigned'}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {req.guestName || 'In-Stay Guest'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: req.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                                  color: req.isFoodOrder ? '#B45309' : '#1D4ED8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {req.isFoodOrder ? <Utensils size={16} /> : <Sparkles size={16} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                  {req.serviceName}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {req.createdAt ? new Date(req.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recently'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                background: req.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                                color: req.isFoodOrder ? '#B45309' : '#1D4ED8',
                                border: req.isFoodOrder ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                              }}
                            >
                              {req.isFoodOrder ? 'Kitchen / Dining' : req.serviceCategory || 'Service'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: req.isFree ? 'var(--success)' : 'var(--text-primary)' }}>
                              {req.isFree ? 'Free' : `₹${req.price}`}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {req.preparationTime && (
                                <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} /> Prep: {req.preparationTime}
                                </span>
                              )}
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {req.specialInstructions || req.guestNotes || '—'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                isDone
                                  ? 'badge-free'
                                  : req.status === 'PREPARING' || req.status === 'IN_PROGRESS'
                                  ? 'badge-blue'
                                  : 'badge-gold'
                              }`}
                            >
                              {isDone ? 'FULFILLED' : req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setViewingDetailItem(req)}
                                className="btn btn-outline"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="View Complete Details"
                              >
                                <Eye size={13} /> Details
                              </button>

                              {!isDone ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkFulfilled(req)}
                                  disabled={actionLoading}
                                  className="btn btn-gold"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    border: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <CheckCircle2 size={13} /> Mark Fulfilled
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={14} /> Fulfilled
                                </span>
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
          </div>
        );
      })()}

      {/* MODAL: ADD NEW SERVICE */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Add New Hotel Service
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateService}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Airport Chauffeur, Deep Room Cleaning, Extra Duvet..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="responsive-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      className="input-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Laundry">Laundry & Dry Clean</option>
                      <option value="Front Desk">Front Desk & Bellboy</option>
                      <option value="Concierge">Concierge & Travel</option>
                      <option value="Spa & Wellness">Spa & Wellness</option>
                      <option value="Dining">In-Room Dining Support</option>
                      <option value="Maintenance">Maintenance & Technical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Guest Price (₹)
                    </label>
                    <input
                      type="number"
                      className="input-control"
                      placeholder="0"
                      min="0"
                      value={price}
                      disabled={isComplimentary}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="complimentary-checkbox"
                    checked={isComplimentary}
                    onChange={(e) => {
                      setIsComplimentary(e.target.checked);
                      if (e.target.checked) setPrice('0');
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="complimentary-checkbox" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Complimentary / Free for In-Stay Guests
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Description & Instructions for Guest
                  </label>
                  <textarea
                    className="input-control"
                    rows={3}
                    placeholder="Brief description of what is included and expected delivery..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--gold-soft)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-active)' }}>
                  <input
                    type="checkbox"
                    id="availability-checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="availability-checkbox" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'block' }}>
                      Mark as Immediately Available
                    </label>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Guests will be able to see and request this service right away.
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-gold"
                  style={{ padding: '9px 20px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {creating ? 'Saving...' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: COMPLETE REQUEST & FULFILLMENT AUDIT DETAILS */}
      {viewingDetailItem && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 10000 }}
          onClick={() => setViewingDetailItem(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', borderRadius: '20px', padding: '24px' }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      background: viewingDetailItem.isFoodOrder ? '#FEF3C7' : '#EFF6FF',
                      color: viewingDetailItem.isFoodOrder ? '#B45309' : '#1D4ED8',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {viewingDetailItem.isFoodOrder ? '🍽️ Dining Order' : '🛎️ In-Stay Service'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Ticket #{viewingDetailItem.orderNumber || viewingDetailItem._id?.slice(-6)}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
                  Room {viewingDetailItem.roomNumber} • {viewingDetailItem.guestName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewingDetailItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
              {/* Itemized List */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Requested Items & Specifications
                </div>

                <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {viewingDetailItem.items && viewingDetailItem.items.length > 0 ? (
                    viewingDetailItem.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {it.quantity || 1}x {it.name}
                          </strong>
                          {it.preparationTime && (
                            <div style={{ fontSize: '0.74rem', color: '#B45309' }}>
                              ⏱️ Preparation: {it.preparationTime}
                            </div>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{(Number(it.price) || 0) * (Number(it.quantity) || 1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{viewingDetailItem.serviceName}</strong>
                      <span style={{ fontWeight: 700, color: viewingDetailItem.isFree ? 'var(--success)' : 'var(--text-primary)' }}>
                        {viewingDetailItem.isFree ? 'Complimentary' : `₹${viewingDetailItem.price}`}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Total Folio Charge</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold-primary)' }}>
                      ₹{viewingDetailItem.price || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {(viewingDetailItem.specialInstructions || viewingDetailItem.guestNotes) && (
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Guest Notes & Instructions
                  </div>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', fontSize: '0.85rem', color: '#92400E' }}>
                    {viewingDetailItem.specialInstructions || viewingDetailItem.guestNotes}
                  </div>
                </div>
              )}

              {/* Status & Fulfillment Audit Timeline */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Fulfillment Status & Audit
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status</div>
                    <div
                      style={{
                        fontWeight: 800,
                        color:
                          viewingDetailItem.isFulfilled ||
                          viewingDetailItem.status === 'DELIVERED' ||
                          viewingDetailItem.status === 'COMPLETED'
                            ? 'var(--success)'
                            : '#D97706',
                        fontSize: '0.92rem',
                      }}
                    >
                      {viewingDetailItem.isFulfilled ||
                      viewingDetailItem.status === 'DELIVERED' ||
                      viewingDetailItem.status === 'COMPLETED'
                        ? 'FULFILLED / DELIVERED'
                        : viewingDetailItem.status}
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Placed At</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {viewingDetailItem.createdAt ? new Date(viewingDetailItem.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fulfilled By</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {viewingDetailItem.fulfilledBy || viewingDetailItem.assignedTo || 'Pending Fulfillment'}
                    </div>
                  </div>

                  {(viewingDetailItem.deliveredAt || viewingDetailItem.completedAt) && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#166534' }}>Completed At</div>
                      <div style={{ fontWeight: 700, color: '#15803D', fontSize: '0.85rem' }}>
                        {new Date(viewingDetailItem.deliveredAt || viewingDetailItem.completedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setViewingDetailItem(null)}
                className="btn btn-outline"
                style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>

              {!(
                viewingDetailItem.isFulfilled ||
                viewingDetailItem.status === 'DELIVERED' ||
                viewingDetailItem.status === 'COMPLETED'
              ) ? (
                <button
                  type="button"
                  onClick={() => handleMarkFulfilled(viewingDetailItem)}
                  disabled={actionLoading}
                  className="btn btn-gold"
                  style={{
                    padding: '9px 22px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} /> Mark as Fulfilled & Delivered ✓
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 800, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={18} /> Request Successfully Fulfilled
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
