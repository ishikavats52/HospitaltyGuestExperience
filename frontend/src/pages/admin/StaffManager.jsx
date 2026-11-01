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
  Layers,
  Plus,
  Tag,
  Wrench,
  FolderPlus,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const StaffManager = () => {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' | 'DEPARTMENTS'

  // Create Staff Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HOUSEKEEPING');
  const [subDepartment, setSubDepartment] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Inline Custom Department & Sub-Department Creation Inside Create Employee Modal
  const [isAddingCustomDept, setIsAddingCustomDept] = useState(false);
  const [newCustomDeptName, setNewCustomDeptName] = useState('');
  const [newCustomDeptSubs, setNewCustomDeptSubs] = useState('');

  const [isAddingCustomSubDept, setIsAddingCustomSubDept] = useState(false);
  const [newCustomSubDeptName, setNewCustomSubDeptName] = useState('');

  // Standalone Add Department Modal
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptModalName, setDeptModalName] = useState('');
  const [deptModalDesc, setDeptModalDesc] = useState('');
  const [deptModalSubs, setDeptModalSubs] = useState('');
  const [deptModalLoading, setDeptModalLoading] = useState(false);
  const [deptModalError, setDeptModalError] = useState(null);

  // Inline Sub-department quick add in Departments Tab
  const [activeDeptAddSub, setActiveDeptAddSub] = useState(null);
  const [quickSubText, setQuickSubText] = useState('');

  // Created Credentials Voucher Modal
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  // Background scroll lock when modal or voucher is active
  useEffect(() => {
    if (isCreateModalOpen || createdCredentials || isAddDeptModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateModalOpen, createdCredentials, isAddDeptModalOpen]);

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
      const [staffRes, propRes, deptsRes] = await Promise.all([
        api.get('/users/staff'),
        api.get('/properties').catch(() => ({ data: [] })),
        api.get('/users/departments').catch(() => ({ data: [] })),
      ]);
      setStaffList(staffRes.data || []);
      setProperties(propRes.data || []);
      const fetchedDepts = deptsRes.data || [];
      setDepartments(fetchedDepts);

      if (propRes.data?.length > 0 && !propertyId) {
        setPropertyId(propRes.data[0]._id);
      }
    } catch (err) {
      console.warn('Failed to fetch staff data:', err);
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
    setPassword('');
    const defaultDept = departments.find((d) => d.code === 'HOUSEKEEPING') || departments[0];
    const initialRole = defaultDept ? defaultDept.code : 'HOUSEKEEPING';
    setRole(initialRole);
    if (defaultDept && defaultDept.subDepartments?.length > 0) {
      setSubDepartment(defaultDept.subDepartments[0]);
    } else {
      setSubDepartment('');
    }
    setIsAddingCustomDept(false);
    setNewCustomDeptName('');
    setNewCustomDeptSubs('');
    setIsAddingCustomSubDept(false);
    setNewCustomSubDeptName('');
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleRoleChange = (newCode) => {
    setRole(newCode);
    const targetDept = departments.find((d) => d.code === newCode);
    if (targetDept && targetDept.subDepartments?.length > 0) {
      setSubDepartment(targetDept.subDepartments[0]);
    } else {
      setSubDepartment('');
    }
  };

  // Add a sub-department inline inside Create Employee Modal
  const handleAddInlineSubDept = async () => {
    if (!newCustomSubDeptName.trim()) return;
    const subName = newCustomSubDeptName.trim();
    const currentDept = departments.find((d) => d.code === role);
    if (!currentDept) return;

    try {
      await api.post(`/users/departments/${currentDept._id || currentDept.code}/subdepartments`, {
        subDepartment: subName,
      });

      setDepartments((prev) =>
        prev.map((d) => {
          if (d.code === role || d._id === currentDept._id) {
            const subs = d.subDepartments || [];
            return {
              ...d,
              subDepartments: subs.includes(subName) ? subs : [...subs, subName],
            };
          }
          return d;
        })
      );

      setSubDepartment(subName);
      setNewCustomSubDeptName('');
      setIsAddingCustomSubDept(false);
      showToast(`Sub-department '${subName}' added to ${currentDept.name}!`);
    } catch (err) {
      alert(err.message || 'Failed to add sub-department');
    }
  };

  // Create a new Department inline inside Create Employee Modal
  const handleCreateCustomDeptInline = async () => {
    if (!newCustomDeptName.trim()) return;
    const cleanName = newCustomDeptName.trim();
    const cleanCode = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const initialSubs = newCustomDeptSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/users/departments', {
        name: cleanName,
        code: cleanCode,
        description: `Operational department for ${cleanName}`,
        subDepartments: initialSubs.length > 0 ? initialSubs : ['General Operations'],
      });

      const created = res.data;
      setDepartments((prev) => [...prev, created]);
      setRole(created.code);
      if (created.subDepartments?.length > 0) {
        setSubDepartment(created.subDepartments[0]);
      }
      setNewCustomDeptName('');
      setNewCustomDeptSubs('');
      setIsAddingCustomDept(false);
      showToast(`Department '${created.name}' created!`);
    } catch (err) {
      alert(err.message || 'Failed to create department');
    }
  };

  // Create Standalone Department Modal Handler
  const handleCreateDepartmentStandalone = async (e) => {
    e.preventDefault();
    if (!deptModalName.trim()) {
      setDeptModalError('Department name is required.');
      return;
    }

    setDeptModalLoading(true);
    setDeptModalError(null);

    const cleanName = deptModalName.trim();
    const cleanCode = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const initialSubs = deptModalSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/users/departments', {
        name: cleanName,
        code: cleanCode,
        description: deptModalDesc.trim() || `Department of ${cleanName}`,
        subDepartments: initialSubs.length > 0 ? initialSubs : ['General Operations'],
      });

      const created = res.data;
      setDepartments((prev) => [...prev, created]);
      setIsAddDeptModalOpen(false);
      setDeptModalName('');
      setDeptModalDesc('');
      setDeptModalSubs('');
      showToast(`Department '${created.name}' registered with ${created.subDepartments?.length || 0} sub-roles!`);
    } catch (err) {
      setDeptModalError(err.message || 'Failed to create department');
    } finally {
      setDeptModalLoading(false);
    }
  };

  // Add Sub-department from Departments Tab
  const handleQuickAddSubDept = async (deptIdOrCode) => {
    if (!quickSubText.trim()) return;
    const subName = quickSubText.trim();

    try {
      await api.post(`/users/departments/${deptIdOrCode}/subdepartments`, {
        subDepartment: subName,
      });

      setDepartments((prev) =>
        prev.map((d) => {
          if (d.code === deptIdOrCode || d._id === deptIdOrCode) {
            const subs = d.subDepartments || [];
            return {
              ...d,
              subDepartments: subs.includes(subName) ? subs : [...subs, subName],
            };
          }
          return d;
        })
      );

      setQuickSubText('');
      setActiveDeptAddSub(null);
      showToast(`Sub-department '${subName}' added!`);
    } catch (err) {
      alert(err.message || 'Failed to add sub-department');
    }
  };

  // Delete Sub-department from Departments Tab
  const handleDeleteSubDept = async (deptIdOrCode, subName) => {
    if (!window.confirm(`Remove sub-department '${subName}'?`)) return;

    try {
      await api.delete(`/users/departments/${deptIdOrCode}/subdepartments/${encodeURIComponent(subName)}`);

      setDepartments((prev) =>
        prev.map((d) => {
          if (d.code === deptIdOrCode || d._id === deptIdOrCode) {
            return {
              ...d,
              subDepartments: (d.subDepartments || []).filter((s) => s !== subName),
            };
          }
          return d;
        })
      );

      showToast(`Sub-department '${subName}' removed`);
    } catch (err) {
      alert(err.message || 'Failed to remove sub-department');
    }
  };

  // Delete Custom Department
  const handleDeleteDepartment = async (deptId, deptName) => {
    if (!window.confirm(`Delete custom department '${deptName}'?`)) return;

    try {
      await api.delete(`/users/departments/${deptId}`);
      setDepartments((prev) => prev.filter((d) => d._id !== deptId));
      showToast(`Department '${deptName}' deleted`);
    } catch (err) {
      alert(err.message || 'Failed to delete department');
    }
  };

  // Create Staff Member
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setCreateError('Please fill in employee name, work email, and password.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const currentDept = departments.find((d) => d.code === role);
      await api.post('/users/staff', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: role,
        department: currentDept ? currentDept.name : role,
        subDepartment: subDepartment || undefined,
        propertyId: propertyId || undefined,
        phone: phone.trim() || undefined,
      });

      const selectedProp = properties.find((p) => String(p._id) === String(propertyId));

      setCreatedCredentials({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: role,
        department: currentDept ? currentDept.name : role,
        subDepartment: subDepartment || 'General Duties',
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
Department: ${createdCredentials.department}
Sub-Department / Functionality: ${createdCredentials.subDepartment}
Role Code: ${createdCredentials.role}
Branch/Wing: ${createdCredentials.propertyName}
Login URL: ${createdCredentials.loginUrl}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRoleBadge = (r, deptName) => {
    switch (r) {
      case 'RECEPTION':
        return (
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ConciergeBell size={12} /> {deptName || 'Front Desk (Reception)'}
          </span>
        );
      case 'KITCHEN':
        return (
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ChefHat size={12} /> {deptName || 'Kitchen Staff (Chef)'}
          </span>
        );
      case 'HOUSEKEEPING':
        return (
          <span className="badge badge-free" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> {deptName || 'Housekeeping'}
          </span>
        );
      case 'ACCOUNTS':
        return (
          <span className="badge" style={{ background: '#EDE9FE', color: '#6D28D9', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <DollarSign size={12} /> {deptName || 'Billing & Accounts'}
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={12} /> {deptName || 'Maintenance & Engineering'}
          </span>
        );
      case 'SECURITY':
        return (
          <span className="badge" style={{ background: '#E2E8F0', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} /> {deptName || 'Security & Safety'}
          </span>
        );
      default:
        return (
          <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} /> {deptName || r}
          </span>
        );
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.role?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term) ||
      s.subDepartment?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term);

    if (roleFilter === 'ALL') return matchesSearch;
    return matchesSearch && (s.role === roleFilter || s.department === roleFilter);
  });

  const currentSelectedDept = departments.find((d) => d.code === role);

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
              DynamoDB Multifunctionality Engine
            </span>
          </div>
          <h1 className="title-gold" style={{ fontSize: '1.9rem', margin: '4px 0 6px 0', color: 'var(--text-primary)' }}>
            Hotel Employee & Roles Governance
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
            Configure custom departments, add sub-department specializations, and provision verified employee accounts across all hotel wings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsAddDeptModalOpen(true)}
            className="btn btn-outline"
            style={{ padding: '10px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <FolderPlus size={16} />
            <span>+ Add Department</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-gold"
            style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
          >
            <UserPlus size={16} />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Staff Roster vs. Departments & Multifunctionality Matrix */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ROSTER')}
          className={`btn ${activeTab === 'ROSTER' ? 'btn-gold' : 'btn-outline'}`}
          style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-full)' }}
        >
          <Users size={16} />
          <span>Staff Roster ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`btn ${activeTab === 'DEPARTMENTS' ? 'btn-gold' : 'btn-outline'}`}
          style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-full)' }}
        >
          <Layers size={16} />
          <span>Departments & Multifunctionality Matrix ({departments.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: STAFF ROSTER VIEW                                       */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ROSTER' && (
        <>
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
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Housekeeping</span>
                <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="var(--success)" />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--success)' }}>
                {staffList.filter((s) => s.role === 'HOUSEKEEPING' || s.department === 'Housekeeping').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Cleaning & Amenities Team
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
                {staffList.filter((s) => s.role === 'RECEPTION' || s.department === 'Front Desk (Reception)').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Reception & Concierge
              </div>
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Departments</span>
                <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} color="#0284C7" />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#0284C7' }}>
                {departments.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Operational Functions
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
                  placeholder="Search employee by name, email, department, sub-department, phone..."
                  className="input-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
                />
              </div>

              <div className="touch-scroll-x" style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setRoleFilter('ALL')}
                  className={`btn ${roleFilter === 'ALL' ? 'btn-gold' : 'btn-outline'}`}
                  style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                >
                  All ({staffList.length})
                </button>
                {departments.map((dept) => {
                  const count = staffList.filter((s) => s.role === dept.code || s.department === dept.name).length;
                  return (
                    <button
                      key={dept.code}
                      type="button"
                      onClick={() => setRoleFilter(dept.code)}
                      className={`btn ${roleFilter === dept.code ? 'btn-gold' : 'btn-outline'}`}
                      style={{ padding: '7px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                    >
                      {dept.name} ({count})
                    </button>
                  );
                })}
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
                  Create an employee profile and assign their specific department & sub-department duties.
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
                      <th style={{ padding: '12px 14px' }}>Department & Sub-Department</th>
                      <th style={{ padding: '12px 14px' }}>Assigned Wing / Property</th>
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            {getRoleBadge(staff.role, staff.department)}
                            {staff.subDepartment && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--gold-dark)',
                                  fontWeight: 600,
                                  background: 'var(--gold-soft)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid var(--border-active)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                }}
                              >
                                <span>↳ {staff.subDepartment}</span>
                              </span>
                            )}
                          </div>
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
                              style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
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
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DEPARTMENTS & MULTIFUNCTIONALITY MATRIX                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'DEPARTMENTS' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Hotel Department Structure & Sub-Department Specializations
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Add and configure departments, or tailor sub-department functionalities (e.g. within Housekeeping: Room Cleaning, Laundry & Linen, Deep Cleaning, Floor Supervisor).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddDeptModalOpen(true)}
              className="btn btn-gold"
              style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              <span>Create New Department</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {departments.map((dept) => {
              const assignedCount = staffList.filter((s) => s.role === dept.code || s.department === dept.name).length;
              const isAddingSub = activeDeptAddSub === dept.code || activeDeptAddSub === dept._id;

              return (
                <div
                  key={dept.code || dept._id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {dept.name}
                        </span>
                        {dept.isSystem ? (
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Core</span>
                        ) : (
                          <span className="badge badge-free" style={{ fontSize: '0.65rem' }}>Custom</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--gold-dark)', fontWeight: 700, marginTop: '2px' }}>
                        Code: {dept.code}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, background: 'var(--gold-soft)', color: 'var(--gold-dark)', padding: '3px 9px', borderRadius: 'var(--radius-full)' }}>
                        {assignedCount} Staff
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, minHeight: '34px', lineHeight: 1.4 }}>
                    {dept.description || `Operational duties and tasks under ${dept.name}`}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Sub-Departments / Functionalities ({dept.subDepartments?.length || 0}):
                      </span>
                      {!isAddingSub && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDeptAddSub(dept.code || dept._id);
                            setQuickSubText('');
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Plus size={12} /> Add Subcategory
                        </button>
                      )}
                    </div>

                    {/* Sub-departments chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: isAddingSub ? '10px' : '0' }}>
                      {(dept.subDepartments || []).map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubDept(dept._id || dept.code, sub)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                            title="Remove subcategory"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Subcategory Input */}
                    {isAddingSub && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. VIP Room Care, Linen Master..."
                          value={quickSubText}
                          onChange={(e) => setQuickSubText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuickAddSubDept(dept._id || dept.code);
                            }
                          }}
                          style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAddSubDept(dept._id || dept.code)}
                          className="btn btn-gold"
                          style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDeptAddSub(null)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!dept.isSystem && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(dept._id, dept.name)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete Department
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE EMPLOYEE PROFILE (FIXED HEADER & STICKY FOOTER)   */}
      {/* ------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '95%',
              maxWidth: '620px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Fixed Modal Header */}
            <div
              className="modal-header"
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                background: '#FFFFFF',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
                  <UserPlus size={20} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Create New Employee Profile
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Assign role, department, and sub-department functionality for instant DynamoDB sign-in.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div
                className="modal-body"
                style={{
                  padding: '22px 24px',
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {createError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--danger-bg)',
                      border: '1px solid rgba(217, 4, 41, 0.3)',
                      color: 'var(--danger)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{createError}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter employee full name (e.g. Rajesh Kumar)..."
                    className="input-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="responsive-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajesh@hotelgroup.com"
                      className="input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      className="input-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role / Department & Sub-Department Section */}
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Department Selector */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Role / Department *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomDept(!isAddingCustomDept)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} /> {isAddingCustomDept ? 'Close' : '+ Add New Department'}
                      </button>
                    </div>

                    <select
                      className="input-control"
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                    >
                      {departments.map((dept) => (
                        <option key={dept.code} value={dept.code}>
                          {dept.name} ({dept.subDepartments?.length || 0} sub-roles)
                        </option>
                      ))}
                    </select>

                    {/* Inline Create Department Box */}
                    {isAddingCustomDept && (
                      <div style={{ marginTop: '10px', padding: '12px', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-active)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '6px' }}>
                          Quick Create Department:
                        </div>
                        <input
                          type="text"
                          placeholder="Department Name (e.g. Security, Banquets, Spa)"
                          className="input-control"
                          value={newCustomDeptName}
                          onChange={(e) => setNewCustomDeptName(e.target.value)}
                          style={{ marginBottom: '8px', fontSize: '0.8rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Initial Sub-departments (comma separated, e.g. Gate Security, CCTV)"
                          className="input-control"
                          value={newCustomDeptSubs}
                          onChange={(e) => setNewCustomDeptSubs(e.target.value)}
                          style={{ marginBottom: '8px', fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomDeptInline}
                          className="btn btn-gold"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        >
                          Save Department
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sub-Department / Category Selector */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Sub-Department / Functionality *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomSubDept(!isAddingCustomSubDept)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} /> {isAddingCustomSubDept ? 'Close' : '+ Add Sub-Department'}
                      </button>
                    </div>

                    <select
                      className="input-control"
                      value={subDepartment}
                      onChange={(e) => setSubDepartment(e.target.value)}
                    >
                      {currentSelectedDept?.subDepartments && currentSelectedDept.subDepartments.length > 0 ? (
                        currentSelectedDept.subDepartments.map((sub, sIdx) => (
                          <option key={sIdx} value={sub}>
                            {sub}
                          </option>
                        ))
                      ) : (
                        <option value="General Duties">General Duties</option>
                      )}
                    </select>

                    {/* Inline Create Sub-Department Box */}
                    {isAddingCustomSubDept && (
                      <div style={{ marginTop: '10px', padding: '12px', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-active)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '6px' }}>
                          Add Sub-Department under {currentSelectedDept?.name || role}:
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="e.g. VIP Room Cleaner, Laundry Runner..."
                            className="input-control"
                            value={newCustomSubDeptName}
                            onChange={(e) => setNewCustomSubDeptName(e.target.value)}
                            style={{ flex: 1, fontSize: '0.8rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleAddInlineSubDept}
                            className="btn btn-gold"
                            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Assignment Badge */}
                  <div style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>Assigned Position:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {currentSelectedDept?.name || role}
                    </span>
                    <span>→</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {subDepartment || 'General Operative'}
                    </span>
                  </div>
                </div>

                {properties.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Branch / Wing Assignment
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
              </div>

              {/* Sticky Footer: Always visible at bottom */}
              <div
                className="modal-footer"
                style={{
                  padding: '16px 24px',
                  background: '#FFFFFF',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 20,
                  boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{name || 'New Profile'}</span>
                  <span> • {currentSelectedDept?.name || role}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
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
                    style={{ padding: '9px 20px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {createLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    <span>Save to DynamoDB</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD STANDALONE DEPARTMENT                               */}
      {/* ------------------------------------------------------------- */}
      {isAddDeptModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddDeptModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '94%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Create Hotel Department
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDeptModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {deptModalError && (
              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px' }}>
                {deptModalError}
              </div>
            )}

            <form onSubmit={handleCreateDepartmentStandalone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concierge & Guest Relations, Security, Banquets"
                  className="input-control"
                  value={deptModalName}
                  onChange={(e) => setDeptModalName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Description / Operational Scope
                </label>
                <textarea
                  placeholder="Describe duties, oversight, and responsibilities..."
                  className="input-control"
                  rows={2}
                  value={deptModalDesc}
                  onChange={(e) => setDeptModalDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Sub-Departments / Functionalities (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gate Security, CCTV Surveillance, Night Patrol"
                  className="input-control"
                  value={deptModalSubs}
                  onChange={(e) => setDeptModalSubs(e.target.value)}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Separate specializations with commas. You can also add more later.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptModalLoading}
                  className="btn btn-gold"
                  style={{ padding: '8px 20px', fontSize: '0.84rem', fontWeight: 700 }}
                >
                  {deptModalLoading ? 'Creating...' : 'Create Department'}
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
          className="modal-backdrop"
          onClick={() => setCreatedCredentials(null)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content glass-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '95%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              padding: '28px',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              Employee Profile Provisioned!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Account has been committed to DynamoDB. Share these credentials with the employee.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', marginBottom: '20px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Name: </span>
                <span style={{ fontWeight: 700 }}>{createdCredentials.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Work Email: </span>
                <span style={{ fontWeight: 700 }}>{createdCredentials.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Password: </span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--gold-dark)', background: 'var(--gold-soft)', padding: '2px 8px', borderRadius: '4px' }}>
                  {createdCredentials.password}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department: </span>
                <span style={{ fontWeight: 700 }}>{createdCredentials.department}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sub-Department: </span>
                <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{createdCredentials.subDepartment}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Branch: </span>
                <span style={{ fontWeight: 700 }}>{createdCredentials.propertyName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Portal Login: </span>
                <span style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>{createdCredentials.loginUrl}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="btn btn-gold"
                style={{ padding: '9px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="btn btn-outline"
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
