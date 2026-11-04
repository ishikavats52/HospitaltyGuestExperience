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
  Edit3,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const FALLBACK_DEPARTMENTS = [
  {
    code: 'BOOKING_DESK',
    name: 'Booking & Reservations Desk',
    description: 'Manual customer intake, phone/in-person reservations, date-wise room allotment, and stay folios',
    icon: 'CalendarCheck',
    subDepartments: [
      'Manual Reservation Desk Agent',
      'Walk-In Booking Specialist',
      'Date & Inventory Coordinator',
      'Corporate & Group Reservations',
    ],
  },
  {
    code: 'RECEPTION',
    name: 'Front Desk (Reception)',
    description: 'Guest check-in/out, concierge, reservations, night audit, and lobby relations',
    icon: 'ConciergeBell',
    subDepartments: [
      'Front Desk Receptionist',
      'Concierge & Guest Relations',
      'Night Auditor',
      'Bellhop & Valet Services',
      'Reservations & Bookings',
      'VIP Guest Host',
    ],
  },
  {
    code: 'HOUSEKEEPING',
    name: 'Housekeeping',
    description: 'Room cleaning, linen, floor supervision, and public area sanitation',
    icon: 'Sparkles',
    subDepartments: [
      'Room Cleaning & Turn Down',
      'Laundry & Linen Management',
      'Floor Supervisor',
      'Public Area Cleaning',
      'Deep Cleaning & Sanitization',
    ],
  },
  {
    code: 'KITCHEN',
    name: 'Kitchen Staff & F&B',
    description: 'Culinary preparation, Kitchen Display System (KDS), line cooking, and stewarding',
    icon: 'ChefHat',
    subDepartments: [
      'Executive / Head Chef',
      'Line Cook & Station Chef',
      'Pastry & Bakery Chef',
      'Kitchen Steward & Dishwashing',
      'In-Room Dining Runner',
    ],
  },
  {
    code: 'ACCOUNTS',
    name: 'Accounts & Billing',
    description: 'Folio settlement, invoice generation, revenue management, and audit verification',
    icon: 'DollarSign',
    subDepartments: [
      'Front Office Cashier',
      'Night Audit & Revenue Settlement',
      'Accounts Receivable & Ledger',
    ],
  },
  {
    code: 'MAINTENANCE',
    name: 'Maintenance & Engineering',
    description: 'HVAC systems, electricals, plumbing, equipment repair, and property upkeep',
    icon: 'Wrench',
    subDepartments: [
      'HVAC & Air Conditioning',
      'Electrical Systems',
      'Plumbing & Water Management',
      'Carpentry & Furnishing',
    ],
  },
];

