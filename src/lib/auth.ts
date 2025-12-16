// Admin User Management and Audit Logging

export interface AdminUser {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  fullName: string;
  role: 'owner' | 'admin' | 'staff';
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: 'content_update' | 'booking_update' | 'availability_update' | 'user_update' | 'login' | 'logout';
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
    createdAt: new Date().toISOString(),
  }
];

// Get all admin users
export function getAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return defaultAdminUsers;

  const stored = localStorage.getItem('adminUsers');
  if (stored) {
    try {
      return JSON.parse(stored);
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
export function addAdminUser(username: string, password: string, fullName: string, role: 'owner' | 'admin' | 'staff'): AdminUser {
  const users = getAdminUsers();

  // Check if username already exists
  if (users.some(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  const newUser: AdminUser = {
    id: `admin-${Date.now()}`,
    username,
    password,
    fullName,
    role,
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

  users[index] = { ...users[index], ...updates };
  saveAdminUsers(users);

  // Log the action
  const currentUser = getCurrentUser();
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

// Login function
export function login(username: string, password: string): AdminUser | null {
  const users = getAdminUsers();
  const user = users.find(u => u.username === username && u.password === password);

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
