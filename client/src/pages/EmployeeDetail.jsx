import React from 'react';
import Profile from './Profile';

/**
 * Employee Detail Page — Admin view of a specific employee's full record.
 * This is a thin wrapper that renders the Profile component.
 * The Profile component detects the :id param and adapts behavior:
 *   - Shows full data with all tabs
 *   - Enables admin-level editing (all fields)
 *   - Shows "Back to Employees" navigation
 */
const EmployeeDetail = () => {
  return <Profile />;
};

export default EmployeeDetail;