export const StaffManager = () => {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
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

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('RECEPTION');
  const [editDept, setEditDept] = useState('');
  const [editSubDept, setEditSubDept] = useState('');
  const [editPropertyId, setEditPropertyId] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  // Background scroll lock when modal or voucher is active
  useEffect(() => {
    if (isCreateModalOpen || createdCredentials || isAddDeptModalOpen || editingStaff) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateModalOpen, createdCredentials, isAddDeptModalOpen, editingStaff]);

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
      const rawStaff = staffRes.data || [];
      const currentAdminId = String(currentUser?._id || currentUser?.id || '');
      // Strict Client-Side Filter: Hotel admin never sees their own admin profile in staff list
      const filteredStaff = rawStaff.filter((s) => {
        const sId = String(s._id || s.id);
        return sId !== currentAdminId && s.role !== 'HOTEL_ADMIN' && s.role !== 'SUPER_ADMIN';
      });
      setStaffList(filteredStaff);
      setProperties(propRes.data || []);
      const fetchedDepts = deptsRes.data || [];
      const mergedDepts = [...fetchedDepts];
      for (const def of FALLBACK_DEPARTMENTS) {
        if (!mergedDepts.some((d) => d.code === def.code)) {
          mergedDepts.push(def);
        }
      }
      setDepartments(mergedDepts);

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
    const defaultDept = departments.find((d) => d.code === 'BOOKING_DESK') || departments.find((d) => d.code === 'HOUSEKEEPING') || departments[0];
    const initialRole = defaultDept ? defaultDept.code : 'BOOKING_DESK';
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
      if (err.message && err.message.includes('GUEST')) {
        alert("Session Conflict: You are currently signed in as a Guest from a recent guest link test. Please re-authenticate with your Hotel Admin account at /staff/login.");
      } else {
        alert(err.message || 'Failed to create department');
      }
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
      if (err.message && err.message.includes('GUEST')) {
        setCreateError("Session Conflict: You are currently signed in as a Guest from a recent guest link test. Please re-authenticate with your Hotel Admin account at /staff/login.");
      } else {
        setCreateError(err.message || 'Failed to create employee account');
      }
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
    if (!window.confirm(`Are you sure you want to delete employee '${staffName}'? They will be permanently removed from the database and will no longer be able to log in.`)) {
      return;
    }
    try {
      await api.delete(`/users/staff/${staffId}`);
      showToast(`Employee account '${staffName}' permanently deleted from database`);
      await fetchStaffData();
    } catch (err) {
      alert(err.message || 'Failed to delete employee from database');
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setEditName(staff.name || '');
    setEditEmail(staff.email || '');
    setEditPhone(staff.phone || '');
    setEditRole(staff.role || 'RECEPTION');
    setEditDept(staff.department || staff.role || '');
    setEditSubDept(staff.subDepartment || '');
    setEditPropertyId(staff.propertyId?._id || staff.propertyId || (properties[0]?._id || ''));
    setEditStatus(staff.status || 'ACTIVE');
    setEditPassword('');
    setShowEditPassword(false);
    setEditError(null);
  };

  const handleSaveEditStaff = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editName.trim()) {
      setEditError('Employee full name is required.');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('Employee work email is required.');
      return;
    }

    setEditSaving(true);
    setEditError(null);

    try {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        role: editRole,
        department: editDept || editRole,
        subDepartment: editSubDept.trim(),
        propertyId: editPropertyId || null,
        status: editStatus,
      };

      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await api.patch(`/users/staff/${editingStaff._id}`, payload);
      showToast(`Employee profile '${editName.trim()}' updated in database!`);
      setEditingStaff(null);
      await fetchStaffData();
    } catch (err) {
      setEditError(err.message || 'Failed to update employee details.');
    } finally {
      setEditSaving(false);
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
      case 'BOOKING_DESK':
        return (
          <span className="badge" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {deptName || 'Booking & Reservations Desk'}
          </span>
        );
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 }} />
                <input
                  type="text"
                  placeholder="Search employee by name, email, department, sub-department, phone..."
                  className="input-control input-icon-left"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Smooth Horizontally Scrollable Department Filter Pills */}
              <div
                className="touch-scroll-x"
                style={{
                  display: 'flex',
                  gap: '8px',
                  width: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '6px',
                  scrollbarWidth: 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => setRoleFilter('ALL')}
                  className={`btn ${roleFilter === 'ALL' ? 'btn-gold' : 'btn-outline'}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    minWidth: 'max-content',
                    flexShrink: 0,
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  All Employees ({staffList.length})
                </button>
                {departments.map((dept) => {
                  const count = staffList.filter((s) => s.role === dept.code || s.department === dept.name).length;
                  return (
                    <button
                      key={dept.code}
                      type="button"
                      onClick={() => setRoleFilter(dept.code)}
                      className={`btn ${roleFilter === dept.code ? 'btn-gold' : 'btn-outline'}`}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        minWidth: 'max-content',
                        flexShrink: 0,
                        borderRadius: 'var(--radius-full)',
                      }}
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
              <>
                <div className="desktop-staff-table" style={{ overflowX: 'auto' }}>
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
                              onClick={() => openEditModal(staff)}
                              className="btn btn-outline"
                              style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Edit Employee Details"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
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
                              title="Delete Employee from Database"
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

              {/* Mobile View Cards */}
              <div className="mobile-staff-cards">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff._id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Top Row: Avatar + Name + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'var(--gold-soft)',
                            color: 'var(--gold-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            border: '1px solid var(--border-active)',
                            flexShrink: 0,
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
                          <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                            {staff.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {staff.email}
                          </div>
                        </div>
                      </div>

                      {staff.status === 'ACTIVE' ? (
                        <span className="badge badge-free" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.72rem', padding: '3px 8px' }}>
                          SUSPENDED
                        </span>
                      )}
                    </div>

                    {/* Middle Details Box */}
                    <div
                      style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '0.8rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {staff.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <span>📞</span>
                          <a href={`tel:${staff.phone}`} style={{ color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 600 }}>
                            {staff.phone}
                          </a>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Building2 size={13} color="var(--gold-primary)" />
                        <span>{staff.propertyName || 'Main Property / Wing'}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
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
                            }}
                          >
                            ↳ {staff.subDepartment}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(staff)}
                        className="btn btn-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600,
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff._id, staff.status, staff.name)}
                        className="btn btn-outline"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600,
                        }}
                      >
                        <Power size={13} color={staff.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                        <span>{staff.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(staff._id, staff.name)}
                        className="btn btn-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          color: 'var(--danger)',
                          borderColor: 'rgba(220, 38, 38, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
            className="modal-content has-modal-body"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '95%',
              maxWidth: '620px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
              height: '90vh',
              maxHeight: '92dvh',
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
                  padding: '18px 20px 24px',
                  flex: 1,
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-y',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {currentUser?.role === 'GUEST' && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#FFF5F5',
                      border: '1px solid #FEB2B2',
                      color: '#991B1B',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                      <AlertCircle size={16} />
                      <span>Guest Session Conflict</span>
                    </div>
                    <div>
                      An Express Guest stay was tested in this browser, giving you temporary Guest access. Creating employees requires Hotel Admin credentials.
                    </div>
                    <a
                      href="/staff/login"
                      className="btn btn-gold"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', alignSelf: 'flex-start', fontWeight: 700 }}
                    >
                      Sign In as Hotel Admin →
                    </a>
                  </div>
                )}

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
        <div className="modal-backdrop active" onClick={() => setIsAddDeptModalOpen(false)}>
          <div
            className="modal-content has-modal-body"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '96%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              height: '90vh',
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Pinned Sticky Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Create Hotel Department
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDeptModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form id="add-dept-form" onSubmit={handleCreateDepartmentStandalone} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Scrollable Body */}
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {deptModalError && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.82rem' }}>
                    {deptModalError}
                  </div>
                )}

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
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '9px 18px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-dept-form"
                  disabled={deptModalLoading}
                  className="btn btn-gold"
                  style={{ padding: '9px 22px', fontSize: '0.84rem', fontWeight: 700 }}
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT EMPLOYEE PROFILE                                  */}
      {/* ------------------------------------------------------------- */}
      {editingStaff && (
        <div className="modal-backdrop active" onClick={() => setEditingStaff(null)}>
          <div
            className="modal-content has-modal-body"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '96%',
              maxWidth: '580px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              height: '90vh',
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              className="modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Edit Employee Profile
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Update details for {editingStaff.name} in database
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEditStaff} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div
                className="modal-body"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {editError && (
                  <div
                    style={{
                      background: 'var(--danger-bg)',
                      border: '1px solid rgba(220, 38, 38, 0.25)',
                      color: 'var(--danger)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Users size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2 }} />
                    <input
                      type="text"
                      className="input-control input-icon-left"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      required
                      style={{ paddingLeft: '40px', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Work Email *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2 }} />
                    <input
                      type="email"
                      className="input-control input-icon-left"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. ramesh@hotel.com"
                      required
                      style={{ paddingLeft: '40px', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Phone / WhatsApp Number
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2 }} />
                    <input
                      type="tel"
                      className="input-control input-icon-left"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ paddingLeft: '40px', fontSize: '0.86rem' }}
                    />
                  </div>
                </div>

                {/* Department & Sub-Department Grid */}
                <div className="responsive-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Department *
                    </label>
                    <select
                      className="input-control"
                      value={editDept}
                      onChange={(e) => {
                        const newD = e.target.value;
                        setEditDept(newD);
                        const matched = departments.find((d) => d.name === newD || d.code === newD);
                        if (matched && matched.subDepartments?.length > 0) {
                          setEditSubDept(matched.subDepartments[0]);
                        }
                      }}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {departments.map((d) => (
                        <option key={d._id || d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Functionality / Sub-Department
                    </label>
                    <input
                      type="text"
                      className="input-control"
                      value={editSubDept}
                      onChange={(e) => setEditSubDept(e.target.value)}
                      placeholder="e.g. Front Desk, Room Attendant"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Role & Property Grid */}
                <div className="responsive-form-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Assigned Role *
                    </label>
                    <select
                      className="input-control"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="RECEPTION">Reception & Front Desk</option>
                      <option value="BOOKING_DESK">Booking & Reservations Staff (Manual Intake)</option>
                      <option value="HOUSEKEEPING">Housekeeping Operations</option>
                      <option value="KITCHEN">Kitchen & Dining / KDS</option>
                      <option value="ACCOUNTS">Finance & Accounts</option>
                      <option value="MAINTENANCE">Maintenance & Facilities</option>
                      <option value="CONCIERGE">Concierge & Guest Relations</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Assigned Property Wing
                    </label>
                    <select
                      className="input-control"
                      value={editPropertyId}
                      onChange={(e) => setEditPropertyId(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {properties.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.city || 'Main'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Account Status
                  </label>
                  <select
                    className="input-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="ACTIVE">ACTIVE (Authorized to log in)</option>
                    <option value="SUSPENDED">SUSPENDED (Access locked)</option>
                  </select>
                </div>

                {/* Reset Password Optional */}
                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Set New Password (Optional)
                  </label>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                    Leave blank to keep the employee's existing login password unchanged.
                  </p>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2 }} />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      className="input-control input-icon-both"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 chars)"
                      style={{ paddingLeft: '40px', paddingRight: '42px', fontSize: '0.86rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                    >
                      {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="modal-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="btn btn-outline"
                  style={{ padding: '9px 18px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="btn btn-gold"
                  style={{ padding: '9px 24px', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {editSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{editSaving ? 'Saving Changes...' : 'Save Changes in Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
