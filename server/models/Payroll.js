const mongoose = require('mongoose');

/**
 * Payroll Schema for Dayflow HRMS
 * Tracks monthly salary slips per employee.
 */
const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // Earnings breakdown
    earnings: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
    },
    // Deductions breakdown
    deductions: {
      tax: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['draft', 'generated', 'paid'],
      default: 'generated',
    },
    paidOn: {
      type: Date,
      default: null,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Working days data for the month
    workingDays: {
      total: { type: Number, default: 22 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      leaves: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// One payroll record per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ year: 1, month: 1, status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
