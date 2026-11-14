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
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const ServiceManager = () => {
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SERVICES'); // 'SERVICES' | 'REQUESTS'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  // Advance Service Request Status (PENDING -> IN_PROGRESS -> COMPLETED)
  const handleUpdateStatus = async (requestId, currentStatus) => {
    const nextStatus =
      currentStatus === 'PENDING'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'COMPLETED';

    try {
      await api.patch(`/service-requests/${requestId}/status`, {
        status: nextStatus,
        assignedTo: currentUser?.name || 'Front Desk Staff',
      });
      showToast(`Request marked as ${nextStatus}!`);
      await fetchServicesAndRequests();
    } catch (err) {
      alert(err.message || 'Failed to update request');
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

      {/* TAB 2: INCOMING GUEST SERVICE REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)' }}>
            Active Guest Service Queue
          </h2>

          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <div>No service requests pending. All in-stay guests are served!</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room & Guest</th>
                    <th>Requested Service</th>
                    <th>Category</th>
                    <th>Billing / Price</th>
                    <th>Guest Notes</th>
                    <th>Status</th>
                    <th>Staff Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                          Room {req.roomNumber || 'Assigned'}
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {req.guestName || 'In-Stay Guest'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {req.serviceName || req.serviceCatalogueId?.name || 'Hotel Service'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gold">{req.serviceCategory || 'Service'}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: req.isFree ? 'var(--success)' : 'var(--text-primary)' }}>
                          {req.isFree ? 'Free' : `₹${req.price}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {req.guestNotes || '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            req.status === 'COMPLETED'
                              ? 'badge-free'
                              : req.status === 'IN_PROGRESS'
                              ? 'badge-blue'
                              : 'badge-gold'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status !== 'COMPLETED' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req._id, req.status)}
                            className="btn btn-gold"
                            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                          >
                            {req.status === 'PENDING' ? 'Assign & Start' : 'Mark Completed ✓'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.76rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};
