'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  loadContent,
  loadContentFromSupabase,
  saveContent,
  saveContentToSupabase,
  resetContent,
  type WebsiteContent,
  type Service,
  loadBookings,
  loadBookingsFromSupabase,
  updateBookingStatus,
  updateBookingStatusInSupabase,
  deleteBooking,
  deleteBookingFromSupabase,
  type Booking,
  loadAvailability,
  loadAvailabilityFromSupabase,
  addAvailabilitySlot,
  addAvailabilitySlotToSupabase,
  deleteAvailabilitySlot,
  deleteAvailabilitySlotFromSupabase,
  type AvailabilitySlot,
  releaseAvailabilitySlot,
  releaseAvailabilitySlotInSupabase,
  subscribeToBookings,
  subscribeToAvailability
} from '@/lib/content';
import {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getAdminUsers,
  addAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAuditLogs,
  logAudit,
  changePassword,
  changeUsername,
  generatePasswordResetCode,
  applyPasswordResetCode,
  getUserByUsername,
  refreshCurrentUser,
  type AdminUser,
  type AuditLog
} from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ArrowLeft, Save, RefreshCw, Plus, Trash2, Check, X, Calendar, Mail, Phone, LogOut, Upload, Clock, Users, FileText, Shield, User, Key, Settings, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'bookings' | 'availability' | 'users' | 'audit'>('bookings');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', email: '', role: 'staff' as 'owner' | 'admin' | 'staff' });
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [quickAddStartDate, setQuickAddStartDate] = useState('');
  const [quickAddEndDate, setQuickAddEndDate] = useState('');
  const [quickAddDays, setQuickAddDays] = useState<string[]>([]);
  const [quickAddStartTime, setQuickAddStartTime] = useState('09:00');
  const [quickAddEndTime, setQuickAddEndTime] = useState('17:00');
  const [quickAddInterval, setQuickAddInterval] = useState('60');
  const [quickAddMode, setQuickAddMode] = useState<'single' | 'batch'>('single');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Account management states
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'username' | 'sending' | 'code'>('username');
  const [forgotUsername, setForgotUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPasswordForReset, setNewPasswordForReset] = useState('');
  const [confirmNewPasswordForReset, setConfirmNewPasswordForReset] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [userEmailForReset, setUserEmailForReset] = useState('');

  // My Account modal states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [passwordForUsernameChange, setPasswordForUsernameChange] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [accountTab, setAccountTab] = useState<'password' | 'username'>('password');

  // Password reset modal for admin user management
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState('');
  const [resetPasswordUsername, setResetPasswordUsername] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordMode, setResetPasswordMode] = useState<'generate' | 'direct'>('direct');
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailError, setResetEmailError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);

      // Load initial data
      const loadInitialData = async () => {
        if (isSupabaseConfigured()) {
          // Load from Supabase
          const [contentData, bookingsData, availabilityData] = await Promise.all([
            loadContentFromSupabase(),
            loadBookingsFromSupabase(),
            loadAvailabilityFromSupabase()
          ]);
          setContent(contentData);
          setBookings(bookingsData);
          setAvailability(availabilityData);
        } else {
          // Fallback to localStorage
          setContent(loadContent());
          setBookings(loadBookings());
          setAvailability(loadAvailability());
        }

        // Load users and audit logs
        setAdminUsers(getAdminUsers());
        setAuditLogs(getAuditLogs());
      };

      loadInitialData();

      // Set up real-time subscriptions if Supabase is configured
      if (isSupabaseConfigured()) {
        const bookingsChannel = subscribeToBookings((updatedBookings) => {
          setBookings(updatedBookings);
        });

        const availabilityChannel = subscribeToAvailability((updatedSlots) => {
          setAvailability(updatedSlots);
        });

        // Cleanup subscriptions on unmount
        return () => {
          bookingsChannel?.unsubscribe();
          availabilityChannel?.unsubscribe();
        };
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = login(username, password);

    if (user) {
      setCurrentUser(user);
      setUsername('');
      setPassword('');

      // Load data from Supabase if configured
      if (isSupabaseConfigured()) {
        const [contentData, bookingsData, availabilityData] = await Promise.all([
          loadContentFromSupabase(),
          loadBookingsFromSupabase(),
          loadAvailabilityFromSupabase()
        ]);
        setContent(contentData);
        setBookings(bookingsData);
        setAvailability(availabilityData);

        // Set up real-time subscriptions
        subscribeToBookings((updatedBookings) => {
          setBookings(updatedBookings);
        });

        subscribeToAvailability((updatedSlots) => {
          setAvailability(updatedSlots);
        });
      } else {
        setContent(loadContent());
        setBookings(loadBookings());
        setAvailability(loadAvailability());
      }

      // Load users and audit logs
      setAdminUsers(getAdminUsers());
      setAuditLogs(getAuditLogs());
    } else {
      setLoginError('Invalid username or password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  // Helper function to convert image file to base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, callback: (imageUrl: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, WebP, etc.)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      callback(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle forgot password - send reset code via email
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
    
    if (!user.email) {
      setForgotPasswordError('No email address registered for this account. Please contact the business owner at soulmobiledetailingllc@gmail.com');
      return;
    }
    
    // Show sending state
    setForgotPasswordStep('sending');
    setUserEmailForReset(user.email);
    
    try {
      // Generate the reset code
      const code = generatePasswordResetCode(forgotUsername);
      
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
      
      if (result.success) {
        setForgotPasswordStep('code');
        setForgotPasswordSuccess(`Reset code sent to ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
      } else {
        setForgotPasswordStep('username');
        setForgotPasswordError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setForgotPasswordStep('username');
      setForgotPasswordError('Failed to send reset email. Please try again or contact the owner.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your username and password to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter username"
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotPasswordStep('username');
                      setForgotUsername('');
                      setResetCode('');
                      setNewPasswordForReset('');
                      setConfirmNewPasswordForReset('');
                      setForgotPasswordError('');
                      setForgotPasswordSuccess('');
                      setUserEmailForReset('');
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter password"
                  required
                />
                {loginError && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Link href="/">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Website
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      {forgotPasswordStep === 'username' ? 'Forgot Password' : 
                       forgotPasswordStep === 'sending' ? 'Sending Code...' : 'Reset Password'}
                    </CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      {forgotPasswordStep === 'username'
                        ? 'Enter your username to receive a reset code via email.'
                        : forgotPasswordStep === 'sending'
                        ? 'Please wait while we send the reset code to your email...'
                        : 'Enter the reset code sent to your email and create a new password.'}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={forgotPasswordStep === 'sending'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
                  <div className="flex flex-col items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                    <p className="text-gray-300">Sending reset code to your email...</p>
                  </div>
                )}
                
                {forgotPasswordStep === 'code' && (
                  <>
                    {forgotPasswordSuccess && (
                      <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-300 flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Reset Code Sent!</p>
                          <p className="text-green-400">{forgotPasswordSuccess}</p>
                          <p className="text-green-400/80 text-xs mt-1">Check your spam folder if you don't see it.</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="resetCode" className="text-white">Reset Code</Label>
                      <Input
                        id="resetCode"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white text-center text-xl tracking-widest"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPasswordForReset" className="text-white">New Password</Label>
                      <Input
                        id="newPasswordForReset"
                        type="password"
                        value={newPasswordForReset}
                        onChange={(e) => setNewPasswordForReset(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewPasswordForReset" className="text-white">Confirm New Password</Label>
                      <Input
                        id="confirmNewPasswordForReset"
                        type="password"
                        value={confirmNewPasswordForReset}
                        onChange={(e) => setConfirmNewPasswordForReset(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Confirm your password"
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
                        onClick={() => {
                          setForgotPasswordError('');
                          
                          if (!resetCode || resetCode.length !== 6) {
                            setForgotPasswordError('Please enter the 6-digit reset code');
                            return;
                          }
                          
                          if (newPasswordForReset !== confirmNewPasswordForReset) {
                            setForgotPasswordError('Passwords do not match');
                            return;
                          }
                          
                          if (newPasswordForReset.length < 6) {
                            setForgotPasswordError('Password must be at least 6 characters');
                            return;
                          }
                          
                          try {
                            applyPasswordResetCode(resetCode, newPasswordForReset);
                            setForgotPasswordSuccess('Password reset successful! You can now login with your new password.');
                            setForgotPasswordError('');
                            setTimeout(() => {
                              setShowForgotPassword(false);
                            }, 2000);
                          } catch (error) {
                            setForgotPasswordError(error instanceof Error ? error.message : 'Failed to reset password');
                          }
                        }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setForgotPasswordStep('username');
                          setForgotPasswordError('');
                          setForgotPasswordSuccess('');
                          setResetCode('');
                        }}
                      >
                        Back
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Didn't receive the code? Go back and try again, or contact the owner.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSupabaseConfigured()) {
        await saveContentToSupabase(content);
      } else {
        saveContent(content);
      }

      // Log audit trail
      if (currentUser) {
        logAudit(currentUser.id, currentUser.username, 'content_update', 'Updated website content');
        setAuditLogs(getAuditLogs());
      }

      setTimeout(() => {
        setIsSaving(false);
        alert('Changes saved successfully!');
      }, 500);
    } catch (error: unknown) {
      setIsSaving(false);
      alert('Error saving changes. Please try again.');
      console.error('Save error:', error);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      resetContent();
      setContent(loadContent());
      alert('Content reset to defaults!');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    const booking = bookings.find(b => b.id === bookingId);

    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(bookingId, newStatus);
    } else {
      updateBookingStatus(bookingId, newStatus);
      setBookings(loadBookings());
    }

    if (currentUser && booking) {
      logAudit(currentUser.id, currentUser.username, 'booking_update', `Changed booking status for ${booking.name} to ${newStatus}`);
      setAuditLogs(getAuditLogs());
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      if (isSupabaseConfigured()) {
        await deleteBookingFromSupabase(bookingId);
      } else {
        deleteBooking(bookingId);
        setBookings(loadBookings());
      }
    }
  };

  const handleConfirmBooking = async (booking: Booking) => {
    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(booking.id, 'confirmed');
    } else {
      updateBookingStatus(booking.id, 'confirmed');
      setBookings(loadBookings());
    }

    const subject = `Booking Confirmed - ${booking.service}`;
    const body = `
Dear ${booking.name},

Great news! Your booking has been CONFIRMED.

Booking Details:
- Service: ${booking.service}
- Vehicle: ${booking.vehicleType}
- Service Address: ${booking.address}
- Date: ${booking.date || 'To be scheduled'}
- Time: ${booking.time || 'To be scheduled'}

We look forward to serving you!

If you have any questions, please call us at 206-396-9579.

Best regards,
Soul Mobile Detailing LLC
    `.trim();

    if (booking.email) {
      window.open(`mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      alert(`Booking confirmed! Customer phone: ${booking.phone}\n\nPlease call them to confirm the appointment.`);
    }
  };

  const handleDenyBooking = async (booking: Booking) => {
    const reason = prompt('Please enter reason for denial (this will be sent to the customer):');
    if (!reason) return;

    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(booking.id, 'cancelled');
    } else {
      updateBookingStatus(booking.id, 'cancelled');
      setBookings(loadBookings());
    }

    const subject = `Booking Update - ${booking.service}`;
    const body = `
Dear ${booking.name},

Unfortunately, we are unable to confirm your booking request at this time.

Booking Details:
- Service: ${booking.service}
- Vehicle: ${booking.vehicleType}
- Service Address: ${booking.address}
- Requested Date: ${booking.date || 'Not specified'}
- Requested Time: ${booking.time || 'Not specified'}

Reason: ${reason}

Please call us at 206-396-9579 to discuss alternative options or reschedule.

We apologize for any inconvenience.

Best regards,
Soul Mobile Detailing LLC
    `.trim();

    if (booking.email) {
      window.open(`mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      alert(`Booking denied. Customer phone: ${booking.phone}\n\nPlease call them to explain: ${reason}`);
    }
  };

  const updateService = (index: number, updates: Partial<Service>) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], ...updates };
    setContent({ ...content, services: newServices });
  };

  const updateServiceFeature = (serviceIndex: number, featureIndex: number, text: string) => {
    const newServices = [...content.services];
    newServices[serviceIndex].features[featureIndex].text = text;
    setContent({ ...content, services: newServices });
  };

  const toggleServiceFeature = (serviceIndex: number, featureIndex: number) => {
    const newServices = [...content.services];
    newServices[serviceIndex].features[featureIndex].included = !newServices[serviceIndex].features[featureIndex].included;
    setContent({ ...content, services: newServices });
  };

  const addServiceFeature = (serviceIndex: number) => {
    const newServices = [...content.services];
    newServices[serviceIndex].features.push({ text: 'New Feature', included: false });
    setContent({ ...content, services: newServices });
  };

  const removeServiceFeature = (serviceIndex: number, featureIndex: number) => {
    const newServices = [...content.services];
    newServices[serviceIndex].features.splice(featureIndex, 1);
    setContent({ ...content, services: newServices });
  };

  const handleAddSlot = async () => {
    if (!newSlotDate || !newSlotTime) {
      alert('Please enter both date and time.');
      return;
    }

    const exists = availability.some(s => s.date === newSlotDate && s.time === newSlotTime);
    if (exists) {
      alert('This time slot already exists.');
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        await addAvailabilitySlotToSupabase(newSlotDate, newSlotTime);
        alert('Time slot added successfully!');
      } else {
        addAvailabilitySlot(newSlotDate, newSlotTime);
        setAvailability(loadAvailability());
        alert('Time slot added successfully!');
      }

      if (currentUser) {
        logAudit(currentUser.id, currentUser.username, 'content_update', `Added slot: ${newSlotDate} ${newSlotTime}`);
        setAuditLogs(getAuditLogs());
      }

      setNewSlotDate('');
      setNewSlotTime('');
    } catch (error: unknown) {
      console.error('Error adding slot:', error);
      alert(`Error adding time slot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      if (isSupabaseConfigured()) {
        await deleteAvailabilitySlotFromSupabase(slotId);
      } else {
        deleteAvailabilitySlot(slotId);
        setAvailability(loadAvailability());
      }
    }
  };

  const handleReleaseSlot = async (bookingId: string) => {
    if (confirm('Release this time slot and make it available again?')) {
      if (isSupabaseConfigured()) {
        await releaseAvailabilitySlotInSupabase(bookingId);
      } else {
        releaseAvailabilitySlot(bookingId);
        setAvailability(loadAvailability());
      }
      alert('Time slot has been released and is now available for booking.');
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddStartDate || !quickAddEndDate || quickAddDays.length === 0) {
      alert('Please select start date, end date, and at least one day of the week.');
      return;
    }

    const startDate = new Date(quickAddStartDate + 'T00:00:00');
    const endDate = new Date(quickAddEndDate + 'T00:00:00');
    const startTimeMinutes = parseInt(quickAddStartTime.split(':')[0]) * 60 + parseInt(quickAddStartTime.split(':')[1]);
    const endTimeMinutes = parseInt(quickAddEndTime.split(':')[0]) * 60 + parseInt(quickAddEndTime.split(':')[1]);
    const intervalMinutes = parseInt(quickAddInterval);

    if (startTimeMinutes >= endTimeMinutes) {
      alert('End time must be after start time.');
      return;
    }

    let slotsAdded = 0;
    const currentDate = new Date(startDate);

    const loadingAlert = confirm('This will add multiple time slots. Click OK to continue.');
    if (!loadingAlert) return;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

      if (quickAddDays.includes(dayName)) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        for (let timeMinutes = startTimeMinutes; timeMinutes < endTimeMinutes; timeMinutes += intervalMinutes) {
          const hours = Math.floor(timeMinutes / 60);
          const minutes = timeMinutes % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const exists = availability.some(s => s.date === dateString && s.time === timeString);
          if (!exists) {
            try {
              if (isSupabaseConfigured()) {
                await addAvailabilitySlotToSupabase(dateString, timeString);
              } else {
                addAvailabilitySlot(dateString, timeString);
              }
              slotsAdded++;
            } catch (error: unknown) {
              console.log(`Slot ${dateString} ${timeString} already exists, skipping`);
            }
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (!isSupabaseConfigured()) {
      setAvailability(loadAvailability());
    }

    if (currentUser) {
      logAudit(currentUser.id, currentUser.username, 'content_update', `Batch added ${slotsAdded} slots`);
      setAuditLogs(getAuditLogs());
    }

    alert(`Success! Added ${slotsAdded} time slots.`);

    setQuickAddStartDate('');
    setQuickAddEndDate('');
    setQuickAddDays([]);
    setQuickAddStartTime('09:00');
    setQuickAddEndTime('17:00');
    setQuickAddInterval('60');
  };

  const toggleQuickAddDay = (day: string) => {
    if (quickAddDays.includes(day)) {
      setQuickAddDays(quickAddDays.filter(d => d !== day));
    } else {
      setQuickAddDays([...quickAddDays, day]);
    }
  };

  const handleShowBookingDetails = (slotId: string) => {
    const slot = availability.find(s => s.id === slotId);
    if (slot && slot.bookingId) {
      const booking = bookings.find(b => b.id === slot.bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setShowBookingDetails(true);
      }
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      addAdminUser(newUser.username, newUser.password, newUser.fullName, newUser.role, newUser.email || undefined);
      setAdminUsers(getAdminUsers());
      setAuditLogs(getAuditLogs());
      setNewUser({ username: '', password: '', fullName: '', email: '', role: 'staff' });
      setShowAddUser(false);
      alert('User added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error adding user');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        deleteAdminUser(userId);
        setAdminUsers(getAdminUsers());
        setAuditLogs(getAuditLogs());
        alert('User deleted successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error deleting user');
      }
    }
  };

  const handleResetPassword = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    if (user) {
      setResetPasswordUserId(userId);
      setResetPasswordUsername(user.username);
      setShowResetPasswordModal(true);
      setResetPasswordMode('direct');
      setGeneratedResetCode('');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      setResetPasswordError('');
      setIsSendingResetEmail(false);
      setResetEmailSent(false);
      setResetEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex space-x-2">
              {activeTab === 'content' && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowMyAccount(true);
                  setAccountTab('password');
                  setCurrentPasswordInput('');
                  setNewPasswordInput('');
                  setConfirmNewPasswordInput('');
                  setNewUsernameInput(currentUser?.username || '');
                  setPasswordForUsernameChange('');
                  setAccountError('');
                  setAccountSuccess('');
                  setShowPasswords(false);
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                My Account
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'availability'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Availability ({availability.filter(s => !s.isBooked).length} open)
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'content'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Website Content
            </button>
            {currentUser?.role === 'owner' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Users ({adminUsers.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Audit Log
            </button>
          </div>

          {/* User Info Display */}
          {currentUser && (
            <div className="mt-3 text-sm text-gray-400">
              Logged in as: <span className="text-blue-400 font-medium">{currentUser.fullName}</span>
              {' '}(<span className="capitalize">{currentUser.role}</span>)
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Customer Bookings</CardTitle>
              <CardDescription>View and manage all booking requests from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No bookings yet. Bookings will appear here when customers submit the booking form.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="bg-gray-900 border-gray-700">
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-white mb-2">{booking.name}</h3>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-300"><strong>Phone:</strong> {booking.phone}</p>
                              {booking.email && <p className="text-gray-300"><strong>Email:</strong> {booking.email}</p>}
                              <p className="text-gray-300"><strong>Vehicle:</strong> {booking.vehicleType}</p>
                              <p className="text-gray-300"><strong>Service:</strong> {booking.service}</p>
                            </div>
                          </div>
                          <div>
                            <div className="space-y-1 text-sm mb-3">
                              {booking.date && <p className="text-gray-300"><strong>Preferred Date:</strong> {booking.date}</p>}
                              {booking.time && <p className="text-gray-300"><strong>Preferred Time:</strong> {booking.time}</p>}
                              <p className="text-gray-400 text-xs"><strong>Submitted:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                            </div>
                            {booking.notes && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-white">Notes:</p>
                                <p className="text-sm text-gray-300">{booking.notes}</p>
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => handleConfirmBooking(booking)} className="bg-green-600 hover:bg-green-700">
                                      <Check className="w-4 h-4 mr-1" />
                                      Confirm & Email
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDenyBooking(booking)}>
                                      <X className="w-4 h-4 mr-1" />
                                      Deny & Email
                                    </Button>
                                  </>
                                )}
                                {booking.status !== 'pending' && (
                                  <select
                                    value={booking.status}
                                    onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])}
                                    className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleDeleteBooking(booking.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  booking.status === 'confirmed' ? 'bg-green-600' :
                                  booking.status === 'completed' ? 'bg-blue-600' :
                                  booking.status === 'cancelled' ? 'bg-red-600' :
                                  'bg-yellow-600'
                                }`}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Tab - Simplified */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Site Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={content.siteName}
                  onChange={(e) => setContent({ ...content, siteName: e.target.value })}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Background Image URL</Label>
                  <Input
                    value={content.hero.backgroundImage}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, backgroundImage: e.target.value } })}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label>Main Heading</Label>
                  <Input
                    value={content.hero.heading}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, heading: e.target.value } })}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label>Subheading</Label>
                  <Textarea
                    value={content.hero.subheading}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheading: e.target.value } })}
                    className="bg-gray-900 border-gray-700 text-white"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={content.contact.phone}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={content.contact.email}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pb-8">
              <Button size="lg" onClick={handleSave} disabled={isSaving}>
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>Manage your availability. Customers can only book from these slots.</CardDescription>
              </CardHeader>
              <CardContent>
                {availability.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No time slots available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      availability.reduce((acc, slot) => {
                        if (!acc[slot.date]) acc[slot.date] = [];
                        acc[slot.date].push(slot);
                        return acc;
                      }, {} as Record<string, typeof availability>)
                    )
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                      .map(([date, slots]) => (
                        <div key={date} className="border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3 font-semibold text-blue-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {slots.sort((a, b) => a.time.localeCompare(b.time)).map((slot) => (
                              <div
                                key={slot.id}
                                className={`flex items-center justify-between p-3 rounded-md border ${
                                  slot.isBooked ? 'bg-red-900/20 border-red-700/50' : 'bg-green-900/20 border-green-700/50'
                                }`}
                                onClick={() => slot.isBooked && handleShowBookingDetails(slot.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className={`w-4 h-4 ${slot.isBooked ? 'text-red-400' : 'text-green-400'}`} />
                                  <span className={slot.isBooked ? 'text-red-300' : 'text-green-300'}>{formatTime(slot.time)}</span>
                                </div>
                                {!slot.isBooked && (
                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteSlot(slot.id)} className="h-6 w-6 p-0 text-red-400">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Add */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Quick Add Time Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)} className="bg-gray-900 border-gray-700 text-white" min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} className="bg-gray-900 border-gray-700 text-white" />
                  </div>
                </div>
                <Button onClick={handleAddSlot} disabled={!newSlotDate || !newSlotTime}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slot
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && currentUser?.role === 'owner' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Admin Users</CardTitle>
                <Button onClick={() => setShowAddUser(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminUsers.map((user) => (
                  <Card key={user.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-8 h-8 text-blue-400" />
                          <div>
                            <h3 className="text-white font-semibold">{user.fullName}</h3>
                            <p className="text-sm text-gray-400">@{user.username}</p>
                            <span className={`text-xs px-2 py-1 rounded ${user.role === 'owner' ? 'bg-purple-600' : user.role === 'admin' ? 'bg-blue-600' : 'bg-gray-600'}`}>{user.role.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleResetPassword(user.id)}>Reset Password</Button>
                          {user.id !== currentUser.id && (
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No activity logged yet</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 100).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded bg-gray-900 border border-gray-700">
                      <Shield className="w-4 h-4 text-blue-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{log.username}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-600">{log.action.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">Add New User</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowAddUser(false)}><X className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Username *</Label>
                <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="bg-gray-900 border-gray-700 text-white" />
              </div>
              <div>
                <Label className="text-white">Password *</Label>
                <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-gray-900 border-gray-700 text-white" />
              </div>
              <div>
                <Label className="text-white">Full Name *</Label>
                <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="bg-gray-900 border-gray-700 text-white" />
              </div>
              <div>
                <Label className="text-white">Email (for password reset)</Label>
                <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-gray-900 border-gray-700 text-white" />
              </div>
              <div>
                <Label className="text-white">Role</Label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'owner' | 'admin' | 'staff' })} className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-white">
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleAddUser}>Add User</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">Booking Details</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => { setShowBookingDetails(false); setSelectedBooking(null); }}><X className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-gray-400">Customer</Label><p className="text-white">{selectedBooking.name}</p></div>
              <div><Label className="text-gray-400">Phone</Label><p className="text-white">{selectedBooking.phone}</p></div>
              {selectedBooking.email && <div><Label className="text-gray-400">Email</Label><p className="text-white">{selectedBooking.email}</p></div>}
              <div><Label className="text-gray-400">Service</Label><p className="text-white">{selectedBooking.service}</p></div>
              <div><Label className="text-gray-400">Vehicle</Label><p className="text-white">{selectedBooking.vehicleType}</p></div>
              <div><Label className="text-gray-400">Date/Time</Label><p className="text-white">{selectedBooking.date} at {formatTime(selectedBooking.time)}</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Account Modal */}
      {showMyAccount && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5" />My Account</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowMyAccount(false)}><X className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant={accountTab === 'password' ? 'default' : 'outline'} className="flex-1" onClick={() => setAccountTab('password')}>Change Password</Button>
                <Button variant={accountTab === 'username' ? 'default' : 'outline'} className="flex-1" onClick={() => setAccountTab('username')}>Change Username</Button>
              </div>
              {accountTab === 'password' && (
                <div className="space-y-4">
                  <div><Label className="text-white">Current Password</Label><Input type="password" value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
                  <div><Label className="text-white">New Password</Label><Input type="password" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
                  <div><Label className="text-white">Confirm Password</Label><Input type="password" value={confirmNewPasswordInput} onChange={(e) => setConfirmNewPasswordInput(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
                </div>
              )}
              {accountTab === 'username' && (
                <div className="space-y-4">
                  <div><Label className="text-white">New Username</Label><Input value={newUsernameInput} onChange={(e) => setNewUsernameInput(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
                  <div><Label className="text-white">Current Password</Label><Input type="password" value={passwordForUsernameChange} onChange={(e) => setPasswordForUsernameChange(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
                </div>
              )}
              {accountError && <p className="text-red-400 text-sm">{accountError}</p>}
              {accountSuccess && <p className="text-green-400 text-sm">{accountSuccess}</p>}
              <Button className="w-full" onClick={() => {
                setAccountError(''); setAccountSuccess('');
                if (accountTab === 'password') {
                  if (newPasswordInput !== confirmNewPasswordInput) { setAccountError('Passwords do not match'); return; }
                  try { changePassword(currentUser.id, currentPasswordInput, newPasswordInput); setAccountSuccess('Password changed!'); setCurrentPasswordInput(''); setNewPasswordInput(''); setConfirmNewPasswordInput(''); } catch (e) { setAccountError(e instanceof Error ? e.message : 'Failed'); }
                } else {
                  try { changeUsername(currentUser.id, passwordForUsernameChange, newUsernameInput); setAccountSuccess('Username changed!'); const updated = refreshCurrentUser(); if (updated) setCurrentUser(updated); } catch (e) { setAccountError(e instanceof Error ? e.message : 'Failed'); }
                }
              }}>
                {accountTab === 'password' ? 'Update Password' : 'Update Username'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">Reset Password for @{resetPasswordUsername}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowResetPasswordModal(false)}><X className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-white">New Password</Label><Input type="password" value={adminNewPassword} onChange={(e) => setAdminNewPassword(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
              <div><Label className="text-white">Confirm Password</Label><Input type="password" value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} className="bg-gray-900 border-gray-700 text-white" /></div>
              {resetPasswordError && <p className="text-red-400 text-sm">{resetPasswordError}</p>}
              <Button className="w-full" onClick={() => {
                if (adminNewPassword !== adminConfirmPassword) { setResetPasswordError('Passwords do not match'); return; }
                if (adminNewPassword.length < 6) { setResetPasswordError('Minimum 6 characters'); return; }
                try { updateAdminUser(resetPasswordUserId, { password: adminNewPassword }); setAdminUsers(getAdminUsers()); setShowResetPasswordModal(false); alert('Password updated!'); } catch (e) { setResetPasswordError(e instanceof Error ? e.message : 'Failed'); }
              }}>Set New Password</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}
