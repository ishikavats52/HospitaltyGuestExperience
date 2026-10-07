import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Building2,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Power,
  RefreshCw,
  Search,
  Copy,
  Check,
  X,
  ChefHat,
  ConciergeBell,
  Sparkles,
  DollarSign,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffManager = () => {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create Staff Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RECEPTION');
  const [propertyId, setPropertyId] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Created Credentials Voucher Modal
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [staffRes, propRes] = await Promise.all([
        api.get('/users/staff'),
        api.get('/properties').catch(() => ({ data: [] })),
      ]);
      setStaffList(staffRes.data || []);
      setProperties(propRes.data || []);
      if (propRes.data?.length > 0 && !propertyId) {
        setPropertyId(propRes.data[0]._id);
      }
    } catch (err) {
      console.warn('Failed to fetch staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const openCreateModal = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('RECEPTION');
    generatePassword();
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setCreateError('Please fill in employee name, work email, and password.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await api.post('/users/staff', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        propertyId: propertyId || undefined,
        phone: phone.trim() || undefined,
      });

      const selectedProp = properties.find((p) => String(p._id) === String(propertyId));

      setCreatedCredentials({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: role,
        propertyName: selectedProp ? selectedProp.name : 'Main Wing',
        loginUrl: `${window.location.origin}/staff/login`,
      });

      setIsCreateModalOpen(false);
      showToast(`Employee account created for ${name.trim()}!`);
      await fetchStaffData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create employee account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (staffId, currentStatus, staffName) => {
    try {
      await api.patch(`/users/staff/${staffId}/status`);
      const next = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      showToast(`Account for ${staffName} is now ${next}`);
      await fetchStaffData();
    } catch (err) {
      alert(err.message || 'Failed to update employee status');
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete employee '${staffName}'? They will no longer be able to log in.`)) {
      return;
    }
    try {
      await api.delete(`/users/staff/${staffId}`);
      showToast(`Employee account '${staffName}' deleted`);
      await fetchStaffData();
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Hospitality Employee Credentials:
Employee Name: ${createdCredentials.name}
Work Email: ${createdCredentials.email}
Initial Password: ${createdCredentials.password}
Assigned Role: ${createdCredentials.role}
Branch/Wing: ${createdCredentials.propertyName}
Login URL: ${createdCredentials.loginUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'RECEPTION':
        return (
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ConciergeBell size={12} /> Front Desk (Reception)
          </span>
        );
      case 'KITCHEN':
        return (
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ChefHat size={12} /> Kitchen (Chef / KDS)
          </span>
        );
      case 'HOUSEKEEPING':
        return (
          <span className="badge badge-free" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> Housekeeping
          </span>
        );
      case 'ACCOUNTS':
        return (
          <span className="badge" style={{ background: '#EDE9FE', color: '#6D28D9', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} /> Billing & Accounts
          </span>
        );
      default:
        return <span className="badge badge-gold">{r}</span>;
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.role?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term);

    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.role === roleFilter;
  });

  const receptionCount = staffList.filter((s) => s.role === 'RECEPTION').length;
  const kitchenCount = staffList.filter((s) => s.role === 'KITCHEN').length;
  const housekeepingCount = staffList.filter((s) => s.role === 'HOUSEKEEPING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      {/* Header Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-active)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              STAFF & ROLES GOVERNANCE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              DynamoDB Single-Table Encrypted
            </span>
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.9rem', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Hotel Employee Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
            Create and maintain verified employee profiles for your hotel property. All employee credentials are stored in DynamoDB tables and allow instant sign-in to the operational consoles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-gold"
          style={{ padding: '11px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <UserPlus size={16} />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid-kpi">
        <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Employees</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {staffList.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active on Property Roster
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Front Desk Staff</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ConciergeBell size={18} color="var(--gold-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--gold-dark)' }}>
            {receptionCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Reception Desk Operatives
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kitchen & Chefs</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={18} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#0284C7' }}>
            {kitchenCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            F&B Kitchen Operations
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Housekeeping</span>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="var(--success)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--success)' }}>
            {housekeepingCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Room Readiness & Cleaning
          </div>
        </div>
      </div>

      {/* Staff Roster Table & Card Feed */}
      <section className="glass-panel animate-fade-in" style={{ padding: '24px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        {/* Search & Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search employee by name, email, role, or phone..."
              className="input-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div className="touch-scroll-x" style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'RECEPTION', 'KITCHEN', 'HOUSEKEEPING', 'ACCOUNTS'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`btn ${roleFilter === r ? 'btn-gold' : 'btn-outline'}`}
                style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
              >
                {r === 'ALL' ? `All (${staffList.length})` : r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading employee accounts from DynamoDB...</div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
            <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No employee profiles found matching filters
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Create your hotel's first staff profile to enable reception desk and kitchen queues.
            </p>
            <button type="button" onClick={openCreateModal} className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Add Employee Profile
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Employee</th>
                  <th style={{ padding: '12px 14px' }}>Role / Department</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Branch</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Created Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff._id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--gold-soft)',
                            color: 'var(--gold-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: '1px solid var(--border-active)',
                          }}
                        >
                          {staff.name
                            ? staff.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'E'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{staff.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.email}</div>
                          {staff.phone && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>📞 {staff.phone}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {getRoleBadge(staff.role)}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {staff.propertyName || 'Main Wing'}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      {staff.status === 'ACTIVE' ? (
                        <span className="badge badge-free" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.72rem', padding: '3px 8px' }}>
                          SUSPENDED
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : '—'}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(staff._id, staff.status, staff.name)}
                          className="btn btn-outline"
                          style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                          title={staff.status === 'ACTIVE' ? 'Suspend Employee' : 'Activate Employee'}
                        >
                          <Power size={13} color={staff.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff._id, staff.name)}
                          className="btn btn-outline"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete Employee"
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE EMPLOYEE ACCOUNT                                 */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
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
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
                  <UserPlus size={22} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Create New Employee Profile
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Account will be provisioned in DynamoDB tables for instant sign-in.
                </div>
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
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#FEE2E2', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="input-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.reception@hotelgrand.com"
                  className="input-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Role / Department *
                  </label>
                  <select
                    className="input-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="RECEPTION">Front Desk (Reception)</option>
                    <option value="KITCHEN">Kitchen Staff (Chef)</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="ACCOUNTS">Accounts & Billing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9811223344"
                    className="input-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {properties.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Branch / Property Assignment
                  </label>
                  <select
                    className="input-control"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                  >
                    {properties.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <KeyRound size={12} /> Auto-Generate
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    className="input-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn btn-gold"
                  style={{ padding: '9px 20px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {createLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>Save to DynamoDB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATED CREDENTIALS VOUCHER                             */}
      {/* ------------------------------------------------------------- */}
      {createdCredentials && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreatedCredentials(null);
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
              position: 'relative',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--success-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--success)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                Employee Account Created!
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Credentials stored in <strong>DynamoDB tables</strong>. Share these details with the employee for sign-in.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Employee Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{createdCredentials.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Work Email:</span>
                <code style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>{createdCredentials.email}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Initial Password:</span>
                <code style={{ background: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {createdCredentials.password}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                {getRoleBadge(createdCredentials.role)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sign-In Portal:</span>
                <span style={{ color: 'var(--text-primary)' }}>/staff/login</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="btn btn-gold"
                style={{ flex: 1, padding: '11px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Login Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="btn btn-outline"
                style={{ padding: '11px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
