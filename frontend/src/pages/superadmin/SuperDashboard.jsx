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
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const DEFAULT_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
];

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

  // Active Tab: 'admins' | 'rooms' | 'overview'
  const [activeTab, setActiveTab] = useState('admins');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // -------------------------------------------------------------
  // Comprehensive Create Admin Wizard Modal State
  // -------------------------------------------------------------
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Admin & Brand, 2: Properties & Rooms, 3: Inventory
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Admin & Hotel Details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [hotelBrandName, setHotelBrandName] = useState('');

  // Step 2 & 3: Properties, Rooms & Inventories List
  const [wizardProperties, setWizardProperties] = useState([
    {
      name: 'Grand Imperial Palace - Main Wing',
      code: 'GIP-01',
      address: '15 Heritage Boulevard, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      phone: '+91 98765 43210',
      email: 'imperial@hotel.com',
      rooms: [
        {
          roomNumber: '101',
          floor: 1,
          roomType: 'Deluxe Heritage Suite',
          pricePerNight: 4500,
          images: [DEFAULT_PRESET_IMAGES[0]],
          amenities: ['King Size Bed', 'Smart 4K TV', 'Wi-Fi 6', 'Mini Bar', 'Electronic Safe'],
          inventory: [
            { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
            { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
            { name: 'Luxury Cotton Bathrobes', quantity: 2, category: 'Linen' },
            { name: 'Nespresso Pods & Kettle Set', quantity: 1, category: 'Appliances' },
          ],
        },
        {
          roomNumber: '201',
          floor: 2,
          roomType: 'Executive Royal King',
          pricePerNight: 5500,
          images: [DEFAULT_PRESET_IMAGES[1]],
          amenities: ['King Bed', 'City View Balcony', 'Smart TV', 'Wi-Fi 6', 'Espresso Machine'],
          inventory: [
            { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
            { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
            { name: 'RFID Smart Keys', quantity: 2, category: 'Access' },
          ],
        },
      ],
    },
  ]);

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

  const handleOpenCreateModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setHotelBrandName('');
    setWizardStep(1);
    generatePassword();
    setCreateError(null);

    // Initial default property and rooms
    setWizardProperties([
      {
        name: 'The Grand Heritage Resort - West Wing',
        code: 'GHR-01',
        address: '14 Connaught Place, Central Boulevard',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+91 98765 43210',
        email: 'grand@heritage.com',
        rooms: [
          {
            roomNumber: '101',
            floor: 1,
            roomType: 'Deluxe Heritage Suite',
            pricePerNight: 4500,
            images: [DEFAULT_PRESET_IMAGES[0]],
            amenities: ['King Size Bed', 'Smart 4K TV', 'Wi-Fi 6', 'Mini Bar', 'Electronic Safe'],
            inventory: [
              { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
              { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
              { name: 'Luxury Cotton Bathrobes', quantity: 2, category: 'Linen' },
              { name: 'Nespresso Pods & Kettle Set', quantity: 1, category: 'Appliances' },
            ],
          },
          {
            roomNumber: '201',
            floor: 2,
            roomType: 'Executive Royal King',
            pricePerNight: 5500,
            images: [DEFAULT_PRESET_IMAGES[1]],
            amenities: ['King Bed', 'City View Balcony', 'Smart TV', 'Wi-Fi 6', 'Espresso Machine'],
            inventory: [
              { name: 'Egyptian Cotton Bath Towels', quantity: 4, category: 'Linen' },
              { name: 'Feather Comfort Pillows', quantity: 4, category: 'Bedding' },
              { name: 'RFID Smart Keys', quantity: 2, category: 'Access' },
            ],
          },
        ],
      },
    ]);

    setIsCreateModalOpen(true);
  };

  // Wizard Helper: Add another property
  const handleAddWizardProperty = () => {
    const idx = wizardProperties.length + 1;
    setWizardProperties([
      ...wizardProperties,
      {
        name: `${hotelBrandName || 'Hotel'} - Property Wing ${idx}`,
        code: `WING-${idx}`,
        address: 'Boulevard Road',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        phone: adminPhone || '',
        email: adminEmail || '',
        rooms: [
          {
            roomNumber: `${idx * 100 + 1}`,
            floor: idx,
            roomType: 'Deluxe Suite',
            pricePerNight: 4500,
            images: [DEFAULT_PRESET_IMAGES[idx % DEFAULT_PRESET_IMAGES.length]],
            amenities: ['King Bed', 'Smart 4K TV', 'Wi-Fi 6', 'Mini Bar'],
            inventory: [
              { name: 'Bath Towels', quantity: 4, category: 'Linen' },
              { name: 'Pillows', quantity: 4, category: 'Bedding' },
            ],
          },
        ],
      },
    ]);
  };

  // Wizard Helper: Add room to property
  const handleAddRoomToProperty = (propIdx) => {
    const updated = [...wizardProperties];
    const p = updated[propIdx];
    const newRoomNum = `${(propIdx + 1) * 100 + p.rooms.length + 1}`;
    p.rooms.push({
      roomNumber: newRoomNum,
      floor: propIdx + 1,
      roomType: 'Deluxe Heritage Suite',
      pricePerNight: 4500,
      images: [DEFAULT_PRESET_IMAGES[p.rooms.length % DEFAULT_PRESET_IMAGES.length]],
      amenities: ['King Bed', 'Smart 4K TV', 'Wi-Fi 6', 'Mini Bar'],
      inventory: [
        { name: 'Bath Towels', quantity: 4, category: 'Linen' },
        { name: 'Pillows', quantity: 4, category: 'Bedding' },
      ],
    });
    setWizardProperties(updated);
  };

  // Wizard Helper: Add inventory item to room
  const handleAddInventoryToRoom = (propIdx, roomIdx, itemName, itemQty = 2, itemCat = 'Linen') => {
    if (!itemName?.trim()) return;
    const updated = [...wizardProperties];
    updated[propIdx].rooms[roomIdx].inventory.push({
      name: itemName.trim(),
      quantity: Number(itemQty) || 1,
      category: itemCat,
    });
    setWizardProperties(updated);
  };

  // Wizard Submit: SuperAdmin creates Admin with full property & room configuration
  const handleFinalSubmitAdmin = async (e) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setCreateError('Please complete the admin personal details (Name, Email, Password).');
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
        hotelName: hotelBrandName.trim() || `${adminName.trim()}'s Luxury Hotel Group`,
        properties: wizardProperties,
      };

      const res = await api.post('/users/admins', payload);

      setCreatedCredentials({
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword.trim(),
        hotelName: payload.hotelName,
        propertiesCount: wizardProperties.length,
        roomsCount: wizardProperties.reduce((acc, p) => acc + p.rooms.length, 0),
        loginUrl: `${window.location.origin}/staff/login`,
      });

      setIsCreateModalOpen(false);
      showToast('Hotel Admin, Properties & Rooms provisioned successfully!');
      await fetchData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create admin profile');
    } finally {
      setCreateLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Deactivate / Activate Admin Profile
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Admin 360 Full Inspector (See each and everything of profile)
  // -------------------------------------------------------------
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
    showToast('Credentials voucher copied to clipboard!');
  };

  // Filter admins
  const filteredAdmins = admins.filter((a) => {
    const s = searchTerm.toLowerCase();
    return (
      a.name?.toLowerCase().includes(s) ||
      a.email?.toLowerCase().includes(s) ||
      a.hotelName?.toLowerCase().includes(s) ||
      a.hotelCode?.toLowerCase().includes(s)
    );
  });

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

      {/* SuperAdmin Header */}
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
            SaaS Platform Governance
          </div>
          <h1
            className="title-gold page-title"
            style={{ fontSize: '2.2rem', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 800 }}
          >
            SuperAdmin Control Center
          </h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Full oversight of hotel admins, properties, multi-room inventories, and account deactivation governance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
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
          <UserPlus size={18} />
          <span>Create Hotel Admin Profile</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
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
            <UserCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hotel Admins</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {admins.length} Total
            </div>
            <div style={{ fontSize: '0.75rem', color: '#008489', marginTop: '4px', fontWeight: 600 }}>
              {admins.filter((a) => a.status === 'ACTIVE').length} Active • {admins.filter((a) => a.status !== 'ACTIVE').length} Deactivated
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
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Properties Across Admins</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {properties.length} Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Multi-wing resorts & hotels
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
            <BedDouble size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Rooms Managed</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#008489', lineHeight: 1.1 }}>
              {allPlatformRooms.length} Rooms
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Live synchronized inventory
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
            <Package size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tracked In-Room Inventory</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {allPlatformRooms.reduce((acc, r) => acc + (Array.isArray(r.inventory) ? r.inventory.length : 0), 0)} Items
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Verified linens & electronics
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Admins List vs Live Rooms Explorer */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('admins')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'admins' ? 'var(--gold-primary)' : 'transparent',
            color: activeTab === 'admins' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <UserCheck size={16} />
          <span>Hotel Admins Governance ({admins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'rooms' ? 'var(--gold-primary)' : 'transparent',
            color: activeTab === 'rooms' ? '#FFFFFF' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <BedDouble size={16} />
          <span>Live Platform Rooms & Inventory ({allPlatformRooms.length})</span>
        </button>
      </div>

      {/* TAB 1: Hotel Admins List & Governance */}
      {activeTab === 'admins' && (
        <section
          className="glass-panel"
          style={{
            padding: '28px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Search bar */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--gold-primary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="text"
                placeholder="Search hotel admins by name, email, or hotel tenant..."
                className="input-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '42px', borderRadius: 'var(--radius-full)' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>
                <UserCheck size={32} color="var(--gold-primary)" />
              </div>
              <div>Loading hotel admin profiles...</div>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              No hotel admin accounts match your search.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Admin Profile
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Assigned Hotel & Properties
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Capacity / Rooms
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Profile Status
                    </th>
                    <th style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>
                      Governance Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => {
                    const isActive = admin.status === 'ACTIVE';
                    return (
                      <tr key={admin._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '18px 20px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                            {admin.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', marginTop: '2px', fontFamily: 'monospace' }}>
                            {admin.email}
                          </div>
                          {admin.phone && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {admin.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '18px 20px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {admin.hotelName || 'Hospitality Group'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            {admin.propertiesCount || 1} Property(ies) owned
                          </div>
                        </td>

                        <td style={{ padding: '18px 20px' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                            {admin.roomsCount || 0} Rooms
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {admin.inventoryCount || 0} Inventory Items
                          </div>
                        </td>

                        <td style={{ padding: '18px 20px' }}>
                          {isActive ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                background: '#E6F7F7',
                                color: '#008489',
                                border: '1px solid rgba(0,132,137,0.3)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={13} />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 12px',
                                background: '#FFF0F3',
                                color: 'var(--gold-dark)',
                                border: '1px solid var(--border-active)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              <UserX size={13} />
                              <span>Deactivated</span>
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                            {/* View Full 360 Profile */}
                            <button
                              type="button"
                              onClick={() => handleInspectAdmin(admin._id)}
                              className="btn btn-outline"
                              style={{
                                padding: '7px 12px',
                                fontSize: '0.78rem',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                              title="Inspect properties, rooms, images, and inventory"
                            >
                              <Eye size={14} />
                              <span>View 360</span>
                            </button>

                            {/* Deactivate / Activate Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleAdminStatus(admin._id, admin.name, admin.status)}
                              className={isActive ? 'btn btn-outline' : 'btn btn-gold'}
                              style={{
                                padding: '7px 12px',
                                fontSize: '0.78rem',
                                borderRadius: 'var(--radius-sm)',
                                color: isActive ? 'var(--gold-dark)' : '#FFFFFF',
                                borderColor: isActive ? 'var(--border-active)' : undefined,
                              }}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => {
                                setResetModalAdmin(admin);
                                setNewPassword('');
                                setResetError(null);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '7px 10px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                              title="Reset Admin Password"
                            >
                              <Key size={14} />
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
        </section>
      )}

      {/* TAB 2: Live Platform Rooms & Inventory Explorer */}
      {activeTab === 'rooms' && (
        <section
          className="glass-panel"
          style={{
            padding: '28px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live Platform Room Units
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Whenever an admin adds a room to their property, it synchronizes and displays in real time here.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {allPlatformRooms.map((room) => (
              <div
                key={room._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: '170px', position: 'relative' }}>
                  <img
                    src={room.images?.[0] || DEFAULT_PRESET_IMAGES[0]}
                    alt={`Room ${room.roomNumber}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.95)', color: 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                      Room {room.roomNumber}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span style={{ padding: '4px 10px', background: room.status === 'AVAILABLE' ? '#E6F7F7' : '#FFF0F3', color: room.status === 'AVAILABLE' ? '#008489' : 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700 }}>
                      {room.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {room.propertyName || 'Property Wing'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {room.roomTypeName || 'Deluxe Suite'}
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {(room.amenities || []).slice(0, 3).map((a, i) => (
                      <span key={i} style={{ padding: '2px 7px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600 }}>
                        {a}
                      </span>
                    ))}
                    {(room.amenities || []).length > 3 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Inventory count */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Floor {room.floor || 1}</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>
                      {(room.inventory || []).length} Inventory Items
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Multi-Property, Room & Inventory Admin Creation Wizard */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="modal-backdrop active" onClick={() => setIsCreateModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '820px',
              width: '92%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                    <UserPlus size={20} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Provision New Hotel Admin Profile
                  </h2>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Step {wizardStep} of 3: Configure admin credentials, properties owned, and in-room inventories.
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

            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 1 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 2 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: wizardStep >= 3 ? 'var(--gold-primary)' : 'var(--border-color)' }} />
            </div>

            {createError && (
              <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleFinalSubmitAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* STEP 1: Admin Details & Hotel Brand */}
              {wizardStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                    1. Administrator Personal & Account Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Admin Full Name *
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Work Email (Login ID) *
                      </label>
                      <input
                        type="email"
                        className="input-control"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin.rajesh@hotelgroup.com"
                        required
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
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Hotel Group / Organization Name *
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={hotelBrandName}
                        onChange={(e) => setHotelBrandName(e.target.value)}
                        placeholder="e.g. Grand Heritage Resorts Group"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Login Password *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-control"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-outline" style={{ padding: '0 12px' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button type="button" onClick={generatePassword} className="btn btn-outline" style={{ padding: '0 14px' }}>
                        Generate
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!adminName.trim() || !adminEmail.trim()) {
                          setCreateError('Please complete admin name and email.');
                          return;
                        }
                        setCreateError(null);
                        setWizardStep(2);
                      }}
                      className="btn btn-gold"
                      style={{ padding: '12px 24px', borderRadius: 'var(--radius-full)' }}
                    >
                      <span>Proceed to Properties Setup</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Properties Owned by Admin */}
              {wizardStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                        2. Properties Owned by {adminName || 'Admin'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Configure property addresses, cities, and initial room counts.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddWizardProperty}
                      className="btn btn-outline"
                      style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                    >
                      <Plus size={14} /> Add Another Property
                    </button>
                  </div>

                  {wizardProperties.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '18px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                          Property #{pIdx + 1}: {prop.name}
                        </span>
                        {wizardProperties.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setWizardProperties(wizardProperties.filter((_, idx) => idx !== pIdx))}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Remove Property
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Property Name"
                          value={prop.name}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].name = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Code (e.g. PROP-01)"
                          value={prop.code}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].code = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                      </div>

                      <input
                        type="text"
                        className="input-control"
                        placeholder="Full Street Address"
                        value={prop.address}
                        onChange={(e) => {
                          const updated = [...wizardProperties];
                          updated[pIdx].address = e.target.value;
                          setWizardProperties(updated);
                        }}
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="City"
                          value={prop.city}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].city = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                        <input
                          type="text"
                          className="input-control"
                          placeholder="State"
                          value={prop.state}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].state = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Country"
                          value={prop.country}
                          onChange={(e) => {
                            const updated = [...wizardProperties];
                            updated[pIdx].country = e.target.value;
                            setWizardProperties(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="btn btn-outline"
                      style={{ padding: '12px 20px' }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="btn btn-gold"
                      style={{ padding: '12px 24px', borderRadius: 'var(--radius-full)' }}
                    >
                      <span>Proceed to Rooms & Inventory</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Rooms & In-Room Inventory Configuration */}
              {wizardStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                      3. Rooms & In-Room Inventory Setup
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Specify the rooms for each property along with their photo previews and inventory items.
                    </div>
                  </div>

                  {wizardProperties.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        padding: '18px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--gold-dark)', fontSize: '0.92rem' }}>
                          Rooms for: {prop.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddRoomToProperty(pIdx)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          + Add Room
                        </button>
                      </div>

                      {prop.rooms.map((room, rIdx) => (
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
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Room #</label>
                              <input
                                type="text"
                                className="input-control"
                                value={room.roomNumber}
                                onChange={(e) => {
                                  const updated = [...wizardProperties];
                                  updated[pIdx].rooms[rIdx].roomNumber = e.target.value;
                                  setWizardProperties(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Floor</label>
                              <input
                                type="number"
                                className="input-control"
                                value={room.floor}
                                onChange={(e) => {
                                  const updated = [...wizardProperties];
                                  updated[pIdx].rooms[rIdx].floor = Number(e.target.value);
                                  setWizardProperties(updated);
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category / Type</label>
                              <input
                                type="text"
                                className="input-control"
                                value={room.roomType}
                                onChange={(e) => {
                                  const updated = [...wizardProperties];
                                  updated[pIdx].rooms[rIdx].roomType = e.target.value;
                                  setWizardProperties(updated);
                                }}
                              />
                            </div>
                          </div>

                          {/* Inventory List for this room */}
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              📦 Room Inventory:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {room.inventory.map((inv, iIdx) => (
                                <span
                                  key={iIdx}
                                  style={{
                                    padding: '3px 8px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    border: '1px solid var(--border-color)',
                                  }}
                                >
                                  {inv.name} (x{inv.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="btn btn-outline"
                      style={{ padding: '12px 20px' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="btn btn-gold"
                      style={{ padding: '12px 30px', borderRadius: 'var(--radius-full)' }}
                    >
                      {createLoading ? 'Provisioning Everything...' : 'Complete & Launch Admin Profile'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Post-Creation Credentials Voucher                      */}
      {/* ------------------------------------------------------------- */}
      {createdCredentials && (
        <div className="modal-backdrop active" onClick={() => setCreatedCredentials(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '90%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#E6F7F7',
                color: '#008489',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Admin Profile Successfully Provisioned!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '22px' }}>
              The Hotel Admin can now log in and immediately see all their properties, rooms, and inventories.
            </p>

            <div
              style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.86rem',
                border: '1px solid var(--border-color)',
                marginBottom: '22px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Hotel Group: </span>
                <strong>{createdCredentials.hotelName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Properties Configured: </span>
                <strong>{createdCredentials.propertiesCount} Properties</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Total Units: </span>
                <strong>{createdCredentials.roomsCount} Rooms</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Login Email: </span>
                <strong style={{ color: 'var(--gold-dark)', fontFamily: 'monospace' }}>{createdCredentials.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Password: </span>
                <strong style={{ fontFamily: 'monospace' }}>{createdCredentials.password}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleCopyCredentials(createdCredentials)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px' }}
              >
                {copiedState ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedState ? 'Copied!' : 'Copy Voucher'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="btn btn-gold"
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)' }}
              >
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
        <div className="modal-backdrop active" onClick={() => setInspectedAdmin(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '820px',
              width: '92%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '3px 10px', background: inspectedAdmin.admin.status === 'ACTIVE' ? '#E6F7F7' : '#FFF0F3', color: inspectedAdmin.admin.status === 'ACTIVE' ? '#008489' : 'var(--gold-dark)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800 }}>
                    {inspectedAdmin.admin.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Hotel Admin 360 Full Oversight
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary)' }}>
                  {inspectedAdmin.admin.name} ({inspectedAdmin.hotel.name})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectedAdmin(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Properties & Underneath Rooms Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
                All Properties Owned ({inspectedAdmin.totalProperties}) • Total Rooms ({inspectedAdmin.totalRooms})
              </div>

              {inspectedAdmin.properties.map((prop) => (
                <div
                  key={prop._id}
                  style={{
                    padding: '18px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {prop.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 700 }}>
                      {prop.roomsCount || 0} Rooms Configured
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {prop.address ? `${prop.address}, ${prop.city}` : prop.city || 'India'}
                  </div>

                  {/* Rooms inside this property */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {(prop.rooms || []).map((rm) => (
                      <div
                        key={rm._id}
                        style={{
                          padding: '12px',
                          background: '#FFFFFF',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: 'var(--gold-dark)', fontSize: '0.88rem' }}>
                            Room {rm.roomNumber}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '2px 6px', background: rm.status === 'AVAILABLE' ? '#E6F7F7' : '#FFF0F3', color: rm.status === 'AVAILABLE' ? '#008489' : 'var(--gold-dark)', borderRadius: '4px' }}>
                            {rm.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {rm.roomTypeName || 'Deluxe Suite'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {(rm.inventory || []).length} inventory items
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setInspectedAdmin(null)}
                className="btn btn-outline"
                style={{ padding: '10px 22px' }}
              >
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
        <div className="modal-backdrop active" onClick={() => setResetModalAdmin(null)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '90%',
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Reset Admin Password
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Enter a new password for <strong>{resetModalAdmin.name}</strong>.
            </p>

            {resetError && (
              <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px' }}>
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="Enter at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setResetModalAdmin(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={resetLoading} className="btn btn-gold">
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
