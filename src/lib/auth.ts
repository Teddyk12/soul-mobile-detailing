/**
 * Admin User Management and Audit Logging
 */

export interface AdminUser {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  fullName: string;
  role: 'owner' | 'admin' | 'staff';
  email?: string; // For password recovery
  backupEmail?: string; // Secondary email for recovery
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface PasswordResetCode {
  code: string;
  username: string;
  expiresAt: string;
  used: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: 'content_update' | 'booking_update' | 'availability_update' | 'user_update' | 'login' | 'logout' | 'password_change' | 'password_reset';
  details: string;
  timestamp: string;
}

// Default admin users
const defaultAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'owner',
    password: 'soul2025',
    fullName: 'Business Owner',
    role: 'owner',
    email: 'soulmobiledetailingllc@gmail.com',
    backupEmail: '', // Set a backup email for extra security
    securityQuestion: 'What city was the business started in?',
    securityAnswer: 'seattle', // lowercase for case-insensitive comparison
    createdAt: new Date().toISOString(),
  }
];

// Get all admin users
export function getAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return defaultAdminUsers;

  const stored = localStorage.getItem('adminUsers');
  if (stored) {
    try {
      const parsedUsers = JSON.parse(stored);

      // Ensure the owner account has security question set up - this handles upgrades
      const ownerUser = parsedUsers.find((u: AdminUser) => u.username === 'owner' && u.role === 'owner');
      if (ownerUser && (!ownerUser.securityQuestion || !ownerUser.securityAnswer)) {
        console.log('Adding security question to owner account');
        ownerUser.securityQuestion = 'What city was the business started in?';
        ownerUser.securityAnswer = 'seattle';
        localStorage.setItem('adminUsers', JSON.stringify(parsedUsers));
      }

      return parsedUsers;
    } catch (e) {
      console.error('Error parsing admin users:', e);
    }
  }

  // Initialize with default user
  localStorage.setItem('adminUsers', JSON.stringify(defaultAdminUsers));
  return defaultAdminUsers;
}

// Save admin users
export function saveAdminUsers(users: AdminUser[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminUsers', JSON.stringify(users));
  }
}

// Add a new admin user
export function addAdminUser(username: string, password: string, fullName: string, role: 'owner' | 'admin' | 'staff', email?: string): AdminUser {
  const users = getAdminUsers();

  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }

  const newUser: AdminUser = {
    id: `admin-${Date.now()}`,
    username,
    password,
    fullName,
    role,
    email,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAdminUsers(users);

  // Log the action
  const currentUser = getCurrentUser();
  if (currentUser) {
    logAudit(currentUser.id, currentUser.username, 'user_update', `Created new user: ${username} (${fullName})`);
  }

  return newUser;
}

// Update admin user
export function updateAdminUser(id: string, updates: Partial<Omit<AdminUser, 'id' | 'createdAt'>>): void {
  const users = getAdminUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new Error('User not found');
  }

  // Check if username is being changed and already exists
  if (updates.username && updates.username !== users[index].username) {
    if (users.some(u => u.username.toLowerCase() === updates.username!.toLowerCase() && u.id !== id)) {
      throw new Error('Username already exists');
    }
  }

  users[index] = { ...users[index], ...updates };
  saveAdminUsers(users);

  // Update session if current user was updated
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    sessionStorage.setItem('currentUser', JSON.stringify(users[index]));
  }

  // Log the action
  if (currentUser) {
    logAudit(currentUser.id, currentUser.username, 'user_update', `Updated user: ${users[index].username}`);
  }
}

// Delete admin user
export function deleteAdminUser(id: string): void {
  const users = getAdminUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    throw new Error('User not found');
  }

  // Don't allow deleting the last owner
  if (user.role === 'owner' && users.filter(u => u.role === 'owner').length === 1) {
    throw new Error('Cannot delete the last owner account');
  }

  const filteredUsers = users.filter(u => u.id !== id);
  saveAdminUsers(filteredUsers);

  // Log the action
  const currentUser = getCurrentUser();
  if (currentUser) {
    logAudit(currentUser.id, currentUser.username, 'user_update', `Deleted user: ${user.username}`);
  }
}

// Verify current password
export function verifyPassword(userId: string, password: string): boolean {
  const users = getAdminUsers();
  const user = users.find(u => u.id === userId);
  return user?.password === password;
}

// Change password with current password verification
export function changePassword(userId: string, currentPassword: string, newPassword: string): boolean {
  const users = getAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  updateAdminUser(userId, { password: newPassword });

  // Log the action
  logAudit(userId, user.username, 'password_change', 'Password changed by user');

  return true;
}

// Change username with password verification
export function changeUsername(userId: string, password: string, newUsername: string): boolean {
  const users = getAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== password) {
    throw new Error('Password is incorrect');
  }

  if (newUsername.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== userId)) {
    throw new Error('Username already exists');
  }

  const oldUsername = user.username;
  updateAdminUser(userId, { username: newUsername });

  // Log the action
  logAudit(userId, newUsername, 'user_update', `Username changed from "${oldUsername}" to "${newUsername}"`);

  return true;
}

// Password Reset Functions
export function getPasswordResetCodes(): PasswordResetCode[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('passwordResetCodes');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing reset codes:', e);
    }
  }
  return [];
}

export function savePasswordResetCodes(codes: PasswordResetCode[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('passwordResetCodes', JSON.stringify(codes));
  }
}

