import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Camera,
  Edit3,
  Save,
  X,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  Shield,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import employeeService from '../services/employeeService';

/**
 * Profile Page — Shared between Employee (self) and Admin (viewing any employee)
 * - Tabs: Personal, Job, Salary, Documents
 * - Employee editable: phone, address, profile picture
 * - Admin editable: ALL fields
 */
const Profile = () => {
  const { id } = useParams(); // If viewing another employee (admin)
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Determine if viewing own profile or another employee's
  const isOwnProfile = !id || id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';
  const canEditAll = isAdmin && !isOwnProfile; // Admin editing another employee
  const canEditLimited = isOwnProfile; // Employee editing self (limited fields)

  // Tab configuration
  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'job', label: 'Job Details', icon: Briefcase },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let data;
        if (isOwnProfile) {
          data = await employeeService.getMyProfile();
        } else {
          data = await employeeService.getById(id);
        }
        setProfile(data.data);
        setEditData(data.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
        if (error.response?.status === 403 || error.response?.status === 404) {
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile, navigate]);

  // Start editing
  const handleEdit = () => {
    setEditData({ ...profile });
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditData({ ...profile });
    setIsEditing(false);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const targetId = isOwnProfile ? currentUser.id : id;

      // Build update payload based on role
      let updatePayload = {};
      if (isAdmin) {
        // Admin can update all fields
        updatePayload = {
          fullName: editData.fullName,
          phone: editData.phone,
          dateOfBirth: editData.dateOfBirth,
          gender: editData.gender,
          address: editData.address,
          emergencyContact: editData.emergencyContact,
          department: editData.department,
          designation: editData.designation,
          dateOfJoining: editData.dateOfJoining,
          employmentType: editData.employmentType,
          reportingManager: editData.reportingManager,
          workLocation: editData.workLocation,
          salary: editData.salary,
          profilePicture: editData.profilePicture,
        };
      } else {
        // Employee can only edit phone, address, profilePicture, emergencyContact
        updatePayload = {
          phone: editData.phone,
          address: editData.address,
          profilePicture: editData.profilePicture,
          emergencyContact: editData.emergencyContact,
        };
      }

      const result = await employeeService.update(targetId, updatePayload);
      setProfile(result.data);
      setEditData(result.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Update nested field helper
  const updateField = (path, value) => {
    setEditData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // Check if a field is editable
  const isFieldEditable = (fieldGroup) => {
    if (!isEditing) return false;
    if (isAdmin) return true; // Admin can edit all
    // Employee can only edit these groups
    const employeeEditable = ['phone', 'address', 'profilePicture', 'emergencyContact'];
    return employeeEditable.includes(fieldGroup);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Profile not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back button (for admin viewing employee) */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
      )}

      {/* Profile Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <Avatar
              src={isEditing ? editData.profilePicture : profile.profilePicture}
              name={profile.fullName}
              size="xl"
            />
            {isEditing && (isAdmin || isOwnProfile) && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="text"
                  className="hidden"
                  placeholder="Image URL"
                />
              </label>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h1>
              <Badge variant={profile.role === 'admin' ? 'info' : 'neutral'}>
                {profile.role === 'admin' ? 'Admin' : 'Employee'}
              </Badge>
              <Badge variant={profile.isActive ? 'success' : 'danger'}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs">
                ID: {profile.employeeId}
              </span>
              {profile.department && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {profile.department}
                </span>
              )}
            </div>
            {profile.designation && (
              <p className="text-sm text-gray-600 mt-1 font-medium">{profile.designation}</p>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex gap-2 self-start">
            {!isEditing ? (
              (canEditAll || canEditLimited) && (
                <Button variant="secondary" size="sm" icon={Edit3} onClick={handleEdit}>
                  Edit Profile
                </Button>
              )
            ) : (
              <>
                <Button variant="ghost" size="sm" icon={X} onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" icon={Save} isLoading={saving} onClick={handleSave}>
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Edit restriction notice for employees */}
        {isEditing && !isAdmin && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            You can only edit your phone number, address, emergency contact, and profile picture. Contact HR for other changes.
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ========== PERSONAL TAB ========== */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <ProfileField
                  label="Full Name"
                  value={profile.fullName}
                  editValue={editData.fullName}
                  editable={isFieldEditable('fullName')}
                  onChange={(v) => updateField('fullName', v)}
                />
                <ProfileField
                  label="Email"
                  value={profile.email}
                  editable={false}
                  hint="Email cannot be changed"
                />
                <ProfileField
                  label="Phone"
                  value={profile.phone}
                  editValue={editData.phone}
                  editable={isFieldEditable('phone')}
                  onChange={(v) => updateField('phone', v)}
                  placeholder="+1 (555) 000-0000"
                />
                <ProfileField
                  label="Date of Birth"
                  value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''}
                  editValue={editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : ''}
                  editable={isFieldEditable('dateOfBirth')}
                  onChange={(v) => updateField('dateOfBirth', v)}
                  type="date"
                />
                <ProfileField
                  label="Gender"
                  value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}
                  editValue={editData.gender}
                  editable={isFieldEditable('gender')}
                  onChange={(v) => updateField('gender', v)}
                  type="select"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </Card>

            {/* Address */}
            <Card>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Address</h3>
              <div className="space-y-4">
                <ProfileField
                  label="Street"
                  value={profile.address?.street}
                  editValue={editData.address?.street}
                  editable={isFieldEditable('address')}
                  onChange={(v) => updateField('address.street', v)}
                  placeholder="123 Main St"
                />
                <ProfileField
                  label="City"
                  value={profile.address?.city}
                  editValue={editData.address?.city}
                  editable={isFieldEditable('address')}
                  onChange={(v) => updateField('address.city', v)}
                  placeholder="New York"
                />
                <ProfileField
                  label="State"
                  value={profile.address?.state}
                  editValue={editData.address?.state}
                  editable={isFieldEditable('address')}
                  onChange={(v) => updateField('address.state', v)}
                  placeholder="NY"
                />
                <ProfileField
                  label="Zip Code"
                  value={profile.address?.zipCode}
                  editValue={editData.address?.zipCode}
                  editable={isFieldEditable('address')}
                  onChange={(v) => updateField('address.zipCode', v)}
                  placeholder="10001"
                />
                <ProfileField
                  label="Country"
                  value={profile.address?.country}
                  editValue={editData.address?.country}
                  editable={isFieldEditable('address')}
                  onChange={(v) => updateField('address.country', v)}
                  placeholder="United States"
                />
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card className="lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ProfileField
                  label="Name"
                  value={profile.emergencyContact?.name}
                  editValue={editData.emergencyContact?.name}
                  editable={isFieldEditable('emergencyContact')}
                  onChange={(v) => updateField('emergencyContact.name', v)}
                  placeholder="Jane Doe"
                />
                <ProfileField
                  label="Relationship"
                  value={profile.emergencyContact?.relationship}
                  editValue={editData.emergencyContact?.relationship}
                  editable={isFieldEditable('emergencyContact')}
                  onChange={(v) => updateField('emergencyContact.relationship', v)}
                  placeholder="Spouse"
                />
                <ProfileField
                  label="Phone"
                  value={profile.emergencyContact?.phone}
                  editValue={editData.emergencyContact?.phone}
                  editable={isFieldEditable('emergencyContact')}
                  onChange={(v) => updateField('emergencyContact.phone', v)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </Card>
          </div>
        )}

        {/* ========== JOB DETAILS TAB ========== */}
        {activeTab === 'job' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Position</h3>
              <div className="space-y-4">
                <ProfileField
                  label="Department"
                  value={profile.department}
                  editValue={editData.department}
                  editable={isFieldEditable('department')}
                  onChange={(v) => updateField('department', v)}
                  placeholder="Engineering"
                />
                <ProfileField
                  label="Designation"
                  value={profile.designation}
                  editValue={editData.designation}
                  editable={isFieldEditable('designation')}
                  onChange={(v) => updateField('designation', v)}
                  placeholder="Software Engineer"
                />
                <ProfileField
                  label="Employment Type"
                  value={profile.employmentType ? profile.employmentType.charAt(0).toUpperCase() + profile.employmentType.slice(1) : ''}
                  editValue={editData.employmentType}
                  editable={isFieldEditable('employmentType')}
                  onChange={(v) => updateField('employmentType', v)}
                  type="select"
                  options={[
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'intern', label: 'Intern' },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Work Details</h3>
              <div className="space-y-4">
                <ProfileField
                  label="Date of Joining"
                  value={profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : ''}
                  editValue={editData.dateOfJoining ? new Date(editData.dateOfJoining).toISOString().split('T')[0] : ''}
                  editable={isFieldEditable('dateOfJoining')}
                  onChange={(v) => updateField('dateOfJoining', v)}
                  type="date"
                />
                <ProfileField
                  label="Reporting Manager"
                  value={profile.reportingManager}
                  editValue={editData.reportingManager}
                  editable={isFieldEditable('reportingManager')}
                  onChange={(v) => updateField('reportingManager', v)}
                  placeholder="Manager name"
                />
                <ProfileField
                  label="Work Location"
                  value={profile.workLocation}
                  editValue={editData.workLocation}
                  editable={isFieldEditable('workLocation')}
                  onChange={(v) => updateField('workLocation', v)}
                  placeholder="Remote / Office"
                />
                <ProfileField
                  label="Employee ID"
                  value={profile.employeeId}
                  editable={false}
                  hint="Cannot be changed"
                />
              </div>
            </Card>
          </div>
        )}

        {/* ========== SALARY TAB ========== */}
        {activeTab === 'salary' && (
          <Card>
            <h3 className="text-base font-semibold text-gray-800 mb-6">Salary Structure</h3>

            {/* Only admin can see salary details for other employees */}
            {(!isOwnProfile && !isAdmin) ? (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p>You don't have permission to view this section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <SalaryCard
                  label="Basic Salary"
                  value={profile.salary?.basic}
                  editValue={editData.salary?.basic}
                  editable={isFieldEditable('salary')}
                  onChange={(v) => updateField('salary.basic', parseFloat(v) || 0)}
                  currency={profile.salary?.currency || 'USD'}
                />
                <SalaryCard
                  label="HRA"
                  value={profile.salary?.hra}
                  editValue={editData.salary?.hra}
                  editable={isFieldEditable('salary')}
                  onChange={(v) => updateField('salary.hra', parseFloat(v) || 0)}
                  currency={profile.salary?.currency || 'USD'}
                />
                <SalaryCard
                  label="Allowances"
                  value={profile.salary?.allowances}
                  editValue={editData.salary?.allowances}
                  editable={isFieldEditable('salary')}
                  onChange={(v) => updateField('salary.allowances', parseFloat(v) || 0)}
                  currency={profile.salary?.currency || 'USD'}
                />
                <SalaryCard
                  label="Deductions"
                  value={profile.salary?.deductions}
                  editValue={editData.salary?.deductions}
                  editable={isFieldEditable('salary')}
                  onChange={(v) => updateField('salary.deductions', parseFloat(v) || 0)}
                  currency={profile.salary?.currency || 'USD'}
                  isDeduction
                />
                <SalaryCard
                  label="Net Salary"
                  value={profile.salary?.netSalary}
                  editValue={editData.salary?.netSalary}
                  editable={isFieldEditable('salary')}
                  onChange={(v) => updateField('salary.netSalary', parseFloat(v) || 0)}
                  currency={profile.salary?.currency || 'USD'}
                  isNet
                />
                {isFieldEditable('salary') && (
                  <div className="flex flex-col justify-center">
                    <label className="text-xs font-medium text-gray-500 mb-1.5">Currency</label>
                    <select
                      value={editData.salary?.currency || 'USD'}
                      onChange={(e) => updateField('salary.currency', e.target.value)}
                      className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* ========== DOCUMENTS TAB ========== */}
        {activeTab === 'documents' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-800">Documents</h3>
              {isAdmin && (
                <Button variant="secondary" size="sm" icon={FileText}>
                  Upload Document
                </Button>
              )}
            </div>

            {profile.documents && profile.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                  >
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{doc.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isAdmin ? 'Upload documents using the button above' : 'Contact HR to upload documents'}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

/**
 * ProfileField - A single field in the profile view/edit mode.
 */
const ProfileField = ({
  label,
  value,
  editValue,
  editable,
  onChange,
  placeholder = '',
  type = 'text',
  options = [],
  hint = '',
}) => {
  if (editable) {
    if (type === 'select') {
      return (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
          <select
            value={editValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
        <input
          type={type}
          value={editValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <p className={`text-sm ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
        {value || 'Not provided'}
      </p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
};

/**
 * SalaryCard - Display/edit a single salary component
 */
const SalaryCard = ({ label, value, editValue, editable, onChange, currency, isDeduction, isNet }) => {
  const formatCurrency = (amount, curr) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    const symbol = symbols[curr] || curr;
    return `${symbol}${(amount || 0).toLocaleString()}`;
  };

  if (editable) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="block text-xs font-medium text-gray-500 mb-2">{label}</label>
        <input
          type="number"
          value={editValue || 0}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary-500"
        />
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${isNet ? 'border-primary-200 bg-primary-50/50' : isDeduction ? 'border-red-100 bg-red-50/30' : 'border-gray-200'}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${isNet ? 'text-primary-600' : isDeduction ? 'text-red-600' : 'text-gray-800'}`}>
        {isDeduction && value ? '-' : ''}{formatCurrency(value, currency)}
      </p>
    </div>
  );
};

export default Profile;
