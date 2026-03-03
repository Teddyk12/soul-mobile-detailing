'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, Mail, Eye, EyeOff, Check, ChevronRight, AlertTriangle, X, RefreshCcw,
  Users, Calendar, Settings, FileText, LayoutDashboard, Plus, Trash2, Edit, Save, UserPlus, Clock
} from 'lucide-react';
import {
  login, logout, getCurrentUser, getAdminUsers, addAdminUser, updateAdminUser, deleteAdminUser,
  getAuditLogs, logAudit, generatePasswordResetCode, applyPasswordResetCode,
  getUserByUsername, changePassword, changeUsername, verifyPassword, getRecoveryOptions,
  resetPasswordWithSecurityAnswer,
  type AdminUser, type AuditLog
} from '@/lib/auth';
import { getContent, saveContent, type WebsiteContent } from '@/lib/content';
import {
  getBookings, updateBooking, deleteBooking, type Booking,
  getCustomerHistory, addAdminNote, getBookingWithHistory, type BookingNote
} from '@/lib/storage';
import { getAvailability, addAvailability, deleteAvailability, type TimeSlot } from '@/lib/storage';

type Tab = 'content' | 'bookings' | 'availability' | 'users' | 'audit';

export default function AdminPage() {
  // Auth state
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Account management state
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'username' | 'sending' | 'code' | 'security' | 'new-password'>('username');
  const [forgotUsername, setForgotUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [userEmailForReset, setUserEmailForReset] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('content');

  // Content management state
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [editingContent, setEditingContent] = useState(false);
  const [contentSuccess, setContentSuccess] = useState('');
  const [contentError, setContentError] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState<string | null>(null);
  const [newAdminNote, setNewAdminNote] = useState('');

  // Availability state
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [quickAddDates, setQuickAddDates] = useState<string[]>([]);
  const [quickAddTimes, setQuickAddTimes] = useState<string[]>([]);

  // Users management state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState<string | null>(null);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'admin' | 'staff'>('staff');
  const [newUserEmail, setNewUserEmail] = useState('');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Debug info
  const [isServer, setIsServer] = useState(true);
  const [clientInfo, setClientInfo] = useState({
    userAgent: '',
    cookiesEnabled: false,
    storageAvailable: false
  });

  // Session management
  useEffect(() => {
    // Mark that we're running on client
    setIsServer(false);

    // Get environment info
    if (typeof window !== 'undefined') {
      setClientInfo({
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        storageAvailable: storageAvailable('sessionStorage') && storageAvailable('localStorage')
      });
    }

    // Check for existing session
    try {
      const storedUser = window.sessionStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('[ADMIN] Found user:', user.username);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setNewUsername(user.username || '');
        setNewFullName(user.fullName || '');
      }
    } catch (error) {
      console.error('[ADMIN] Error checking authentication:', error);
    }

    // Finished loading
    setIsLoading(false);
  }, []);

  // Handle login
  const handleLogin = () => {
    setLoginError('');

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password');
      return;
    }

    // For demonstration - in production this would check against a database
    if (username === 'owner' && password === 'soul2025') {
      const user: AdminUser = {
        id: 'admin-1',
        username: 'owner',
        fullName: 'Business Owner',
        role: 'owner'
      };

      try {
        window.sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
        setNewUsername(user.username || '');
        setNewFullName(user.fullName || '');
        setUsername('');
        setPassword('');
      } catch (error) {
        console.error('[ADMIN] Error saving user to storage:', error);
        // Still authenticate even if storage fails
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } else {
      setLoginError('Invalid username or password');
      setPassword('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.error('[ADMIN] Error removing user from session:', error);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowMyAccount(false);
    setUsername('');
    setPassword('');
  };

  // Handle reset
  const handleReset = () => {
    try {
      window.sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('[ADMIN] Error clearing session:', error);
    }
  };

  // Handle account update
  const handleAccountUpdate = () => {
    setAccountError('');
    setAccountSuccess('');

    // Validate inputs
    if (newPassword !== confirmPassword) {
      setAccountError('New passwords do not match');
      return;
    }

    if (currentPassword && currentPassword !== 'soul2025') {
      setAccountError('Current password is incorrect');
      return;
    }

    if (!newUsername.trim()) {
      setAccountError('Username cannot be empty');
      return;
    }

    try {
      if (!currentUser) {
        setAccountError('No user data found. Please login again.');
        return;
      }

      // Create updated user object
      const updatedUser: AdminUser = {
        ...currentUser,
        username: newUsername,
        fullName: newFullName || currentUser.fullName
      };

      // Save to session storage
      window.sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Show success message
      setAccountSuccess('Account information updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setAccountSuccess('');
      }, 3000);
    } catch (error) {
      console.error('[ADMIN] Error updating account:', error);
      setAccountError('Error saving changes. Please try again.');
    }
  };

  // Handle sending reset code
  const handleSendResetCode = async () => {
    setForgotPasswordError('');

    if (!forgotUsername.trim()) {
      setForgotPasswordError('Please enter your username');
      return;
    }

    const user = getUserByUsername(forgotUsername);
    if (!user) {
      setForgotPasswordError('Username not found. Please check and try again.');
      return;
    }

    // Check recovery options using imported function
    const recoveryOptions = getRecoveryOptions(forgotUsername);
    console.log('Recovery options for user:', forgotUsername, recoveryOptions);

    // If user has no email, go straight to security question if available
    if (!user.email) {
      console.log('User has no email, checking for security question');
      if (recoveryOptions.hasSecurityQuestion && recoveryOptions.securityQuestion) {
        console.log('User has security question, showing it');
        setSecurityQuestion(recoveryOptions.securityQuestion);
        setForgotPasswordStep('security');
        return;
      }
      setForgotPasswordError('No email address or security question registered for this account. Please contact the business owner at soulmobiledetailingllc@gmail.com');
      return;
    }

    // Show sending state
    setForgotPasswordStep('sending');
    setUserEmailForReset(user.email);

    try {
      // Generate the reset code using imported function
      const code = generatePasswordResetCode(forgotUsername);
      console.log('Generated reset code for', forgotUsername);

      // Send the email
      const response = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          resetCode: code
        })
      });

      const result = await response.json();
      console.log('Reset code API response:', result);

      if (result.success) {
        setForgotPasswordStep('code');
        setForgotPasswordSuccess(`Reset code sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
      } else {
        // Email failed - check if we should use security question instead
        console.error('Email failed to send:', result.error);

        if (result.useSecurityQuestion && recoveryOptions.hasSecurityQuestion) {
          console.log('Falling back to security question');
          setSecurityQuestion(recoveryOptions.securityQuestion!);
          setForgotPasswordStep('security');
          setForgotPasswordError(`Failed to send email: ${result.error}. You can use the security question instead.`);
        } else {
          setForgotPasswordStep('username');
          setForgotPasswordError(`${result.error || 'Failed to send reset email'}. Please try again or contact support at soulmobiledetailingllc@gmail.com.`);
        }
      }
    } catch (error) {
      console.error('Reset code request error:', error);
      // Network or other error - check if security question is available
      if (recoveryOptions.hasSecurityQuestion) {
        setSecurityQuestion(recoveryOptions.securityQuestion!);
        setForgotPasswordStep('security');
        setForgotPasswordError('Failed to send email. You can use the security question instead.');
      } else {
        setForgotPasswordStep('username');
        setForgotPasswordError('Failed to send reset email. Please try again or contact the owner.');
      }
    }
  };

  // Handle reset code verification
  const handleVerifyResetCode = () => {
    setForgotPasswordError('');

    if (!resetCode.trim()) {
      setForgotPasswordError('Please enter the reset code');
      return;
    }

    // Just verify the code exists in sessionStorage
    try {
      const storedCode = sessionStorage.getItem(`resetCode_${forgotUsername}`);
      if (storedCode === resetCode) {
        setForgotPasswordStep('new-password');
      } else {
        setForgotPasswordError('Invalid reset code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying reset code:', error);
      setForgotPasswordError('Error verifying reset code. Please try again.');
    }
  };

  // Handle security answer verification
  const handleVerifySecurityAnswer = () => {
    setForgotPasswordError('');

    if (!securityAnswer.trim()) {
      setForgotPasswordError('Please answer the security question');
      return;
    }

    // Just verify the answer to proceed to password reset
    const user = getUserByUsername(forgotUsername);
    if (user && user.securityAnswer && user.securityAnswer.toLowerCase() === securityAnswer.toLowerCase().trim()) {
      setForgotPasswordStep('new-password');
    } else {
      setForgotPasswordError('Incorrect answer. Please try again.');
    }
  };

  // Handle password reset
  const handleResetPassword = () => {
    setForgotPasswordError('');

    if (!newResetPassword.trim()) {
      setForgotPasswordError('Please enter a new password');
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }

    if (newResetPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      // If we have a reset code, use applyPasswordResetCode
      if (resetCode) {
        applyPasswordResetCode(resetCode, newResetPassword);
      } else if (securityAnswer) {
        // If we used security answer, use resetPasswordWithSecurityAnswer
        resetPasswordWithSecurityAnswer(forgotUsername, securityAnswer, newResetPassword);
      }

      setShowForgotPassword(false);
      setForgotPasswordStep('username');
      setForgotUsername('');
      setResetCode('');
      setSecurityAnswer('');
      setNewResetPassword('');
      setConfirmResetPassword('');
      setLoginError('Password reset successfully! Please log in with your new password.');
    } catch (error) {
      console.error('Password reset error:', error);
      setForgotPasswordError(error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
    }
  };

  // Helper function to check if storage is available
  function storageAvailable(type: 'localStorage' | 'sessionStorage') {
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadAllData();
    }
  }, [isAuthenticated, currentUser, activeTab]);

  const loadAllData = async () => {
    try {
      // Load content from Supabase
      const { loadContentFromSupabase } = await import('@/lib/content');
      const loadedContent = await loadContentFromSupabase();
      setContent(loadedContent);

      // Load bookings from Supabase
      const { loadBookingsFromSupabase } = await import('@/lib/content');
      const loadedBookings = await loadBookingsFromSupabase();
      setBookings(loadedBookings);

      // Load availability from Supabase
      const { loadAvailabilityFromSupabase } = await import('@/lib/content');
      const loadedAvailability = await loadAvailabilityFromSupabase();
      setAvailability(loadedAvailability);

      // Load users (still from localStorage)
      const loadedUsers = getAdminUsers();
      setUsers(loadedUsers);

      // Load audit logs (still from localStorage)
      const loadedLogs = getAuditLogs();
      setAuditLogs(loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Content management handlers
  const handleSaveContent = async () => {
    if (!content || !currentUser) return;

    try {
      // Save to Supabase
      const { saveContentToSupabase } = await import('@/lib/content');
      await saveContentToSupabase(content);

      setContentSuccess('Content updated successfully!');
      setEditingContent(false);
      logAudit(currentUser.id, currentUser.username, 'content_update', 'Updated website content');
      setTimeout(() => setContentSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setContentError('Failed to save content. Please try again.');
      setTimeout(() => setContentError(''), 3000);
    }
  };

  // Booking management handlers
  const handleUpdateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    if (!currentUser) return;

    try {
      // Update in Supabase
      const { updateBookingStatusInSupabase, loadBookingsFromSupabase } = await import('@/lib/content');
      await updateBookingStatusInSupabase(bookingId, status);

      // Reload bookings
      const updated = await loadBookingsFromSupabase();
      setBookings(updated);

      logAudit(currentUser.id, currentUser.username, 'booking_update', `Updated booking ${bookingId} status to ${status}`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this booking?')) return;

    try {
      // Delete from Supabase
      const { deleteBookingFromSupabase, loadBookingsFromSupabase } = await import('@/lib/content');
      await deleteBookingFromSupabase(bookingId);

      // Reload bookings
      const updated = await loadBookingsFromSupabase();
      setBookings(updated);

      setSelectedBooking(null);
      setShowBookingDetails(null);
      logAudit(currentUser.id, currentUser.username, 'booking_update', `Deleted booking ${bookingId}`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking. Please try again.');
    }
  };

  const handleAddAdminNote = (bookingId: string) => {
    if (!currentUser || !newAdminNote.trim()) return;

    try {
      addAdminNote(bookingId, currentUser.username, newAdminNote);
      setBookings(getBookings());
      setNewAdminNote('');
      logAudit(currentUser.id, currentUser.username, 'booking_update', `Added note to booking ${bookingId}`);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Availability management handlers - now with Supabase support
  const handleAddSlot = async () => {
    console.log('[ADMIN] Add slot clicked:', { currentUser, newSlotDate, newSlotTime });

    if (!currentUser) {
      alert('No user logged in');
      return;
    }

    if (!newSlotDate || !newSlotTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      console.log('[ADMIN] Importing Supabase functions...');
      // Use Supabase function from content.ts
      const { addAvailabilitySlotToSupabase } = await import('@/lib/content');

      console.log('[ADMIN] Adding slot to Supabase:', newSlotDate, newSlotTime);
      await addAvailabilitySlotToSupabase(newSlotDate, newSlotTime);

      console.log('[ADMIN] Slot added successfully, reloading availability...');
      // Reload availability from Supabase
      const { loadAvailabilityFromSupabase } = await import('@/lib/content');
      const updated = await loadAvailabilityFromSupabase();

      console.log('[ADMIN] Loaded updated availability:', updated.length, 'slots');
      setAvailability(updated);

      setNewSlotDate('');
      setNewSlotTime('');
      logAudit(currentUser.id, currentUser.username, 'availability_update', `Added time slot: ${newSlotDate} ${newSlotTime}`);

      alert('Time slot added successfully!');
    } catch (error) {
      console.error('[ADMIN] Error adding slot:', error);
      alert(`Failed to add time slot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this time slot?')) return;

    try {
      // Use Supabase function from content.ts
      const { deleteAvailabilitySlotFromSupabase } = await import('@/lib/content');
      await deleteAvailabilitySlotFromSupabase(slotId);

      // Reload availability from Supabase
      const { loadAvailabilityFromSupabase } = await import('@/lib/content');
      const updated = await loadAvailabilityFromSupabase();
      setAvailability(updated);

      logAudit(currentUser.id, currentUser.username, 'availability_update', `Deleted time slot ${slotId}`);
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete time slot. Please try again.');
    }
  };

  const handleQuickAdd = () => {
    if (!currentUser || quickAddDates.length === 0 || quickAddTimes.length === 0) return;

    try {
      let count = 0;
      quickAddDates.forEach(date => {
        quickAddTimes.forEach(time => {
          const newSlot: TimeSlot = {
            id: `slot-${Date.now()}-${count}`,
            date,
            time,
            available: true,
            bookingId: null
          };
          addAvailability(newSlot);
          count++;
        });
      });
      setAvailability(getAvailability());
      setQuickAddDates([]);
      setQuickAddTimes([]);
      logAudit(currentUser.id, currentUser.username, 'availability_update', `Quick added ${count} time slots`);
    } catch (error) {
      console.error('Error quick adding slots:', error);
    }
  };

  // User management handlers
  const handleAddNewUser = () => {
    if (!currentUser) return;

    try {
      const newUser = addAdminUser(newUserUsername, newUserPassword, newUserFullName, newUserRole, newUserEmail);
      setUsers(getAdminUsers());
      setShowAddUser(false);
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserFullName('');
      setNewUserEmail('');
      setNewUserRole('staff');
      logAudit(currentUser.id, currentUser.username, 'user_update', `Created new user: ${newUser.username}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this user?')) return;

    try {
      deleteAdminUser(userId);
      setUsers(getAdminUsers());
      logAudit(currentUser.id, currentUser.username, 'user_update', `Deleted user ${userId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleGenerateResetCode = (username: string) => {
    if (!currentUser) return;

    try {
      const code = generatePasswordResetCode(username);
      alert(`Reset code for ${username}: ${code}\n\nThis code expires in 15 minutes.`);
      setShowPasswordReset(null);
    } catch (error: any) {
      alert(error.message || 'Failed to generate reset code');
    }
  };

  // If still in the server-side rendering phase or loading
  if (isServer || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-white">Loading Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center my-8">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-center">
              Admin panel is loading, please wait...
            </p>
            <p className="text-gray-500 text-xs text-center mt-4">
              If the page doesn't load within 10 seconds, please refresh.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        {showForgotPassword ? (
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Reset Password</CardTitle>
              <button
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
                onClick={() => setShowForgotPassword(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {forgotPasswordStep === 'username' && (
                <>
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
                    <p className="font-semibold mb-1">How Password Reset Works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-300">
                      <li>Enter your username below</li>
                      <li>We'll send a reset code to your registered email</li>
                      <li>Enter the code to set a new password</li>
                      <li>If email fails, you'll be asked your security question</li>
                    </ol>
                  </div>
                  <div>
                    <Label htmlFor="forgotUsername" className="text-white">Your Username</Label>
                    <Input
                      id="forgotUsername"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleSendResetCode}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Code
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    No email registered? Contact the owner at<br />
                    <span className="text-blue-400">soulmobiledetailingllc@gmail.com</span>
                  </p>
                </>
              )}

              {forgotPasswordStep === 'sending' && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-white mb-2">Sending Reset Code</p>
                  <p className="text-gray-400">Please wait while we send the reset code to your email...</p>
                </div>
              )}

              {forgotPasswordStep === 'code' && (
                <>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200 mb-4">
                    <Check className="w-5 h-5 text-green-400 mb-1" />
                    <p>{forgotPasswordSuccess}</p>
                  </div>
                  <div>
                    <Label htmlFor="resetCode" className="text-white">Enter Reset Code</Label>
                    <Input
                      id="resetCode"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white text-center text-lg tracking-wider"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleVerifyResetCode}
                    >
                      Verify Code
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Back
                    </Button>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    Didn't receive the code?{' '}
                    <button
                      className="text-blue-400 hover:underline"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Try again
                    </button>
                  </p>
                </>
              )}

              {forgotPasswordStep === 'security' && (
                <>
                  <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 text-sm text-amber-200 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
                    <p>Email couldn't be sent. Please answer your security question instead.</p>
                    {forgotPasswordError && <p className="mt-2 text-red-300">{forgotPasswordError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="securityQuestion" className="text-white">Security Question</Label>
                    <p className="bg-gray-900 border border-gray-700 rounded-md p-3 mb-3 text-white">
                      {securityQuestion}
                    </p>
                    <Label htmlFor="securityAnswer" className="text-white">Your Answer</Label>
                    <Input
                      id="securityAnswer"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter your answer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleVerifySecurityAnswer}
                    >
                      Verify Answer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setForgotPasswordStep('username')}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}

              {forgotPasswordStep === 'new-password' && (
                <>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-200 mb-4">
                    <Check className="w-5 h-5 text-green-400 mb-1" />
                    <p>Verification successful! Please set your new password.</p>
                  </div>
                  <div>
                    <Label htmlFor="newResetPassword" className="text-white">New Password</Label>
                    <Input
                      id="newResetPassword"
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white mb-3"
                      placeholder="Enter new password"
                    />
                    <Label htmlFor="confirmResetPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmResetPassword"
                      type="password"
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {forgotPasswordError && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleResetPassword}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Check the previous step to determine where to go back to
                        if (forgotPasswordStep === 'new-password') {
                          const previousStep: 'code' | 'security' = securityQuestion ? 'security' : 'code';
                          setForgotPasswordStep(previousStep);
                        }
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-white">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white pr-10"
                    placeholder="Enter your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3">
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </p>
                </div>
              )}

              <Button className="w-full" onClick={handleLogin}>
                Login
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
                <Link href="/" className="text-gray-400 hover:text-gray-300">
                  Back to Website
                </Link>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full text-sm" onClick={handleReset}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset & Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Admin dashboard with tabs
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Website
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Soul Mobile Detailing - Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showMyAccount ? "default" : "outline"}
              className={`gap-2 ${showMyAccount ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
              onClick={() => setShowMyAccount(!showMyAccount)}
            >
              <Settings className="w-4 h-4" />
              My Account
            </Button>
            <Button variant="destructive" className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* My Account Modal */}
        {showMyAccount && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">My Account</CardTitle>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setShowMyAccount(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {accountSuccess && (
                <div className="bg-green-900/30 border border-green-700 rounded-md p-3 mb-4">
                  <p className="text-green-300 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {accountSuccess}
                  </p>
                </div>
              )}

              {accountError && (
                <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4">
                  <p className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {accountError}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="newUsername" className="text-white">Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="newFullName" className="text-white">Full Name</Label>
                  <Input
                    id="newFullName"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-4">To change your password, enter your current password first:</p>

                  <div>
                    <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="newPassword" className="text-white">New Password (leave blank to keep current)</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <Button className="w-full mt-2" onClick={handleAccountUpdate}>
                  Update Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'content' ? 'default' : 'outline'}
            onClick={() => setActiveTab('content')}
            className={`gap-2 ${activeTab === 'content' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Website Content
          </Button>
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
            className={`gap-2 ${activeTab === 'bookings' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            <Calendar className="w-4 h-4" />
            Bookings ({bookings.length})
          </Button>
          <Button
            variant={activeTab === 'availability' ? 'default' : 'outline'}
            onClick={() => setActiveTab('availability')}
            className={`gap-2 ${activeTab === 'availability' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            <Clock className="w-4 h-4" />
            Availability ({availability.filter(s => s.available).length})
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className={`gap-2 ${activeTab === 'users' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            <Users className="w-4 h-4" />
            Admin Users ({users.length})
          </Button>
          <Button
            variant={activeTab === 'audit' ? 'default' : 'outline'}
            onClick={() => setActiveTab('audit')}
            className={`gap-2 ${activeTab === 'audit' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            <FileText className="w-4 h-4" />
            Audit Logs
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && content && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Website Content Management</CardTitle>
              <Button
                onClick={() => editingContent ? handleSaveContent() : setEditingContent(true)}
                className="gap-2"
              >
                {editingContent ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit className="w-4 h-4" /> Edit Content</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentSuccess && (
                <div className="bg-green-900/30 border border-green-700 rounded-md p-3">
                  <p className="text-green-300 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {contentSuccess}
                  </p>
                </div>
              )}

              {/* Hero Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-400">Hero Section</h3>
                <div>
                  <Label className="text-white">Title</Label>
                  <Input
                    value={content.hero.title}
                    onChange={(e) => setContent({...content, hero: {...content.hero, title: e.target.value}})}
                    disabled={!editingContent}
                    placeholder="e.g., Soul Mobile Detailing"
                    className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90"
                    style={{ color: editingContent ? 'white' : '#d1d5db' }}
                  />
                </div>
                <div>
                  <Label className="text-white">Subtitle</Label>
                  <Textarea
                    value={content.hero.subtitle}
                    onChange={(e) => setContent({...content, hero: {...content.hero, subtitle: e.target.value}})}
                    disabled={!editingContent}
                    placeholder="Professional mobile detailing services that restore your vehicle's beauty..."
                    className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90"
                    style={{ color: editingContent ? 'white' : '#d1d5db' }}
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white">Background Image URL</Label>
                  <Input
                    value={content.hero.backgroundImage}
                    onChange={(e) => setContent({...content, hero: {...content.hero, backgroundImage: e.target.value}})}
                    disabled={!editingContent}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90"
                    style={{ color: editingContent ? 'white' : '#d1d5db' }}
                  />
                </div>
              </div>

              {/* Services Section */}
              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-blue-400">Service Packages</h3>
                {content.services.map((service, index) => (
                  <div key={index} className="bg-gray-900/50 p-4 rounded-lg space-y-2 border border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm font-semibold">Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => {
                            const updated = [...content.services];
                            updated[index] = {...service, name: e.target.value};
                            setContent({...content, services: updated});
                          }}
                          disabled={!editingContent}
                          placeholder="Interior Only, Full Package, etc."
                          className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90 font-medium"
                          style={{ color: editingContent ? 'white' : '#d1d5db' }}
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm font-semibold">Price</Label>
                        <Input
                          value={service.price}
                          onChange={(e) => {
                            const updated = [...content.services];
                            updated[index] = {...service, price: e.target.value};
                            setContent({...content, services: updated});
                          }}
                          disabled={!editingContent}
                          placeholder="$169.99"
                          className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90 font-medium"
                          style={{ color: editingContent ? 'white' : '#d1d5db' }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm font-semibold">Description</Label>
                      <Input
                        value={service.description}
                        onChange={(e) => {
                          const updated = [...content.services];
                          updated[index] = {...service, description: e.target.value};
                          setContent({...content, services: updated});
                        }}
                        disabled={!editingContent}
                        placeholder="Complete interior detailing service (3 hours)"
                        className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90"
                        style={{ color: editingContent ? 'white' : '#d1d5db' }}
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm font-semibold">Image URL</Label>
                      <Input
                        value={service.image}
                        onChange={(e) => {
                          const updated = [...content.services];
                          updated[index] = {...service, image: e.target.value};
                          setContent({...content, services: updated});
                        }}
                        disabled={!editingContent}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90 text-sm"
                        style={{ color: editingContent ? 'white' : '#d1d5db' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-blue-400">Contact Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white font-semibold">Phone Number</Label>
                    <Input
                      value={content.contact.phone}
                      onChange={(e) => setContent({...content, contact: {...content.contact, phone: e.target.value}})}
                      disabled={!editingContent}
                      placeholder="425 574 6475"
                      className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90 font-medium"
                      style={{ color: editingContent ? 'white' : '#d1d5db' }}
                    />
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Email</Label>
                    <Input
                      value={content.contact.email}
                      onChange={(e) => setContent({...content, contact: {...content.contact, email: e.target.value}})}
                      disabled={!editingContent}
                      placeholder="soulmobiledetailingllc@gmail.com"
                      className="bg-gray-900 border-gray-700 text-white disabled:text-gray-300 disabled:opacity-90 font-medium"
                      style={{ color: editingContent ? 'white' : '#d1d5db' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Booking Management ({bookings.length} total)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No bookings yet</p>
                  ) : (
                    bookings.map(booking => {
                      const enrichedBooking = getBookingWithHistory(booking.id);
                      const customerHistory = getCustomerHistory(booking.email || booking.phone);
                      const isExpanded = showBookingDetails === booking.id;

                      return (
                        <div key={booking.id} className="bg-gray-900 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{booking.customerName || booking.name}</p>
                                {enrichedBooking && enrichedBooking.previousBookings! > 0 && (
                                  <Badge variant="outline" className="text-xs bg-blue-900/30 border-blue-700">
                                    {enrichedBooking.previousBookings} previous
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{booking.email} • {booking.phone}</p>
                              <p className="text-sm text-blue-300 mt-1">{booking.service}</p>
                              <p className="text-sm text-gray-400">📅 {booking.date} at {booking.time}</p>
                              {booking.address && <p className="text-sm text-gray-400">📍 {booking.address}</p>}
                              {enrichedBooking && enrichedBooking.totalSpent! > 0 && (
                                <p className="text-sm text-green-400 mt-1">💰 Total spent: ${enrichedBooking.totalSpent?.toFixed(2)}</p>
                              )}
                            </div>
                            <Badge className={
                              booking.status === 'confirmed' ? 'bg-green-700' :
                              booking.status === 'completed' ? 'bg-blue-700' :
                              booking.status === 'cancelled' ? 'bg-red-700' :
                              'bg-yellow-700'
                            }>
                              {booking.status}
                            </Badge>
                          </div>

                          {booking.notes && (
                            <div className="bg-gray-800 p-2 rounded text-sm text-gray-300">
                              <strong>Customer Notes:</strong> {booking.notes}
                            </div>
                          )}

                          {/* Admin Notes Section */}
                          {booking.adminNotes && booking.adminNotes.length > 0 && (
                            <div className="bg-gray-800 p-3 rounded space-y-2">
                              <p className="text-sm font-semibold text-white">Admin Notes:</p>
                              {booking.adminNotes.map(note => (
                                <div key={note.id} className="text-sm text-gray-300 border-l-2 border-blue-500 pl-2">
                                  <p className="text-gray-400 text-xs">{note.adminUser} • {new Date(note.timestamp).toLocaleString()}</p>
                                  <p>{note.note}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2 flex-wrap">
                            <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} disabled={booking.status === 'confirmed'}>
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} disabled={booking.status === 'completed'}>
                              Complete
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')} disabled={booking.status === 'cancelled'}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowBookingDetails(isExpanded ? null : booking.id)}
                            >
                              {isExpanded ? 'Hide' : 'Details'} ({customerHistory.length})
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="mt-4 space-y-4 border-t border-gray-700 pt-4">
                              {/* Customer History */}
                              {customerHistory.length > 1 && (
                                <div className="bg-gray-800/50 p-3 rounded">
                                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Customer History ({customerHistory.length - 1} previous bookings)
                                  </h4>
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {customerHistory.filter(h => h.id !== booking.id).map(hist => (
                                      <div key={hist.id} className="bg-gray-900 p-2 rounded text-sm">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-white">{hist.service}</p>
                                            <p className="text-gray-400 text-xs">{hist.date} at {hist.time}</p>
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {hist.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Add Admin Note */}
                              <div className="bg-gray-800/50 p-3 rounded">
                                <h4 className="font-semibold text-white mb-2">Add Admin Note</h4>
                                <div className="flex gap-2">
                                  <Textarea
                                    value={newAdminNote}
                                    onChange={(e) => setNewAdminNote(e.target.value)}
                                    placeholder="Enter note about this booking..."
                                    className="bg-gray-900 border-gray-700 text-white flex-1"
                                    rows={2}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddAdminNote(booking.id)}
                                    disabled={!newAdminNote.trim()}
                                  >
                                    Add Note
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-4">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Total Slots</p>
                      <p className="text-2xl font-bold text-white">{availability.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Available</p>
                      <p className="text-2xl font-bold text-white">{availability.filter(s => !s.isBooked).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Booked</p>
                      <p className="text-2xl font-bold text-white">{availability.filter(s => s.isBooked).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">This Week</p>
                      <p className="text-2xl font-bold text-white">
                        {availability.filter(s => {
                          const slotDate = new Date(s.date);
                          const today = new Date();
                          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                          return slotDate >= today && slotDate <= weekFromNow && !s.isBooked;
                        }).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Add Presets */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5" />
                  Quick Add - Batch Create Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={async () => {
                      if (!currentUser) return;
                      try {
                        const { addAvailabilitySlotToSupabase, loadAvailabilityFromSupabase } = await import('@/lib/content');
                        const today = new Date();
                        const times = ['09:00', '11:00', '13:00', '15:00'];
                        for (let i = 0; i < 7; i++) {
                          const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
                          const dateStr = date.toISOString().split('T')[0];
                          for (const time of times) {
                            await addAvailabilitySlotToSupabase(dateStr, time);
                          }
                        }
                        const updated = await loadAvailabilityFromSupabase();
                        setAvailability(updated);
                        logAudit(currentUser.id, currentUser.username, 'availability_update', 'Quick added: Next 7 days (4 slots/day)');
                      } catch (error) {
                        console.error('Error adding slots:', error);
                        alert('Failed to add time slots. Please try again.');
                      }
                    }}
                    className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  >
                    <Calendar className="w-6 h-6" />
                    <div className="text-sm font-semibold">Next 7 Days</div>
                    <div className="text-xs opacity-90">4 slots/day (9AM-3PM)</div>
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!currentUser) return;
                      try {
                        const { addAvailabilitySlotToSupabase, loadAvailabilityFromSupabase } = await import('@/lib/content');
                        const today = new Date();
                        const times = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];
                        for (let i = 0; i < 30; i++) {
                          const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
                          if (date.getDay() !== 0) { // Skip Sundays
                            const dateStr = date.toISOString().split('T')[0];
                            for (const time of times) {
                              await addAvailabilitySlotToSupabase(dateStr, time);
                            }
                          }
                        }
                        const updated = await loadAvailabilityFromSupabase();
                        setAvailability(updated);
                        logAudit(currentUser.id, currentUser.username, 'availability_update', 'Quick added: Next 30 days (6 slots/day, Mon-Sat)');
                      } catch (error) {
                        console.error('Error adding slots:', error);
                        alert('Failed to add time slots. Please try again.');
                      }
                    }}
                    className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  >
                    <Clock className="w-6 h-6" />
                    <div className="text-sm font-semibold">Next Month</div>
                    <div className="text-xs opacity-90">6 slots/day (Mon-Sat)</div>
                  </Button>

                  <Button
                    onClick={async () => {
                      if (!currentUser) return;
                      try {
                        const { addAvailabilitySlotToSupabase, loadAvailabilityFromSupabase } = await import('@/lib/content');
                        const today = new Date();
                        const times = ['10:00', '12:00', '14:00', '16:00'];
                        for (let i = 0; i < 30; i++) {
                          const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
                          if (date.getDay() === 0 || date.getDay() === 6) { // Saturday or Sunday
                            const dateStr = date.toISOString().split('T')[0];
                            for (const time of times) {
                              await addAvailabilitySlotToSupabase(dateStr, time);
                            }
                          }
                        }
                        const updated = await loadAvailabilityFromSupabase();
                        setAvailability(updated);
                        logAudit(currentUser.id, currentUser.username, 'availability_update', 'Quick added: Weekends only (4 slots/day)');
                      } catch (error) {
                        console.error('Error adding slots:', error);
                        alert('Failed to add time slots. Please try again.');
                      }
                    }}
                    className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  >
                    <Calendar className="w-6 h-6" />
                    <div className="text-sm font-semibold">Weekends Only</div>
                    <div className="text-xs opacity-90">4 slots/day (Sat-Sun)</div>
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Bulk Management</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!currentUser || !confirm('Delete all past time slots?')) return;
                        try {
                          const { deleteAvailabilitySlotFromSupabase, loadAvailabilityFromSupabase } = await import('@/lib/content');
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const pastSlots = availability.filter(s => new Date(s.date) < today && s.isBooked === false);
                          for (const slot of pastSlots) {
                            await deleteAvailabilitySlotFromSupabase(slot.id);
                          }
                          const updated = await loadAvailabilityFromSupabase();
                          setAvailability(updated);
                          logAudit(currentUser.id, currentUser.username, 'availability_update', `Deleted ${pastSlots.length} past slots`);
                        } catch (error) {
                          console.error('Error deleting past slots:', error);
                          alert('Failed to delete past slots. Please try again.');
                        }
                      }}
                      className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Past Slots
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!currentUser || !confirm('Delete ALL available time slots? This cannot be undone!')) return;
                        try {
                          const { deleteAvailabilitySlotFromSupabase, loadAvailabilityFromSupabase } = await import('@/lib/content');
                          const availableSlots = availability.filter(s => s.isBooked === false);
                          for (const slot of availableSlots) {
                            await deleteAvailabilitySlotFromSupabase(slot.id);
                          }
                          const updated = await loadAvailabilityFromSupabase();
                          setAvailability(updated);
                          logAudit(currentUser.id, currentUser.username, 'availability_update', 'Deleted all available slots');
                        } catch (error) {
                          console.error('Error deleting all slots:', error);
                          alert('Failed to delete slots. Please try again.');
                        }
                      }}
                      className="bg-red-900 text-red-200 border-red-700 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Available
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Add Single Slot */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Add Single Time Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-white font-semibold">Date</Label>
                    <Input
                      type="date"
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      style={{ colorScheme: 'dark', color: 'white' }}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-white font-semibold">Time</Label>
                    <Input
                      type="time"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                      style={{ colorScheme: 'dark', color: 'white' }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddSlot} className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slots List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Available Time Slots ({availability.filter(s => !s.isBooked).length} available)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availability.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg mb-2">No time slots available</p>
                      <p className="text-gray-500 text-sm">Use the Quick Add presets above to get started!</p>
                    </div>
                  ) : (
                    availability
                      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
                      .map(slot => {
                        const slotDate = new Date(slot.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = slotDate < today;
                        const isAvailable = !slot.isBooked;

                        return (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg flex justify-between items-center border transition-all ${
                              isAvailable
                                ? isPast
                                  ? 'bg-gray-900/50 border-gray-700 opacity-50'
                                  : 'bg-gray-900 border-green-900/50 hover:border-green-700'
                                : 'bg-blue-900/20 border-blue-900'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isAvailable ? 'bg-green-600' : 'bg-blue-600'
                              }`}>
                                {isAvailable ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  {' at '}
                                  {slot.time}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {isAvailable ? (isPast ? '⚠️ Past date - should be removed' : '✅ Available for booking') : '🔒 Slot is booked'}
                                </p>
                              </div>
                            </div>
                            {isAvailable && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Admin Users</CardTitle>
                <Button onClick={() => setShowAddUser(!showAddUser)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                {showAddUser && (
                  <div className="bg-gray-900 p-4 rounded-lg mb-4 space-y-3">
                    <h4 className="font-semibold text-white">Create New User</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white">Username</Label>
                        <Input
                          value={newUserUsername}
                          onChange={(e) => setNewUserUsername(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Full Name</Label>
                        <Input
                          value={newUserFullName}
                          onChange={(e) => setNewUserFullName(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Email</Label>
                        <Input
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Password</Label>
                        <Input
                          type="password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Role</Label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as 'owner' | 'admin' | 'staff')}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNewUser}>Create User</Button>
                      <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="bg-gray-900 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{user.fullName || user.username}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                          {user.email && <p className="text-sm text-gray-400">📧 {user.email}</p>}
                          <Badge className="mt-2">{user.role}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPasswordReset(showPasswordReset === user.id ? null : user.id)}
                          >
                            Reset Password
                          </Button>
                          {user.role !== 'owner' && currentUser?.role === 'owner' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {showPasswordReset === user.id && (
                        <div className="mt-3 p-3 bg-gray-800 rounded">
                          <Button
                            size="sm"
                            onClick={() => handleGenerateResetCode(user.username)}
                          >
                            Generate Reset Code
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'audit' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Audit Logs ({auditLogs.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No audit logs yet</p>
                ) : (
                  auditLogs.slice(0, 50).map(log => (
                    <div key={log.id} className="bg-gray-900 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{log.details}</p>
                          <p className="text-sm text-gray-400">
                            By {log.username} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge>{log.action.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