// Generate a password reset code (only owners can do this)
export function generatePasswordResetCode(targetUsername: string): string {
  const users = getAdminUsers();
  const targetUser = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());

  if (!targetUser) {
    throw new Error('User not found');
  }

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Code expires in 15 minutes
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const resetCodes = getPasswordResetCodes();

  // Remove any existing codes for this user
  const filteredCodes = resetCodes.filter(c => c.username !== targetUsername);

  filteredCodes.push({
    code,
    username: targetUsername,
    expiresAt: expiresAt.toISOString(),
    used: false
  });

  savePasswordResetCodes(filteredCodes);

  // Log the action
  const currentUser = getCurrentUser();
  if (currentUser) {
    logAudit(currentUser.id, currentUser.username, 'password_reset', `Generated reset code for user: ${targetUsername}`);
  }

  return code;
}

// Apply password reset code to reset password
export function applyPasswordResetCode(code: string, newPassword: string): boolean {
  const resetCodes = getPasswordResetCodes();
  const resetCode = resetCodes.find(c => c.code === code && !c.used);

  if (!resetCode) {
    throw new Error('Invalid or expired reset code');
  }

  if (new Date(resetCode.expiresAt) < new Date()) {
    throw new Error('Reset code has expired');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Find and update the user
  const users = getAdminUsers();
  const userIndex = users.findIndex(u => u.username === resetCode.username);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].password = newPassword;
  saveAdminUsers(users);

  // Mark code as used
  resetCode.used = true;
  savePasswordResetCodes(resetCodes);

  // Log the action
  logAudit(users[userIndex].id, users[userIndex].username, 'password_reset', 'Password reset via recovery code');

  return true;
}

// Get user by username (for forgot password)
export function getUserByUsername(username: string): AdminUser | null {
  const users = getAdminUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

// Login function
export function login(username: string, password: string): AdminUser | null {
  const users = getAdminUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (user) {
    // Update last login
    updateAdminUser(user.id, { lastLogin: new Date().toISOString() });

    // Store current user in session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Log the login
    logAudit(user.id, user.username, 'login', 'User logged in');

    return user;
  }

  return null;
}

// Logout function
export function logout(): void {
  const currentUser = getCurrentUser();

  if (currentUser) {
    logAudit(currentUser.id, currentUser.username, 'logout', 'User logged out');
  }

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('currentUser');
  }
}

// Get current logged-in user
export function getCurrentUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem('currentUser');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing current user:', e);
    }
  }

  return null;
}

// Refresh current user from storage (in case it was updated)
export function refreshCurrentUser(): AdminUser | null {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getAdminUsers();
  const updatedUser = users.find(u => u.id === currentUser.id);

  if (updatedUser) {
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }

  return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Audit log functions
export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('auditLogs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing audit logs:', e);
    }
  }

  return [];
}

export function logAudit(
  userId: string,
  username: string,
  action: AuditLog['action'],
  details: string
): void {
  if (typeof window === 'undefined') return;

  const logs = getAuditLogs();

  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    userId,
    username,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  logs.unshift(newLog); // Add to beginning

  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }

  localStorage.setItem('auditLogs', JSON.stringify(logs));
}

// Clear old audit logs (older than X days)
export function clearOldAuditLogs(daysToKeep: number = 90): void {
  const logs = getAuditLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);

  if (typeof window !== 'undefined') {
    localStorage.setItem('auditLogs', JSON.stringify(filteredLogs));
  }
}

// ============================================
// BACKUP RECOVERY OPTIONS
// ============================================

// Get security question for a user (returns null if not set)
export function getSecurityQuestion(username: string): string | null {
  const user = getUserByUsername(username);
  return user?.securityQuestion || null;
}

// Verify security answer and reset password
export function resetPasswordWithSecurityAnswer(
  username: string,
  securityAnswer: string,
  newPassword: string
): boolean {
  console.log('Attempting security answer reset for', username);
  const users = getAdminUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.securityQuestion || !user.securityAnswer) {
    throw new Error('Security question not set up for this account');
  }

  console.log('Comparing security answers');
  // Case-insensitive comparison
  if (user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase().trim()) {
    throw new Error('Security answer is incorrect');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Update password
  user.password = newPassword;
  saveAdminUsers(users);

  // Log the action
  logAudit(user.id, user.username, 'password_reset', 'Password reset via security question');
  console.log('Password reset successful via security question');

  return true;
}

// Update security question and answer
export function updateSecurityQuestion(
  userId: string,
  currentPassword: string,
  question: string,
  answer: string
): boolean {
  const users = getAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  if (!question.trim() || !answer.trim()) {
    throw new Error('Security question and answer are required');
  }

  user.securityQuestion = question.trim();
  user.securityAnswer = answer.toLowerCase().trim(); // Store lowercase for case-insensitive comparison
  saveAdminUsers(users);

  // Update session if current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Log the action
  logAudit(userId, user.username, 'user_update', 'Security question updated');

  return true;
}

// Update backup email
export function updateBackupEmail(
  userId: string,
  currentPassword: string,
  backupEmail: string
): boolean {
  const users = getAdminUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  // Basic email validation
  if (backupEmail && !backupEmail.includes('@')) {
    throw new Error('Invalid email format');
  }

  user.backupEmail = backupEmail.trim();
  saveAdminUsers(users);

  // Update session if current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Log the action
  logAudit(userId, user.username, 'user_update', 'Backup email updated');

  return true;
}

// Get all recovery options for a user
export function getRecoveryOptions(username: string): {
  hasEmail: boolean;
  hasBackupEmail: boolean;
  hasSecurityQuestion: boolean;
  securityQuestion: string | null;
} {
  const user = getUserByUsername(username);

  if (!user) {
    return {
      hasEmail: false,
      hasBackupEmail: false,
      hasSecurityQuestion: false,
      securityQuestion: null
    };
  }

  return {
    hasEmail: !!user.email,
    hasBackupEmail: !!user.backupEmail,
    hasSecurityQuestion: !!user.securityQuestion && !!user.securityAnswer,
    securityQuestion: user.securityQuestion || null
  };
}
