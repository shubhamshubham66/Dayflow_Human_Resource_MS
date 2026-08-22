const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for Dayflow HRMS
 * Phase 2: Extended with personal details, job info, salary, documents, profile picture
 */
const userSchema = new mongoose.Schema(
  {
    // ============ CORE AUTH FIELDS ============
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['employee', 'admin'],
        message: 'Role must be either employee or admin',
      },
      default: 'employee',
    },
    profilePicture: {
      type: String, // URL or base64
      default: '',
    },

    // ============ PERSONAL DETAILS ============
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      zipCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      relationship: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },

    // ============ JOB DETAILS ============
    department: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfJoining: {
      type: Date,
      default: null,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern', ''],
      default: '',
    },
    reportingManager: {
      type: String,
      trim: true,
      default: '',
    },
    workLocation: {
      type: String,
      trim: true,
      default: '',
    },

    // ============ SALARY STRUCTURE ============
    salary: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
      netSalary: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },

    // ============ DOCUMENTS ============
    documents: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true }, // resume, id-proof, offer-letter, etc.
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ============ AUTH & STATUS FIELDS ============
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware: Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method: Return user data without sensitive fields
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    employeeId: this.employeeId,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    profilePicture: this.profilePicture,
    phone: this.phone,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    address: this.address,
    emergencyContact: this.emergencyContact,
    department: this.department,
    designation: this.designation,
    dateOfJoining: this.dateOfJoining,
    employmentType: this.employmentType,
    reportingManager: this.reportingManager,
    workLocation: this.workLocation,
    salary: this.salary,
    documents: this.documents,
    isVerified: this.isVerified,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
