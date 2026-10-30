import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  BedDouble,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Users,
  Layers,
  Edit3,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const PropertyManager = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  // Add Property Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form fields
  const [propertyName, setPropertyName] = useState('');
  const [propertyCode, setPropertyCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [description, setDescription] = useState('');
  const [totalRooms, setTotalRooms] = useState('10');

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties');
      setProperties(res.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenAddModal = () => {
    setPropertyName('');
    setPropertyCode('');
    setAddress('');
    setCity('New Delhi');
    setState('Delhi');
    setCountry('India');
    setPhone(currentUser?.phone || '');
    setEmail(currentUser?.email || '');
    setDescription('');
    setTotalRooms('10');
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!propertyName.trim()) {
      setModalError('Property name is required.');
      return;
    }
    setCreating(true);
    setModalError(null);

    try {
      await api.post('/properties', {
        name: propertyName.trim(),
        code: propertyCode.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        phone: phone.trim(),
        email: email.trim(),
        description: description.trim(),
        totalRooms: Number(totalRooms) || 0,
      });

      showToast(`Property '${propertyName.trim()}' added to your portfolio!`);
      setIsAddModalOpen(false);
      await fetchProperties();
    } catch (err) {
      setModalError(err.message || 'Failed to add property');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;
    setSavingEdit(true);
    try {
      await api.patch(`/properties/${editingProperty._id}`, editingProperty);
      showToast('Property details updated successfully!');
      setEditingProperty(null);
      await fetchProperties();
    } catch (err) {
      alert(err.message || 'Failed to update property');
    } finally {
      setSavingEdit(false);
    }
  };

  // Distinct cities for filter
  const cities = ['ALL', ...new Set(properties.map((p) => p.city).filter(Boolean))];

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === 'ALL' || p.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const totalPortfolioRooms = properties.reduce((acc, p) => acc + (p.totalRooms || 0), 0);
  const totalOccupied = properties.reduce((acc, p) => acc + (p.occupiedRooms || 0), 0);
  const totalAvailable = properties.reduce((acc, p) => acc + (p.availableRooms || 0), 0);

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

      {/* Header & Main Action */}
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
            Hotel Admin Portfolio
          </div>
          <h1
            className="title-gold page-title"
            style={{ fontSize: '2.2rem', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 800 }}
          >
            Property Management
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Oversee all hospitality locations, wings, and estates under your administrative ownership.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn btn-gold"
          style={{
            padding: '14px 24px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-gold)',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Portfolio Metrics Cards */}
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
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Properties Owned</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {properties.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 600 }}>
              Active Resorts & Hotels
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
            <BedDouble size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Rooms Inventory</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {totalPortfolioRooms}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Across all properties
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
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available for Guests</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#008489', lineHeight: 1.1 }}>
              {totalAvailable}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Ready for immediate check-in
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
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Currently Occupied</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1.1 }}>
              {totalOccupied}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Active in-house guests
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search properties by name, code, address, city..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              City Filter:
            </span>
            <select
              className="input-control"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '130px', borderRadius: 'var(--radius-full)' }}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Cities' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
            <Building2 size={36} color="var(--gold-primary)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading your properties...</div>
        </div>
      ) : filteredProperties.length === 0 ? (
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
          <Building2 size={44} color="var(--gold-primary)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No properties found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px' }}>
            {searchTerm || cityFilter !== 'ALL'
              ? 'Try adjusting your search criteria or city filter.'
              : 'Add your first hotel property to start managing rooms, staff, and guests.'}
          </p>
          <button type="button" onClick={handleOpenAddModal} className="btn btn-gold">
            <Plus size={16} /> Add First Property
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredProperties.map((prop) => (
            <div
              key={prop._id}
              className="glass-panel"
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Card Top Accent / Header */}
              <div
                style={{
                  padding: '22px 24px',
                  background: 'linear-gradient(135deg, #FFF0F3 0%, #FFFFFF 100%)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      background: 'var(--gold-soft)',
                      color: 'var(--gold-primary)',
                      border: '1px solid var(--border-active)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      marginBottom: '8px',
                    }}
                  >
                    {prop.code || 'PROP-01'}
                  </div>
                  <h3
                    style={{
                      fontSize: '1.28rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {prop.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.84rem',
                      marginTop: '6px',
                    }}
                  >
                    <MapPin size={15} color="var(--gold-primary)" />
                    <span>
                      {prop.city ? `${prop.city}, ${prop.state || ''}` : prop.address || 'Central Location'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProperty({ ...prop })}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Edit Property Details"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {prop.address && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Address: </span>
                    {prop.address}
                  </div>
                )}

                {/* Live Room Distribution Chips */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Live Inventory Status
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {prop.totalRooms || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Rooms</div>
                    </div>

                    <div style={{ padding: '8px 10px', background: '#E6F7F7', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#008489' }}>
                        {prop.availableRooms || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#008489', fontWeight: 600 }}>Available</div>
                    </div>

                    <div style={{ padding: '8px 10px', background: '#FFF0F3', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                        {prop.occupiedRooms || 0}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--gold-dark)', fontWeight: 600 }}>Occupied</div>
                    </div>
                  </div>
                </div>

                {/* Contact info footer */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  {prop.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--gold-primary)" />
                      <span>{prop.phone}</span>
                    </div>
                  )}
                  {prop.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="var(--gold-primary)" />
                      <span>{prop.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action Link */}
              <div
                style={{
                  padding: '14px 24px',
                  background: 'var(--bg-primary)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Manage units & inventory
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/rooms?propertyId=${prop._id}`)}
                  className="btn btn-gold"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>View Rooms</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop active" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
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
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Add Property to Portfolio
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Register a new hotel branch, wing, or resort.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Property / Hotel Name *
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="e.g. Grand Heritage Palace - East Wing"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Property Code
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={propertyCode}
                    onChange={(e) => setPropertyCode(e.target.value)}
                    placeholder="GHP-01"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 45, Heritage Boulevard"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="input-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="property@hotel.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Total Capacity / Rooms
                </label>
                <input
                  type="number"
                  className="input-control"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                  placeholder="10"
                  min="1"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '12px 22px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-gold"
                  style={{ padding: '12px 26px', borderRadius: 'var(--radius-full)' }}
                >
                  {creating ? 'Saving Property...' : 'Save & Register Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="modal-backdrop active" onClick={() => setEditingProperty(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '90%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Edit Property Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Property Name
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={editingProperty.name || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={editingProperty.address || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={editingProperty.city || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={editingProperty.phone || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="btn btn-outline"
                  style={{ padding: '11px 20px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn btn-gold"
                  style={{ padding: '11px 24px', borderRadius: 'var(--radius-full)' }}
                >
                  {savingEdit ? 'Updating...' : 'Update Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;

