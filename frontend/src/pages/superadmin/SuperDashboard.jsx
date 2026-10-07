import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Globe,
  Layers,
  CreditCard,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Key,
  Copy,
  Check,
  Lock,
  Mail,
  Phone,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const SuperDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Create Admin Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Post-Creation Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedState, setCopiedState] = useState(false);

  // Reset Password Modal State
  const [resetModalAdmin, setResetModalAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsRes, hotelsRes, propsRes] = await Promise.all([
        api.get('/users/admins'),
        api.get('/hotels'),
        api.get('/properties').catch(() => ({ data: [] })),
      ]);

      setAdmins(adminsRes.data || []);
      setHotels(hotelsRes.data || []);
      setProperties(propsRes.data || []);

      if (hotelsRes.data && hotelsRes.data.length > 0 && !selectedHotelId) {
        setSelectedHotelId(hotelsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load superadmin data:', err);
      setError(err.message || 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter properties based on selected hotel in modal
  const availableProperties = properties.filter(
    (p) => String(p.hotelId?._id || p.hotelId) === String(selectedHotelId)
  );

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Admin@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '2026!';
    setAdminPassword(pass);
  };

  const handleOpenCreateModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setSelectedPropertyId('');
    generatePassword();
    if (hotels.length > 0) {
      setSelectedHotelId(hotels[0]._id);
    }
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim() || !selectedHotelId) {
      setCreateError('Please fill in all required fields (Name, Email, Password, Hotel).');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await api.post('/users/admins', {
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword.trim(),
        hotelId: selectedHotelId,
        propertyId: selectedPropertyId || undefined,
        phone: adminPhone.trim() || undefined,
      });

      const selectedHotel = hotels.find((h) => String(h._id) === String(selectedHotelId));

      // Show credentials voucher
      setCreatedCredentials({
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword.trim(),
        hotelName: selectedHotel ? selectedHotel.name : 'Assigned Hotel',
        hotelCode: selectedHotel ? selectedHotel.code : '',
        loginUrl: `${window.location.origin}/staff/login`,
      });

      setIsCreateModalOpen(false);
      showToast('Hotel Admin profile created successfully!');
      await fetchData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create admin profile');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete the admin account for '${adminName}'? They will no longer be able to log in.`)) {
      return;
    }

    try {
      await api.delete(`/users/admins/${adminId}`);
      showToast(`Admin account for '${adminName}' deleted.`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete admin');
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await api.patch(`/users/admins/${adminId}/status`);
      showToast(`Account status updated.`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    try {
      await api.patch(`/users/admins/${resetModalAdmin._id}/password`, {
        newPassword: newPassword.trim(),
      });
      showToast(`Password reset for ${resetModalAdmin.name}.`);
      setResetModalAdmin(null);
      setNewPassword('');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyCredentials = (credentials) => {
    const text = `===============================\nHOSPITALITY HOTEL ADMIN CREDENTIALS\n===============================\nHotel Tenant : ${credentials.hotelName}\nAdmin Name   : ${credentials.name}\nWork Email   : ${credentials.email}\nPassword     : ${credentials.password}\nLogin Portal : ${window.location.origin}/staff/login\n===============================`;
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
    showToast('Credentials copied to clipboard!');
  };

  const handleTestLogin = (email, password) => {
    logout();
    navigate(`/staff/login?email=${encodeURIComponent(email)}&prefillPass=${encodeURIComponent(password || '')}`);
  };

  // Filter admins by search term
  const filteredAdmins = admins.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(search) ||
      a.email?.toLowerCase().includes(search) ||
      a.hotelName?.toLowerCase().includes(search) ||
      a.hotelCode?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Executive Control
        </div>
        <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0' }}>
          Platform SaaS Overview & Admin Governance
        </h1>
        <p className="page-subtitle">
          Centralized governance of multi-tenant hotels, admin credentials provisioning, geographic rules, and service catalog availability.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hotel Tenants</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{hotels.length} Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>
            {hotels.map((h) => h.name).slice(0, 2).join(' & ') || 'Configured'}
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-dark)' }}>Hotel Admin Profiles</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold-dark)' }}>{admins.length} Total</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {admins.filter((a) => a.status === 'ACTIVE').length} Active Credentials
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Geo Rules</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="var(--info)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>7 Deployed</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Delhi, Agra territorial policies</div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '22px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subscription Plans</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>3 Tiers</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Free, Basic, Premium</div>
        </div>
      </div>

      {/* Hotel Admin Management Section */}
      <section id="admins" className="glass-panel animate-fade-in" style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Key size={18} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Hotel Admin Accounts & Credentials
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '680px' }}>
              Super Admin can create Hotel Admin profiles here. Each Admin is linked to a specific Hotel Tenant and can sign into their dashboard <strong>strictly with these provisioned credentials</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
          >
            <UserPlus size={18} />
            <span>Create Admin Profile</span>
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by Admin name, email, or Hotel..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
            />
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '9px 14px' }}
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Admins Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading Hotel Admin accounts...</div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
            <UserCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {searchTerm ? 'No matching admin profiles found' : 'No Hotel Admins created yet'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {searchTerm ? 'Try adjusting your search criteria.' : 'Create an admin profile to assign credentials for hotel operations.'}
            </p>
            {!searchTerm && (
              <button onClick={handleOpenCreateModal} className="btn btn-gold" style={{ fontSize: '0.85rem' }}>
                <UserPlus size={16} style={{ marginRight: '6px' }} /> Create First Hotel Admin
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Administrator</th>
                  <th style={{ padding: '12px 14px' }}>Login Email</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Hotel Tenant</th>
                  <th style={{ padding: '12px 14px' }}>Property / Wing</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin._id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Administrator */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'var(--gold-soft)',
                            color: 'var(--gold-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: '1px solid var(--border-active)',
                          }}
                        >
                          {admin.name
                            ? admin.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'HA'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{admin.name}</div>
                          {admin.phone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {admin.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ background: 'var(--bg-secondary)', padding: '3px 7px', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                          {admin.email}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(admin.email);
                            showToast(`Copied ${admin.email}`);
                          }}
                          className="btn-icon"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                          title="Copy Email"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Hotel Tenant */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="var(--gold-primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{admin.hotelName}</span>
                      </div>
                      {admin.hotelCity && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '21px' }}>
                          {admin.hotelCity} {admin.hotelCode ? `(${admin.hotelCode})` : ''}
                        </div>
                      )}
                    </td>

                    {/* Property */}
                    <td style={{ padding: '14px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                        {admin.propertyName || 'All Wings / Main'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px' }}>
                      <span
                        className={`badge ${admin.status === 'SUSPENDED' ? 'badge-danger' : 'badge-free'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleStatus(admin._id, admin.status)}
                        title="Click to toggle status"
                      >
                        {admin.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleTestLogin(admin.email, '')}
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Switch & Test Login with this admin"
                        >
                          <ExternalLink size={12} /> Test Login
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setResetModalAdmin(admin);
                            setNewPassword('');
                            setResetError(null);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title="Reset Password"
                        >
                          <Key size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                          className="btn btn-outline"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete Admin Profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Multi-Tenant Architecture Status */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Multi-Tenant Hotel Tenants Overview
        </h3>
        <div className="grid-2col">
          {hotels.map((hotel) => (
            <div key={hotel._id} style={{ padding: '18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{hotel.name}</span>
                <span className="badge badge-free">{hotel.code || 'ACTIVE'}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Location:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {hotel.locationHierarchy?.city || 'India'}, {hotel.locationHierarchy?.localArea || ''}
                </strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Governing Admins:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {admins.filter((a) => String(a.hotelId) === String(hotel._id)).map((a) => a.name).join(', ') || 'No Admin Assigned'}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Create New Hotel Admin Profile                         */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
                  <UserPlus size={22} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Create Hotel Admin Profile
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Generate credentials for a hotel administrator. Only these credentials will allow them to log into their hotel operations dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn-icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Hotel Tenant Assignment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Assign Hotel Tenant <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-control"
                    value={selectedHotelId}
                    onChange={(e) => {
                      setSelectedHotelId(e.target.value);
                      setSelectedPropertyId('');
                    }}
                    required
                    style={{ paddingLeft: '38px', appearance: 'auto' }}
                  >
                    {hotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name} ({hotel.locationHierarchy?.city || 'India'})
                      </option>
                    ))}
                  </select>
                  <Building2 size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '14px', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Property Wing (Optional) */}
              {availableProperties.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Assigned Property Wing
                  </label>
                  <select
                    className="input-control"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="">All Wings / Default Main Property</option>
                    {availableProperties.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.code || ''})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Admin Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Admin Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singhania"
                  className="input-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              {/* Work Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Work Email (Login Username) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="e.g. admin.agra@hotelgrand.com"
                    className="input-control"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '38px' }}
                  />
                  <Mail size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  The admin will type this exact email to log into the hotel portal.
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                    Initial Login Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={12} /> Generate Strong
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter or generate a secure password"
                    className="input-control"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  />
                  <Lock size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Minimum 6 characters. You will receive a copy of these credentials to deliver to the admin.
                </div>
              </div>

              {/* Contact Phone (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Contact Phone Number (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    className="input-control"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                  <Phone size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn btn-gold"
                  style={{ padding: '10px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {createLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Provisioning...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Create & Issue Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Post-Creation Credentials Voucher                      */}
      {/* ------------------------------------------------------------- */}
      {createdCredentials && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Admin Profile Created Successfully!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              The administrator can now sign into their property operations dashboard using <strong>only these provisioned credentials</strong>.
            </p>

            {/* Credentials Card Slip */}
            <div
              style={{
                background: 'linear-gradient(145deg, #FAF8F5 0%, #F5EFEB 100%)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px',
                textAlign: 'left',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '10px' }}>
                Official Access Credentials Voucher
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hotel Tenant:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{createdCredentials.hotelName}</strong>

                <span style={{ color: 'var(--text-muted)' }}>Admin Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{createdCredentials.name}</strong>

                <span style={{ color: 'var(--text-muted)' }}>Work Email:</span>
                <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                  {createdCredentials.email}
                </code>

                <span style={{ color: 'var(--text-muted)' }}>Password:</span>
                <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--gold-dark)' }}>
                  {createdCredentials.password}
                </code>

                <span style={{ color: 'var(--text-muted)' }}>Login Portal:</span>
                <span style={{ color: 'var(--info)', fontSize: '0.8rem' }}>/staff/login</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleCopyCredentials(createdCredentials)}
                className="btn btn-gold"
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
              >
                {copiedState ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedState ? 'Copied All to Clipboard!' : 'Copy Full Credentials Voucher'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestLogin(createdCredentials.email, createdCredentials.password)}
                className="btn btn-outline"
                style={{ width: '100%', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
              >
                <ExternalLink size={15} />
                <span>Test Sign In Now as this Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', padding: '6px', marginTop: '4px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Reset Password                                         */}
      {/* ------------------------------------------------------------- */}
      {resetModalAdmin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Reset Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalAdmin(null)}
                className="btn-icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Assign a new login password for <strong>{resetModalAdmin.name}</strong> ({resetModalAdmin.email}).
            </p>

            {resetError && (
              <div style={{ padding: '10px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px' }}>
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  New Secure Password
                </label>
                <input
                  type="password"
                  className="input-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setResetModalAdmin(null)}
                  className="btn btn-outline"
                  style={{ padding: '9px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn btn-gold"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                >
                  {resetLoading ? 'Saving...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
