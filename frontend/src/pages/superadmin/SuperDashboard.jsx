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
  BedDouble,
  Package,
  MapPin,
  UserX,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  SlidersHorizontal,
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
  const [allPlatformRooms, setAllPlatformRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Tab: 'admins' | 'rooms'
  const [activeTab, setActiveTab] = useState('admins');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | DEACTIVATED

  // -------------------------------------------------------------
  // Comprehensive Create Admin Wizard Modal State
  // -------------------------------------------------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Admin & Hotel Brand, 2: Properties, 3: Rooms & Inventory
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Admin & Hotel Details (ALL EMPTY BY DEFAULT)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [hotelBrandName, setHotelBrandName] = useState('');

  // Step 2 & 3: Properties & Rooms List (ALL EMPTY BY DEFAULT)
  const [wizardProperties, setWizardProperties] = useState([]);

  // Post-Creation Voucher Modal
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedState, setCopiedState] = useState(false);

  // Full Admin 360 Details Modal
  const [inspectedAdmin, setInspectedAdmin] = useState(null);
  const [loadingAdmin360, setLoadingAdmin360] = useState(false);

  // Reset Password Modal
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

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isCreateModalOpen || inspectedAdmin || resetModalAdmin || createdCredentials) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen, inspectedAdmin, resetModalAdmin, createdCredentials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsRes, hotelsRes, propsRes, roomsRes] = await Promise.all([
        api.get('/users/admins'),
        api.get('/hotels'),
        api.get('/properties').catch(() => ({ data: [] })),
        api.get('/rooms').catch(() => ({ data: [] })),
      ]);

      setAdmins(adminsRes.data || []);
      setHotels(hotelsRes.data || []);
      setProperties(propsRes.data || []);
      setAllPlatformRooms(roomsRes.data || []);
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Admin@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '2026!';
    setAdminPassword(pass);
  };

  // Open modal with COMPLETELY EMPTY fields
  const handleOpenCreateModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setHotelBrandName('');
    setAdminPassword('');
    setWizardStep(1);
    setCreateError(null);

    // Initial single property with completely empty fields
    setWizardProperties([
      {
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        rooms: [],
      },
    ]);

    setIsCreateModalOpen(true);
  };

  // Wizard Helper: Add empty property
  const handleAddWizardProperty = () => {
    setWizardProperties([
      ...wizardProperties,
      {
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        rooms: [],
      },
    ]);
  };

  // Wizard Helper: Add empty room to a property
  const handleAddRoomToProperty = (propIdx) => {
    const updated = [...wizardProperties];
    updated[propIdx].rooms.push({
      roomNumber: '',
      floor: '',
      roomType: '',
      pricePerNight: '',
      images: [],
      amenities: [],
      inventory: [],
      newInvName: '',
      newInvQty: '1',
      newInvCat: 'Linen',
    });
    setWizardProperties(updated);
  };

  // Wizard Helper: Add inventory item to a room
  const handleAddInventoryToRoom = (propIdx, roomIdx) => {
    const updated = [...wizardProperties];
    const rm = updated[propIdx].rooms[roomIdx];
    if (!rm.newInvName || !rm.newInvName.trim()) return;

    rm.inventory.push({
      name: rm.newInvName.trim(),
      quantity: Number(rm.newInvQty) || 1,
      category: rm.newInvCat || 'General',
    });
    rm.newInvName = '';
    rm.newInvQty = '1';
    setWizardProperties(updated);
  };

  // Wizard Helper: Remove inventory item
  const handleRemoveInventoryFromRoom = (propIdx, roomIdx, invIdx) => {
    const updated = [...wizardProperties];
    updated[propIdx].rooms[roomIdx].inventory.splice(invIdx, 1);
    setWizardProperties(updated);
  };

  // Submit wizard to create Admin
  const handleFinalSubmitAdmin = async (e) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setCreateError('Please complete admin name, email, and password.');
      setWizardStep(1);
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const payload = {
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword.trim(),
        phone: adminPhone.trim(),
        hotelName: hotelBrandName.trim() || `${adminName.trim()}'s Hotel Group`,
        properties: wizardProperties.filter((p) => p.name && p.name.trim()),
      };

      await api.post('/users/admins', payload);

      setCreatedCredentials({
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword.trim(),
        hotelName: payload.hotelName,
        propertiesCount: payload.properties.length,
        roomsCount: payload.properties.reduce((acc, p) => acc + (p.rooms?.length || 0), 0),
        loginUrl: `${window.location.origin}/staff/login`,
      });

      setIsCreateModalOpen(false);
      showToast('Hotel Admin profile & properties provisioned successfully!');
      await fetchData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create admin profile');
    } finally {
      setCreateLoading(false);
    }
  };

  // Deactivate / Activate Admin Profile
  const handleToggleAdminStatus = async (adminId, adminName, currentStatus) => {
    const isCurrentlyActive = currentStatus === 'ACTIVE';
    const confirmText = isCurrentlyActive
      ? `Are you sure you want to DEACTIVATE the profile for '${adminName}'? They will be immediately blocked from logging in.`
      : `Re-activate the admin profile for '${adminName}'? They will be granted full login access.`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.patch(`/users/admins/${adminId}/status`);
      showToast(
        isCurrentlyActive
          ? `Admin profile for '${adminName}' has been DEACTIVATED.`
          : `Admin profile for '${adminName}' has been ACTIVATED.`
      );
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update admin status');
    }
  };

  // Inspect 360
  const handleInspectAdmin = async (adminId) => {
    setLoadingAdmin360(true);
    try {
      const res = await api.get(`/users/admins/${adminId}/details`);
      setInspectedAdmin(res.data);
    } catch (err) {
      alert(err.message || 'Failed to load full profile details');
    } finally {
      setLoadingAdmin360(false);
    }
  };

  // Reset Password
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
      showToast(`Password reset successfully for ${resetModalAdmin.name}.`);
      setResetModalAdmin(null);
      setNewPassword('');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyCredentials = (credentials) => {
    const text = `===============================\nAURA HOSPITALITY ADMIN CREDENTIALS\n===============================\nHotel Group  : ${credentials.hotelName}\nAdmin Name   : ${credentials.name}\nWork Email   : ${credentials.email}\nPassword     : ${credentials.password}\nProperties   : ${credentials.propertiesCount} Property(ies)\nTotal Units  : ${credentials.roomsCount} Rooms\nPortal Login : ${window.location.origin}/staff/login\n===============================`;
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
    showToast('Credentials copied to clipboard!');
  };

  // Filter admins
  const filteredAdmins = admins.filter((a) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      a.name?.toLowerCase().includes(s) ||
      a.email?.toLowerCase().includes(s) ||
      a.hotelName?.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && a.status === 'ACTIVE') ||
      (statusFilter === 'DEACTIVATED' && a.status !== 'ACTIVE');

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%' }}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 999999,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HORIZONTAL HEADER & STATS BAR (Modern & Clean) */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--gold-soft)', color: 'var(--gold-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              <ShieldCheck size={14} />
              <span>SaaS Platform Governance</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              SuperAdmin Command Center
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Create, govern, and oversee all Hotel Admins, multi-wing properties, and real-time room inventories.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-gold"
            style={{
              padding: '13px 24px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-gold)',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <UserPlus size={18} />
            <span>Create Hotel Admin Profile</span>
          </button>
        </div>

        {/* Horizontal KPI Stats Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gold-soft)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Hotel Admins</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{admins.length}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gold-soft)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Properties</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{properties.length}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E6F7F7', color: '#008489', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BedDouble size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Rooms</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#008489', lineHeight: 1 }}>{allPlatformRooms.length}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FFF0F3', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>In-Room Items</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1 }}>
                {allPlatformRooms.reduce((acc, r) => acc + (Array.isArray(r.inventory) ? r.inventory.length : 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CONTROLS: TABS & SEARCH */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Horizontal Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px', background: '#FFFFFF', padding: '6px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'admins' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'admins' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <UserCheck size={16} />
            <span>Hotel Admins ({admins.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'rooms' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'rooms' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <BedDouble size={16} />
            <span>Platform Rooms & Inventory ({allPlatformRooms.length})</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '420px', minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search by admin name, email, hotel..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>

          {activeTab === 'admins' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-control"
              style={{ width: 'auto', minWidth: '110px', height: '38px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Hotel Admins List                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'admins' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>
                <UserCheck size={32} color="var(--gold-primary)" />
              </div>
              <div>Loading hotel admin profiles...</div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            /* Clean Empty State */
            <div
              className="glass-panel"
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-soft)', color: 'var(--gold-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <UserPlus size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                {searchTerm || statusFilter !== 'ALL' ? 'No matching hotel admins found' : 'No Hotel Admins Yet'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try clearing your search query or status filter.'
                  : 'Start fresh by provisioning your first Hotel Admin profile along with their properties, rooms, and inventories.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="btn btn-gold"
                style={{ padding: '12px 26px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                <span>Create Hotel Admin Profile</span>
              </button>
            </div>
          ) : (
            /* Horizontal Admin Cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredAdmins.map((admin) => {
                const isActive = admin.status === 'ACTIVE';
                return (
                  <div
                    key={admin._id}
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Left: Avatar & Personal Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: isActive ? 'var(--gold-soft)' : '#FFF0F3',
                          color: isActive ? 'var(--gold-primary)' : 'var(--gold-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                        }}
                      >
                        {admin.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {admin.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontFamily: 'monospace' }}>
                          {admin.email}
                        </div>
                        {admin.phone && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {admin.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Hotel Group & Properties */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Hotel Group</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {admin.hotelName || 'Hospitality Group'}
                        </div>
                      </div>

                      <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Portfolio</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {admin.propertiesCount || 0} Properties • {admin.roomsCount || 0} Rooms
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: isActive ? '#E6F7F7' : '#FFF0F3',
                          color: isActive ? '#008489' : 'var(--gold-dark)',
                          border: isActive ? '1px solid rgba(0,132,137,0.3)' : '1px solid var(--border-active)',
                        }}
                      >
                        {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleInspectAdmin(admin._id)}
                        className="btn btn-outline"
                        style={{ padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Eye size={14} />
                        <span>View 360</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAdminStatus(admin._id, admin.name, admin.status)}
                        className={isActive ? 'btn btn-outline' : 'btn btn-gold'}
                        style={{
                          padding: '7px 12px',
                          fontSize: '0.78rem',
                          color: isActive ? 'var(--gold-dark)' : '#FFFFFF',
                          borderColor: isActive ? 'var(--border-active)' : undefined,
                        }}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResetModalAdmin(admin);
                          setNewPassword('');
                          setResetError(null);
                        }}
                        className="btn btn-outline"
                        style={{ padding: '7px 10px', fontSize: '0.78rem' }}
                        title="Reset Password"
                      >
                        <Key size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Platform Rooms Explorer                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'rooms' && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {allPlatformRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <BedDouble size={40} color="var(--gold-primary)" style={{ opacity: 0.5, margin: '0 auto 10px' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>No rooms currently in platform inventory</div>
              <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Rooms added by admins or provisioned via SuperAdmin will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
              {allPlatformRooms.map((room) => (
                <div
                  key={room._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                  }}
                >
                  <div style={{ height: '140px', position: 'relative', background: '#000000' }}>
                    <img
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'}
                      alt={`Room ${room.roomNumber}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 10px', background: 'rgba(255,255,255,0.95)', color: 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                      Room {room.roomNumber}
                    </span>
                    <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 8px', background: room.status === 'AVAILABLE' ? '#E6F7F7' : '#FFF0F3', color: room.status === 'AVAILABLE' ? '#008489' : 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>
                      {room.status}
                    </span>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{room.propertyName || 'Property Wing'}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{room.roomTypeName || 'Deluxe Suite'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Floor {room.floor || 1} • ₹{(room.pricePerNight || 0).toLocaleString('en-IN')}/night</div>
                    <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                      {(room.inventory || []).length} In-Room Inventory Items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PROVISION NEW HOTEL ADMIN (100% FIXED & RESPONSIVE)    */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
                  <UserPlus size={20} />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Provision New Hotel Admin
                  </h2>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Step {wizardStep} of 3 • Enter all custom admin, property, and room details.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div style={{ display: 'flex', gap: '6px', padding: '0 28px', marginTop: '12px' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 1 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 2 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 3 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
            </div>

            {/* Modal Body (Scrollable & Responsive) */}
            <div className="modal-body">
              {createError && (
                <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {/* STEP 1: Admin Account Details (ALL EMPTY BY DEFAULT) */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                    1. Administrator Personal & Account Credentials
                  </div>

                  <div className="responsive-form-grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Admin Full Name *
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. John Doe"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Work Email (Login ID) *
                      </label>
                      <input
                        type="email"
                        className="input-control"
                        placeholder="admin@hotelgroup.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="responsive-form-grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="+91 98765 43210"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Hotel Group / Brand Name *
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="e.g. Sovereign Luxury Resorts"
                        value={hotelBrandName}
                        onChange={(e) => setHotelBrandName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Login Password *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-control"
                        placeholder="Create strong password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-outline"
                        style={{ padding: '0 12px' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="btn btn-outline"
                        style={{ padding: '0 14px', whiteSpace: 'nowrap' }}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Properties Owned (ALL EMPTY BY DEFAULT) */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                        2. Properties Owned by {adminName || 'Admin'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Add each hotel location, wing, or property owned.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddWizardProperty}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Add Property
                    </button>
                  </div>

                  {wizardProperties.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                          Property #{pIdx + 1}
                        </span>
                        {wizardProperties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setWizardProperties(wizardProperties.filter((_, idx) => idx !== pIdx))}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.74rem' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="responsive-form-grid-2-1">
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Property Name *</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Palace Wing"
                            value={prop.name}
                            onChange={(e) => {
                              const updated = [...wizardProperties];
                              updated[pIdx].name = e.target.value;
                              setWizardProperties(updated);
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Property Code</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. PW-01"
                            value={prop.code}
                            onChange={(e) => {
                              const updated = [...wizardProperties];
                              updated[pIdx].code = e.target.value;
                              setWizardProperties(updated);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Street Address</label>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. 10 Marine Drive"
                          value={prop.address}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].address = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                      </div>

                      <div className="responsive-form-grid-3">
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>City</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Mumbai"
                            value={prop.city}
                            onChange={(e) => {
                              const updated = [...wizardProperties];
                              updated[pIdx].city = e.target.value;
                              setWizardProperties(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>State</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. Maharashtra"
                            value={prop.state}
                            onChange={(e) => {
                              const updated = [...wizardProperties];
                              updated[pIdx].state = e.target.value;
                              setWizardProperties(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Country</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="India"
                            value={prop.country}
                            onChange={(e) => {
                              const updated = [...wizardProperties];
                              updated[pIdx].country = e.target.value;
                              setWizardProperties(updated);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Rooms & In-Room Inventory (ALL EMPTY BY DEFAULT) */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                      3. Rooms & In-Room Inventory Configuration
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Add rooms under each property and configure specific in-room items.
                    </div>
                  </div>

                  {wizardProperties.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gold-dark)', fontSize: '0.88rem' }}>
                          Rooms for: {prop.name || `Property #${pIdx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddRoomToProperty(pIdx)}
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: '0.74rem' }}
                        >
                          + Add Room
                        </button>
                      </div>

                      {prop.rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                          No rooms added to this property yet. Click '+ Add Room' above.
                        </div>
                      ) : (
                        prop.rooms.map((room, rIdx) => (
                          <div
                            key={rIdx}
                            style={{
                              padding: '14px',
                              background: '#FFFFFF',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            <div className="responsive-form-grid-3">
                              <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Room # *</label>
                                <input
                                  type="text"
                                  className="input-control"
                                  placeholder="e.g. 101"
                                  value={room.roomNumber}
                                  onChange={(e) => {
                                    const updated = [...wizardProperties];
                                    updated[pIdx].rooms[rIdx].roomNumber = e.target.value;
                                    setWizardProperties(updated);
                                  }}
                                  required
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Floor</label>
                                <input
                                  type="number"
                                  className="input-control"
                                  placeholder="1"
                                  value={room.floor}
                                  onChange={(e) => {
                                    const updated = [...wizardProperties];
                                    updated[pIdx].rooms[rIdx].floor = e.target.value;
                                    setWizardProperties(updated);
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Category / Type</label>
                                <input
                                  type="text"
                                  className="input-control"
                                  placeholder="e.g. Deluxe Suite"
                                  value={room.roomType}
                                  onChange={(e) => {
                                    const updated = [...wizardProperties];
                                    updated[pIdx].rooms[rIdx].roomType = e.target.value;
                                    setWizardProperties(updated);
                                  }}
                                />
                              </div>
                            </div>

                            {/* Inventory adding section for this room */}
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                📦 Add In-Room Inventory:
                              </div>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <input
                                  type="text"
                                  className="input-control"
                                  placeholder="Item name (e.g. Bath Towels)"
                                  value={room.newInvName || ''}
                                  onChange={(e) => {
                                    const updated = [...wizardProperties];
                                    updated[pIdx].rooms[rIdx].newInvName = e.target.value;
                                    setWizardProperties(updated);
                                  }}
                                  style={{ flex: 2, minWidth: '140px' }}
                                />
                                <input
                                  type="number"
                                  className="input-control"
                                  placeholder="Qty"
                                  value={room.newInvQty || '1'}
                                  onChange={(e) => {
                                    const updated = [...wizardProperties];
                                    updated[pIdx].rooms[rIdx].newInvQty = e.target.value;
                                    setWizardProperties(updated);
                                  }}
                                  min="1"
                                  style={{ width: '70px' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddInventoryToRoom(pIdx, rIdx)}
                                  className="btn btn-outline"
                                  style={{ padding: '0 12px', fontSize: '0.75rem' }}
                                >
                                  + Add Item
                                </button>
                              </div>

                              {/* Inventory Chips */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(room.inventory || []).map((inv, iIdx) => (
                                  <span
                                    key={iIdx}
                                    style={{
                                      padding: '3px 8px',
                                      background: 'var(--bg-tertiary)',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      border: '1px solid var(--border-color)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                    }}
                                  >
                                    <span>{inv.name} (x{inv.quantity})</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveInventoryFromRoom(pIdx, rIdx, iIdx)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0 }}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky at Bottom) */}
            <div className="modal-footer">
              {wizardStep > 1 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Back
                </button>
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1) {
                      if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
                        setCreateError('Please fill in Admin Name, Work Email, and Password.');
                        return;
                      }
                    }
                    setCreateError(null);
                    setWizardStep(wizardStep + 1);
                  }}
                  className="btn btn-gold"
                  style={{ padding: '10px 22px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
                >
                  <span>Continue to Step {wizardStep + 1}</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={handleFinalSubmitAdmin}
                  className="btn btn-gold"
                  style={{ padding: '10px 26px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
                >
                  {createLoading ? 'Provisioning Profile...' : 'Complete & Launch Admin Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Post-Creation Voucher                                  */}
      {/* ------------------------------------------------------------- */}
      {createdCredentials && (
        <div className="modal-backdrop" onClick={() => setCreatedCredentials(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E6F7F7', color: '#008489', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Hotel Admin Profile Created!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              The administrator can now log in using these provisioned credentials.
            </p>

            <div style={{ padding: '18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Hotel Group: </span><strong>{createdCredentials.hotelName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Properties: </span><strong>{createdCredentials.propertiesCount} Property(ies)</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Total Units: </span><strong>{createdCredentials.roomsCount} Rooms</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Login Email: </span><strong style={{ color: 'var(--gold-dark)', fontFamily: 'monospace' }}>{createdCredentials.email}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Password: </span><strong style={{ fontFamily: 'monospace' }}>{createdCredentials.password}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => handleCopyCredentials(createdCredentials)} className="btn btn-outline" style={{ flex: 1, padding: '11px' }}>
                {copiedState ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedState ? 'Copied' : 'Copy Voucher'}</span>
              </button>
              <button type="button" onClick={() => setCreatedCredentials(null)} className="btn btn-gold" style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-full)' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Full Admin 360 Details Inspector                      */}
      {/* ------------------------------------------------------------- */}
      {inspectedAdmin && (
        <div className="modal-backdrop" onClick={() => setInspectedAdmin(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ padding: '2px 8px', background: inspectedAdmin.admin.status === 'ACTIVE' ? '#E6F7F7' : '#FFF0F3', color: inspectedAdmin.admin.status === 'ACTIVE' ? '#008489' : 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800 }}>
                    {inspectedAdmin.admin.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin 360 Full Oversight</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {inspectedAdmin.admin.name} ({inspectedAdmin.hotel.name})
                </h3>
              </div>
              <button type="button" onClick={() => setInspectedAdmin(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                Properties Owned ({inspectedAdmin.totalProperties}) • Rooms ({inspectedAdmin.totalRooms})
              </div>

              {inspectedAdmin.properties.map((prop) => (
                <div key={prop._id} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{prop.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', fontWeight: 700 }}>{prop.roomsCount || 0} Rooms</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {prop.address ? `${prop.address}, ${prop.city}` : prop.city || 'India'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {(prop.rooms || []).map((rm) => (
                      <div key={rm._id} style={{ padding: '10px', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, color: 'var(--gold-dark)', fontSize: '0.84rem' }}>Room {rm.roomNumber}</span>
                          <span style={{ fontSize: '0.68rem', padding: '1px 5px', background: rm.status === 'AVAILABLE' ? '#E6F7F7' : '#FFF0F3', color: rm.status === 'AVAILABLE' ? '#008489' : 'var(--gold-dark)', borderRadius: '4px' }}>
                            {rm.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{rm.roomTypeName || 'Deluxe Suite'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>{(rm.inventory || []).length} inventory items</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setInspectedAdmin(null)} className="btn btn-outline" style={{ padding: '9px 20px', fontSize: '0.84rem' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Reset Password                                         */}
      {/* ------------------------------------------------------------- */}
      {resetModalAdmin && (
        <div className="modal-backdrop" onClick={() => setResetModalAdmin(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Reset Admin Password
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Enter a new password for <strong>{resetModalAdmin.name}</strong>.
            </p>

            {resetError && (
              <div style={{ padding: '8px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', marginBottom: '12px' }}>
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setResetModalAdmin(null)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={resetLoading} className="btn btn-gold" style={{ padding: '8px 18px', fontSize: '0.84rem', borderRadius: 'var(--radius-full)' }}>
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperDashboard;
