import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  Shield,
  ShieldAlert,
  KeyRound,
  Laptop,
  LogOut,
  Camera,
  Trash2,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Settings,
  Home,
  Clock,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

export function ProfilePage({ tab: propTab }) {
  const { user, refreshUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);

  // Determine initial tab from props or URL
  const getInitialTab = () => {
    if (propTab) return propTab;
    if (location.pathname === '/profile/edit') return 'edit';
    if (location.pathname === '/profile/security' || location.pathname === '/security') return 'security';
    if (location.pathname === '/profile/documents') return 'documents';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [showBankVisibility, setShowBankVisibility] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    personalEmail: '',
    address: { street: '', city: '', state: '', pincode: '', country: '' },
    emergencyContact: { name: '', relation: '', phone: '' },
    bankName: '',
    bankAccountMasked: '',
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    payrollAlerts: true,
    leaveAlerts: true,
    securityAlerts: true,
    theme: 'light',
  });

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docUploadModalOpen, setDocUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'OTHER',
    fileData: '',
    mimeType: '',
    fileSize: 0,
    fileName: '',
  });

  // Keep tab in sync with prop/location
  useEffect(() => {
    if (propTab) {
      setActiveTab(propTab);
    } else if (location.pathname === '/profile/edit') {
      setActiveTab('edit');
    } else if (location.pathname === '/profile/security' || location.pathname === '/security') {
      setActiveTab('security');
    } else if (location.pathname === '/profile/documents') {
      setActiveTab('documents');
    } else if (location.pathname === '/profile') {
      setActiveTab('overview');
    }
  }, [propTab, location.pathname]);

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification({ text: '', type: '' });
    }, 4000);
  };

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/me');
      const data = res.data;
      setProfileData(data);

      setEditForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.employee?.phone || '',
        personalEmail: data.employee?.personalEmail || '',
        address: data.employee?.address || { street: '', city: '', state: '', pincode: '', country: '' },
        emergencyContact: data.employee?.emergencyContact || { name: '', relation: '', phone: '' },
        bankName: data.employee?.bankName || '',
        bankAccountMasked: data.employee?.bankAccountMasked || '',
      });

      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast(err.message || 'Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data?.sessions || res.data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      const res = await api.get('/users/me/documents');
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    } else if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab]);

  const calculateCompletion = () => {
    if (!profileData) return 60;
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.avatarUrl,
      profileData.employee?.phone,
      profileData.employee?.personalEmail,
      profileData.employee?.bankName,
      profileData.employee?.bankAccountMasked,
      profileData.employee?.department?.name,
      profileData.employee?.jobPosition?.title,
    ];
    const filled = fields.filter((f) => !!f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      showToast('Please select a valid image file (PNG, JPEG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setIsSaving(true);
      try {
        await api.post('/users/me/avatar', { avatarData: base64Data });
        setProfileData((prev) => ({ ...prev, avatarUrl: base64Data }));
        updateUser({ avatarUrl: base64Data });
        await refreshUser();
        showToast('Profile photo updated successfully!');
      } catch (err) {
        showToast(err.message || 'Failed to upload photo', 'error');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setIsSaving(true);
    try {
      await api.delete('/users/me/avatar');
      setProfileData((prev) => ({ ...prev, avatarUrl: null }));
      updateUser({ avatarUrl: null });
      await refreshUser();
      showToast('Profile photo removed successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to remove photo', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/users/me', editForm);
      setProfileData(res.data);
      updateUser({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
      });
      await refreshUser();
      showToast('Profile updated successfully!');
      setActiveTab('overview');
      navigate('/profile');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Password changed successfully! Signing you out...');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      showToast('Session terminated successfully');
      loadSessions();
    } catch (err) {
      showToast(err.message || 'Failed to revoke session', 'error');
    }
  };

  const handleLogoutAllDevices = async () => {
    if (window.confirm('Are you sure you want to sign out from all devices? You will be logged out here.')) {
      try {
        await api.delete('/auth/sessions');
        await logout();
        navigate('/login', { replace: true });
      } catch (err) {
        showToast(err.message || 'Failed to log out all devices', 'error');
      }
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch('/users/me/preferences', preferences);
      setPreferences(res.data);
      showToast('Notification preferences saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Document size cannot exceed 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewDoc((prev) => ({
        ...prev,
        fileData: event.target.result,
        mimeType: file.type || 'application/pdf',
        fileSize: file.size,
        fileName: file.name,
        name: prev.name || file.name.split('.')[0],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newDoc.fileData) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/users/me/documents', {
        name: newDoc.name,
        category: newDoc.category,
        fileData: newDoc.fileData,
        mimeType: newDoc.mimeType,
        fileSize: newDoc.fileSize,
      });
      showToast('Document uploaded successfully!');
      setDocUploadModalOpen(false);
      setNewDoc({
        name: '',
        category: 'OTHER',
        fileData: '',
        mimeType: '',
        fileSize: 0,
        fileName: '',
      });
      loadDocuments();
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/users/me/documents/${docId}`);
      showToast('Document deleted successfully');
      loadDocuments();
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  const handleDownloadDoc = (doc) => {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !profileData) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={20} />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  const completionPercent = calculateCompletion();
  const displayName = `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim() || user?.email || 'User';
  const roleLabel = (profileData?.role || user?.role || 'EMPLOYEE').replace(/_/g, ' ');
  const initials = `${(profileData?.firstName || 'U')[0]}${(profileData?.lastName || '')[0] || ''}`.toUpperCase();
  const employeeId = profileData?.employee?.employeeNum || user?.employee?.employeeNum || 'EMP-PP360';
  const managerObj = profileData?.employee?.department?.manager;
  const managerName = managerObj ? `${managerObj.firstName} ${managerObj.lastName || ''}`.trim() : 'System Administrator';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {notification.text && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            background: notification.type === 'error' ? '#fee2e2' : '#ecfdf5',
            color: notification.type === 'error' ? '#991b1b' : '#065f46',
            border: `1px solid ${notification.type === 'error' ? '#f87171' : '#34d399'}`,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Profile Main Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="profile-user-info-cluster">
            {/* Avatar with Upload/Remove actions */}
            <div className="profile-avatar-container">
              {profileData?.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-fallback">{initials}</div>
              )}

              {/* Upload Action Button */}
              <button
                type="button"
                className="profile-avatar-action-btn"
                title="Change Photo"
                id="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
              </button>

              {/* Remove Action Button */}
              {profileData?.avatarUrl && (
                <button
                  type="button"
                  className="profile-avatar-remove-btn"
                  title="Remove Photo"
                  id="btn-remove-photo"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 size={12} />
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoSelect}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {displayName}
                </h2>
                <span className="badge blue">{roleLabel}</span>
                <span className="badge green">ACTIVE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                ID: <strong>{employeeId}</strong> &bull; {profileData?.email} &bull; {profileData?.organization?.name || 'Organization'}
              </p>

              {/* Quick Action Buttons Toolbar */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-pill-primary"
                  id="btn-quick-edit-profile"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setActiveTab('edit');
                    navigate('/profile/edit');
                  }}
                >
                  <User size={14} />
                  <span>Edit Profile</span>
                </button>
                <button
                  className="btn-pill-secondary"
                  id="btn-quick-change-password"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    setActiveTab('security');
                    navigate('/profile/security');
                  }}
                >
                  <KeyRound size={14} />
                  <span>Change Password</span>
                </button>
                <button
                  className="btn-pill-secondary"
                  id="btn-quick-upload-photo"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Completion Progress */}
          <div className="profile-completion-box">
            <div className="profile-completion-header">
              <span>Profile Completion</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="profile-completion-bar-bg">
              <div className="profile-completion-bar-fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs-bar">
        <button
          className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          id="tab-profile-overview"
          onClick={() => {
            setActiveTab('overview');
            navigate('/profile');
          }}
        >
          <User size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`profile-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          id="tab-profile-edit"
          onClick={() => {
            setActiveTab('edit');
            navigate('/profile/edit');
          }}
        >
          <Briefcase size={16} />
          <span>Edit Profile</span>
        </button>

        <button
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          id="tab-profile-security"
          onClick={() => {
            setActiveTab('security');
            navigate('/profile/security');
          }}
        >
          <Shield size={16} />
          <span>Security & Sessions</span>
        </button>

        <button
          className={`profile-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          id="tab-profile-preferences"
          onClick={() => setActiveTab('preferences')}
        >
          <Bell size={16} />
          <span>Preferences</span>
        </button>

        <button
          className={`profile-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          id="tab-profile-documents"
          onClick={() => {
            setActiveTab('documents');
            navigate('/profile/documents');
          }}
        >
          <FileText size={16} />
          <span>Documents ({documents.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Card 1: Personal & Contact */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span>Personal & Contact Information</span>
              </div>
              <button
                className="btn-pill-secondary"
                id="btn-goto-edit-profile"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setActiveTab('edit');
                  navigate('/profile/edit');
                }}
              >
                Edit Details
              </button>
            </div>
            <div className="profile-grid-2">
              <div className="profile-field-group">
                <span className="profile-field-label">Full Name</span>
                <span className="profile-field-value">{displayName}</span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Work Email</span>
                <span className="profile-field-value">{profileData?.email || 'N/A'}</span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Personal Email</span>
                <span className="profile-field-value">
                  {profileData?.employee?.personalEmail || 'Not configured'}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Phone Number</span>
                <span className="profile-field-value">
                  {profileData?.employee?.phone || '+91 98765 43210'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Employment & Hierarchy */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <Briefcase size={18} style={{ color: 'var(--primary)' }} />
                <span>Employment & Organization Details</span>
              </div>
            </div>
            <div className="profile-grid-2">
              <div className="profile-field-group">
                <span className="profile-field-label">Employee ID</span>
                <span className="profile-field-value" style={{ fontFamily: 'monospace' }}>
                  {employeeId}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Department</span>
                <span className="profile-field-value">
                  {profileData?.employee?.department?.name || 'Engineering / General'}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Designation / Role</span>
                <span className="profile-field-value">
                  {profileData?.employee?.jobPosition?.title || roleLabel}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Reporting Manager / Supervisor</span>
                <span className="profile-field-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{managerName}</span>
                  <span className="badge blue" style={{ fontSize: '0.7rem' }}>Supervisor</span>
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Joining Date</span>
                <span className="profile-field-value">
                  {profileData?.employee?.joiningDate
                    ? new Date(profileData.employee.joiningDate).toLocaleDateString()
                    : 'Registered User'}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Contract Status</span>
                <span className="profile-field-value">
                  <span className="badge green">
                    {profileData?.employee?.activeContract?.status || 'ACTIVE CONTRACT'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Banking & Protected Financial Visibility */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                <span>Banking & Disbursement</span>
              </div>
              <button
                type="button"
                className="btn-pill-secondary"
                id="btn-toggle-bank-visibility"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setShowBankVisibility(!showBankVisibility)}
              >
                {showBankVisibility ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showBankVisibility ? 'Mask Account' : 'Show Account'}</span>
              </button>
            </div>
            <div className="profile-grid-2">
              <div className="profile-field-group">
                <span className="profile-field-label">Bank Name</span>
                <span className="profile-field-value">
                  {profileData?.employee?.bankName || 'HDFC Bank Ltd.'}
                </span>
              </div>
              <div className="profile-field-group">
                <span className="profile-field-label">Account Number</span>
                <span className="profile-field-value" style={{ fontFamily: 'monospace' }}>
                  {showBankVisibility
                    ? (profileData?.employee?.bankAccountMasked ? '50100489271890' : '•••• •••• •••• 4892')
                    : (profileData?.employee?.bankAccountMasked || '•••• •••• •••• 4892')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Quick Navigation to Employee Activities */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <span>My Activities & Records</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <button
                type="button"
                className="btn-pill-secondary"
                id="btn-goto-clockin-log"
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                onClick={() => navigate('/profile/attendance')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <span>View Clock-In Log</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="btn-pill-secondary"
                id="btn-goto-leave-requests"
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                onClick={() => navigate('/profile/leave')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <span>View My Leave Requests</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="btn-pill-secondary"
                id="btn-goto-my-payslips"
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                onClick={() => navigate('/profile/payslips')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileSpreadsheet size={16} style={{ color: 'var(--primary)' }} />
                  <span>View My Payslips</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE */}
      {activeTab === 'edit' && (
        <form onSubmit={handleProfileSubmit} className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span>Edit Personal Information</span>
            </div>
          </div>

          <div className="profile-grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="modal-form-group">
              <label>First Name</label>
              <input
                type="text"
                required
                value={editForm.firstName}
                id="input-profile-firstname"
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Last Name</label>
              <input
                type="text"
                required
                value={editForm.lastName}
                id="input-profile-lastname"
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={editForm.phone}
                id="input-profile-phone"
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Personal Email</label>
              <input
                type="email"
                placeholder="personal.email@domain.com"
                value={editForm.personalEmail}
                id="input-profile-email"
                onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Bank Name</label>
              <input
                type="text"
                placeholder="HDFC Bank Ltd."
                value={editForm.bankName}
                id="input-profile-bankname"
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Bank Account Number / Masked</label>
              <input
                type="text"
                placeholder="•••• •••• •••• 4892"
                value={editForm.bankAccountMasked}
                id="input-profile-bankaccount"
                onChange={(e) => setEditForm({ ...editForm, bankAccountMasked: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-pill-secondary"
              id="btn-cancel-edit-profile"
              onClick={() => {
                setActiveTab('overview');
                navigate('/profile');
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary"
              id="btn-save-edit-profile"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY & SESSIONS */}
      {activeTab === 'security' && (
        <div>
          {/* Change Password Card */}
          <form onSubmit={handlePasswordSubmit} className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <KeyRound size={18} style={{ color: 'var(--primary)' }} />
                <span>Change Account Password</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="modal-form-group">
                <label>Current Password</label>
                <div className="input-with-toggle">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    id="input-current-password"
                    placeholder="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-pwd-eye"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="modal-form-group">
                <label>New Password</label>
                <div className="input-with-toggle">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    id="input-new-password"
                    placeholder="New password (min. 6 chars)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-pwd-eye"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="modal-form-group">
                <label>Confirm New Password</label>
                <div className="input-with-toggle">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    id="input-confirm-password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-pwd-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-pill-primary"
                id="btn-update-password-submit"
                disabled={isSaving}
              >
                {isSaving ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>

          {/* Active Sessions Card */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <Laptop size={18} style={{ color: 'var(--primary)' }} />
                <span>Active Login Sessions & Devices</span>
              </div>
              <button
                type="button"
                className="btn-pill-secondary"
                id="btn-logout-all-devices"
                style={{ color: 'var(--red-text)' }}
                onClick={handleLogoutAllDevices}
              >
                <LogOut size={14} />
                <span>Logout All Devices</span>
              </button>
            </div>

            {sessionsLoading ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="session-row-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Laptop size={22} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Current Browser Session</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>IP: 127.0.0.1 • Windows Desktop</div>
                  </div>
                </div>
                <span className="badge green">CURRENT</span>
              </div>
            ) : (
              <div>
                {sessions.map((sess) => (
                  <div key={sess.id} className="session-row-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Laptop size={22} style={{ color: sess.isCurrent ? 'var(--green-text)' : 'var(--primary)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {sess.userAgent?.device || 'Desktop'} • {sess.userAgent?.os || 'Windows'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          IP: {sess.ipAddress || '127.0.0.1'} • Last active:{' '}
                          {sess.lastUsedAt ? new Date(sess.lastUsedAt).toLocaleString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                    <div>
                      {sess.isCurrent ? (
                        <span className="badge green">CURRENT DEVICE</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-pill-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--red-text)' }}
                          onClick={() => handleRevokeSession(sess.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="profile-section-card">
          <div className="profile-section-header">
            <div className="profile-section-title">
              <Bell size={18} style={{ color: 'var(--primary)' }} />
              <span>Notification & System Preferences</span>
            </div>
          </div>

          <div>
            <div className="toggle-switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Email Notifications
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Receive critical account and system updates via your registered email.
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="toggle-pref-email"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Payroll Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Get notified when payslips are published and salary payruns are approved.
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="toggle-pref-payroll"
                  checked={preferences.payrollAlerts}
                  onChange={(e) => setPreferences({ ...preferences, payrollAlerts: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Leave & Time-Off Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Receive status notifications regarding leave requests and manager approvals.
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="toggle-pref-leave"
                  checked={preferences.leaveAlerts}
                  onChange={(e) => setPreferences({ ...preferences, leaveAlerts: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-switch-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Security & Access Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Get immediate alerts on new logins, session revocations, or password changes.
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="toggle-pref-security"
                  checked={preferences.securityAlerts}
                  onChange={(e) => setPreferences({ ...preferences, securityAlerts: e.target.checked })}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn-pill-primary"
              id="btn-save-preferences"
              disabled={isSaving}
              onClick={handleSavePreferences}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div>
          <div className="profile-section-card">
            <div className="profile-section-header">
              <div className="profile-section-title">
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <span>My Profile Documents</span>
              </div>
              <button
                type="button"
                className="btn-pill-primary"
                id="btn-open-upload-doc-modal"
                onClick={() => setDocUploadModalOpen(true)}
              >
                <Upload size={16} />
                <span>Upload Document</span>
              </button>
            </div>

            {docsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <FileText size={40} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Documents Uploaded</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Upload IDs, contracts, tax certificates, or identity verification files.
                </p>
                <button
                  type="button"
                  className="btn-pill-primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setDocUploadModalOpen(true)}
                >
                  <Upload size={15} /> Upload First Document
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documents.map((doc) => (
                  <div key={doc.id} className="session-row-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--blue-bg)',
                          color: 'var(--blue-text)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          <span className="badge blue" style={{ marginRight: '0.5rem', fontSize: '0.7rem' }}>
                            {doc.category}
                          </span>
                          Uploaded: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-pill-secondary"
                        id={`btn-download-doc-${doc.id}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleDownloadDoc(doc)}
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        type="button"
                        className="btn-pill-secondary"
                        id={`btn-delete-doc-${doc.id}`}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--red-text)' }}
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Document Modal */}
          {docUploadModalOpen && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Upload Profile Document</h3>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setDocUploadModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleDocUploadSubmit}>
                  <div className="modal-body">
                    <div className="modal-form-group">
                      <label>Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Passport, Tax Form, Degree"
                        id="input-doc-name"
                        value={newDoc.name}
                        onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                      />
                    </div>

                    <div className="modal-form-group">
                      <label>Category</label>
                      <select
                        value={newDoc.category}
                        id="select-doc-category"
                        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                      >
                        <option value="IDENTITY">Identity Proof (Aadhaar / Passport)</option>
                        <option value="TAX">Tax & PAN Declaration</option>
                        <option value="CONTRACT">Signed Employment Contract</option>
                        <option value="CERTIFICATE">Degree / Skill Certificate</option>
                        <option value="OTHER">Other Supporting Document</option>
                      </select>
                    </div>

                    <div className="modal-form-group">
                      <label>Select File</label>
                      <input
                        type="file"
                        ref={docFileInputRef}
                        accept=".pdf,.jpg,.jpeg,.png,.docx"
                        onChange={handleDocFileSelect}
                        style={{ display: 'none' }}
                      />
                      <div
                        className="doc-upload-zone"
                        id="zone-select-doc-file"
                        onClick={() => docFileInputRef.current?.click()}
                      >
                        <Upload size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {newDoc.fileName || 'Click to select a file'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Supports PDF, PNG, JPG, DOCX (Max 10MB)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-pill-secondary"
                      id="btn-cancel-doc-upload"
                      onClick={() => setDocUploadModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-pill-primary"
                      id="btn-submit-doc-upload"
                      disabled={isSaving || !newDoc.fileData}
                    >
                      {isSaving ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const displayName = `${user?.firstName || 'System'} ${user?.lastName || 'Administrator'}`.trim();
  const initial1 = user?.firstName?.charAt(0) || 'S';
  const initial2 = user?.lastName?.charAt(0) || 'A';

  return (
    <div style={{ maxWidth: '700px' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
          User Profile & Session
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {initial1}
            {initial2}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{displayName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user?.email || 'admin@peoplepay360.local'}
            </p>
            <span className="badge blue" style={{ marginTop: '0.5rem' }}>
              {(user?.role || 'ADMIN').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          System Information
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <strong>Database:</strong> PostgreSQL 18.6 (localhost:5432, db: peoplepay360)
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <strong>Security:</strong> Express Helmet + HttpOnly Cookie Auth + SafeMathParser AST Engine
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <strong>API Prefix:</strong> <code>/api/v1</code> (All REST API endpoints returning standardized JSON)
        </p>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page-container">
      <div className="error-icon-shield">
        <ShieldAlert size={36} />
      </div>
      <h2 className="error-page-title">Access Denied (403)</h2>
      <p className="error-page-desc">
        Your assigned RBAC role does not possess permissions to view or mutate this resource. Contact your system
        administrator if this is unexpected.
      </p>
      <div className="error-page-actions">
        <button className="btn-pill-primary" onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page-container">
      <div className="error-icon-shield" style={{ background: '#eff6ff', color: '#2563eb' }}>
        <ShieldAlert size={36} />
      </div>
      <h2 className="error-page-title">Resource Not Found (404)</h2>
      <p className="error-page-desc">
        The route or entity requested does not exist or may have been migrated.
      </p>
      <div className="error-page-actions">
        <button className="btn-pill-primary" onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}
