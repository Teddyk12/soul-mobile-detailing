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
  type AdminUser,
  type AuditLog
} from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ArrowLeft, Save, RefreshCw, Plus, Trash2, Check, X, Calendar, Mail, Phone, LogOut, Upload, Clock, Users, FileText, Shield, User } from 'lucide-react';
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
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'staff' as 'owner' | 'admin' | 'staff' });
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
                <Label htmlFor="password" className="text-white">Password</Label>
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
                  <p className="text-red-400 text-sm">{loginError}</p>
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
      // Real-time subscription will update the state
    } else {
      updateBookingStatus(bookingId, newStatus);
      setBookings(loadBookings());
    }

    // Log audit trail
    if (currentUser && booking) {
      logAudit(currentUser.id, currentUser.username, 'booking_update', `Changed booking status for ${booking.name} to ${newStatus}`);
      setAuditLogs(getAuditLogs());
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      if (isSupabaseConfigured()) {
        await deleteBookingFromSupabase(bookingId);
        // Real-time subscription will update the state
      } else {
        deleteBooking(bookingId);
        setBookings(loadBookings());
      }
    }
  };

  const handleConfirmBooking = async (booking: Booking) => {
    // Update status to confirmed
    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(booking.id, 'confirmed');
      // Real-time subscription will update the state
    } else {
      updateBookingStatus(booking.id, 'confirmed');
      setBookings(loadBookings());
    }

    // Send confirmation email to customer
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

    // Open email client
    if (booking.email) {
      window.open(`mailto:${booking.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      alert(`Booking confirmed! Customer phone: ${booking.phone}\n\nPlease call them to confirm the appointment.`);
    }
  };

  const handleDenyBooking = async (booking: Booking) => {
    const reason = prompt('Please enter reason for denial (this will be sent to the customer):');
    if (!reason) return;

    // Update status to cancelled
    if (isSupabaseConfigured()) {
      await updateBookingStatusInSupabase(booking.id, 'cancelled');
      // Real-time subscription will update the state
    } else {
      updateBookingStatus(booking.id, 'cancelled');
      setBookings(loadBookings());
    }

    // Send denial email to customer
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

    // Open email client
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
    newServices[serviceIndex].features[featureIndex].included =
      !newServices[serviceIndex].features[featureIndex].included;
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

  // Availability management functions
  const handleAddSlot = async () => {
    console.log('handleAddSlot called', { newSlotDate, newSlotTime });

    if (!newSlotDate || !newSlotTime) {
      alert('Please enter both date and time.');
      return;
    }

    // Check if slot already exists
    const exists = availability.some(
      s => s.date === newSlotDate && s.time === newSlotTime
    );
    if (exists) {
      alert('This time slot already exists.');
      return;
    }

    try {
      console.log('Adding slot...', { isSupabase: isSupabaseConfigured() });

      if (isSupabaseConfigured()) {
        const newSlot = await addAvailabilitySlotToSupabase(newSlotDate, newSlotTime);
        console.log('Slot added to Supabase:', newSlot);
        // Real-time subscription will update the state
        alert('Time slot added successfully!');
      } else {
        const newSlot = addAvailabilitySlot(newSlotDate, newSlotTime);
        console.log('Slot added to localStorage:', newSlot);
        setAvailability(loadAvailability());
        alert('Time slot added successfully!');
      }

      // Log audit
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
        // Real-time subscription will update the state
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
        // Real-time subscription will update the state
      } else {
        releaseAvailabilitySlot(bookingId);
        setAvailability(loadAvailability());
      }
      alert('Time slot has been released and is now available for booking.');
    }
  };

  const handleQuickAdd = async () => {
    console.log('handleQuickAdd called', {
      quickAddStartDate,
      quickAddEndDate,
      quickAddDays,
      quickAddStartTime,
      quickAddEndTime,
      quickAddInterval
    });

    if (!quickAddStartDate || !quickAddEndDate || quickAddDays.length === 0) {
      alert('Please select start date, end date, and at least one day of the week.');
      return;
    }

    // Fix timezone issues by using local date parsing
    const startDate = new Date(quickAddStartDate + 'T00:00:00');
    const endDate = new Date(quickAddEndDate + 'T00:00:00');
    const startTimeMinutes = parseInt(quickAddStartTime.split(':')[0]) * 60 + parseInt(quickAddStartTime.split(':')[1]);
    const endTimeMinutes = parseInt(quickAddEndTime.split(':')[0]) * 60 + parseInt(quickAddEndTime.split(':')[1]);
    const intervalMinutes = parseInt(quickAddInterval);

    console.log('Parsed values:', { startDate, endDate, startTimeMinutes, endTimeMinutes, intervalMinutes });

    if (startTimeMinutes >= endTimeMinutes) {
      alert('End time must be after start time.');
      return;
    }

    let slotsAdded = 0;
    const currentDate = new Date(startDate);

    // Show loading indicator
    const loadingAlert = confirm('This will add multiple time slots. Click OK to continue.');
    if (!loadingAlert) return;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

      if (quickAddDays.includes(dayName)) {
        // Get date string in YYYY-MM-DD format
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
              // Slot already exists, skip
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
    // If using Supabase, real-time subscription will update the state

    console.log('Quick Add completed:', { slotsAdded });

    // Log audit
    if (currentUser) {
      logAudit(currentUser.id, currentUser.username, 'content_update', `Batch added ${slotsAdded} slots`);
      setAuditLogs(getAuditLogs());
    }

    alert(`Success! Added ${slotsAdded} time slots.`);

    // Reset form
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

  // User Management handlers
  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      addAdminUser(newUser.username, newUser.password, newUser.fullName, newUser.role);
      setAdminUsers(getAdminUsers());
      setAuditLogs(getAuditLogs());
      setNewUser({ username: '', password: '', fullName: '', role: 'staff' });
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
    const newPassword = prompt('Enter new password for this user:');
    if (newPassword && newPassword.length >= 6) {
      try {
        updateAdminUser(userId, { password: newPassword });
        setAdminUsers(getAdminUsers());
        alert('Password updated successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error updating password');
      }
    } else if (newPassword) {
      alert('Password must be at least 6 characters long');
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
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmBooking(booking)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Confirm & Email
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDenyBooking(booking)}
                                    >
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                >
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

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Site Name */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Site Name</CardTitle>
                <CardDescription>Update your website's name</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={content.siteName}
                      onChange={(e) => setContent({ ...content, siteName: e.target.value })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main banner at the top of your homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heroImage">Background Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="heroImage"
                        value={content.hero.backgroundImage.startsWith('data:') ? 'Uploaded Image' : content.hero.backgroundImage}
                        onChange={(e) => setContent({
                          ...content,
                          hero: { ...content.hero, backgroundImage: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white flex-1"
                        placeholder="https://example.com/image.jpg or upload below"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('heroImageUpload')?.click()}
                        className="shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <input
                        id="heroImageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (imageUrl) => {
                          setContent({
                            ...content,
                            hero: { ...content.hero, backgroundImage: imageUrl }
                          });
                        })}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Upload an image or paste a URL. Max size: 5MB</p>
                    {content.hero.backgroundImage && (
                      <div className="mt-2 relative h-40 rounded overflow-hidden">
                        <img src={content.hero.backgroundImage} alt="Hero preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="heroHeading">Main Heading</Label>
                    <Input
                      id="heroHeading"
                      value={content.hero.heading}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, heading: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroSubheading">Subheading</Label>
                    <Textarea
                      id="heroSubheading"
                      value={content.hero.subheading}
                      onChange={(e) => setContent({
                        ...content,
                        hero: { ...content.hero, subheading: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage your service packages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {content.services.map((service, serviceIndex) => (
                    <Card key={service.id} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg">Service {serviceIndex + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Badge Text</Label>
                            <Input
                              value={service.badge}
                              onChange={(e) => updateService(serviceIndex, { badge: e.target.value })}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateService(serviceIndex, { price: Number(e.target.value) })}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Service Title</Label>
                          <Input
                            value={service.title}
                            onChange={(e) => updateService(serviceIndex, { title: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={service.description}
                            onChange={(e) => updateService(serviceIndex, { description: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Image</Label>
                          <div className="flex gap-2">
                            <Input
                              value={service.image.startsWith('data:') ? 'Uploaded Image' : service.image}
                              onChange={(e) => updateService(serviceIndex, { image: e.target.value })}
                              className="bg-gray-800 border-gray-600 text-white flex-1"
                              placeholder="https://example.com/service-image.jpg or upload below"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`serviceImageUpload${serviceIndex}`)?.click()}
                              className="shrink-0"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                            <input
                              id={`serviceImageUpload${serviceIndex}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (imageUrl) => {
                                updateService(serviceIndex, { image: imageUrl });
                              })}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Upload an image or paste a URL. Max size: 5MB</p>
                          {service.image && (
                            <div className="mt-2 relative h-32 rounded overflow-hidden">
                              <img src={service.image} alt="Service preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={service.duration}
                            onChange={(e) => updateService(serviceIndex, { duration: Number(e.target.value) })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Features</Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addServiceFeature(serviceIndex)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Feature
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant={feature.included ? "default" : "outline"}
                                  onClick={() => toggleServiceFeature(serviceIndex, featureIndex)}
                                  className="shrink-0"
                                >
                                  {feature.included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </Button>
                                <Input
                                  value={feature.text}
                                  onChange={(e) => updateServiceFeature(serviceIndex, featureIndex, e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeServiceFeature(serviceIndex, featureIndex)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Company information and stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Heading</Label>
                    <Input
                      value={content.about.heading}
                      onChange={(e) => setContent({
                        ...content,
                        about: { ...content.about, heading: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label>First Paragraph</Label>
                    <Textarea
                      value={content.about.paragraph1}
                      onChange={(e) => setContent({
                        ...content,
                        about: { ...content.about, paragraph1: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Second Paragraph</Label>
                    <Textarea
                      value={content.about.paragraph2}
                      onChange={(e) => setContent({
                        ...content,
                        about: { ...content.about, paragraph2: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stat 1 Value</Label>
                      <Input
                        value={content.about.stat1Value}
                        onChange={(e) => setContent({
                          ...content,
                          about: { ...content.about, stat1Value: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label>Stat 1 Label</Label>
                      <Input
                        value={content.about.stat1Label}
                        onChange={(e) => setContent({
                          ...content,
                          about: { ...content.about, stat1Label: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stat 2 Value</Label>
                      <Input
                        value={content.about.stat2Value}
                        onChange={(e) => setContent({
                          ...content,
                          about: { ...content.about, stat2Value: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label>Stat 2 Label</Label>
                      <Input
                        value={content.about.stat2Label}
                        onChange={(e) => setContent({
                          ...content,
                          about: { ...content.about, stat2Label: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={content.about.image.startsWith('data:') ? 'Uploaded Image' : content.about.image}
                        onChange={(e) => setContent({
                          ...content,
                          about: { ...content.about, image: e.target.value }
                        })}
                        className="bg-gray-900 border-gray-700 text-white flex-1"
                        placeholder="https://example.com/about-image.jpg or upload below"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('aboutImageUpload')?.click()}
                        className="shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <input
                        id="aboutImageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (imageUrl) => {
                          setContent({
                            ...content,
                            about: { ...content.about, image: imageUrl }
                          });
                        })}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Upload an image or paste a URL. Max size: 5MB</p>
                    {content.about.image && (
                      <div className="mt-2 relative h-40 rounded overflow-hidden">
                        <img src={content.about.image} alt="About preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Your business contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={content.contact.phone}
                      onChange={(e) => setContent({
                        ...content,
                        contact: { ...content.contact, phone: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={content.contact.email}
                      onChange={(e) => setContent({
                        ...content,
                        contact: { ...content.contact, email: e.target.value }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label>Weekday Hours</Label>
                    <Input
                      value={content.contact.hours.weekday}
                      onChange={(e) => setContent({
                        ...content,
                        contact: {
                          ...content.contact,
                          hours: { ...content.contact.hours, weekday: e.target.value }
                        }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label>Saturday Hours</Label>
                    <Input
                      value={content.contact.hours.saturday}
                      onChange={(e) => setContent({
                        ...content,
                        contact: {
                          ...content.contact,
                          hours: { ...content.contact.hours, saturday: e.target.value }
                        }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label>Sunday Hours</Label>
                    <Input
                      value={content.contact.hours.sunday}
                      onChange={(e) => setContent({
                        ...content,
                        contact: {
                          ...content.contact,
                          hours: { ...content.contact.hours, sunday: e.target.value }
                        }
                      })}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button (Bottom) */}
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
            {/* Available Time Slots */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Available Time Slots</CardTitle>
                    <CardDescription>
                      Manage your availability. Customers can only book from these slots.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const today = new Date().toISOString().split('T')[0];
                        const oldSlots = availability.filter(s => s.date < today && !s.isBooked);
                        if (oldSlots.length === 0) {
                          alert('No past slots to delete.');
                          return;
                        }
                        if (confirm(`Delete ${oldSlots.length} past slots?`)) {
                          for (const slot of oldSlots) {
                            if (isSupabaseConfigured()) {
                              await deleteAvailabilitySlotFromSupabase(slot.id);
                            } else {
                              deleteAvailabilitySlot(slot.id);
                            }
                          }
                          if (!isSupabaseConfigured()) {
                            setAvailability(loadAvailability());
                          }
                          alert(`Deleted ${oldSlots.length} past slots.`);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear Past
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const availableSlots = availability.filter(s => !s.isBooked);
                        if (availableSlots.length === 0) {
                          alert('No available slots to delete.');
                          return;
                        }
                        if (confirm(`Delete ALL ${availableSlots.length} available slots? Booked slots will remain.`)) {
                          for (const slot of availableSlots) {
                            if (isSupabaseConfigured()) {
                              await deleteAvailabilitySlotFromSupabase(slot.id);
                            } else {
                              deleteAvailabilitySlot(slot.id);
                            }
                          }
                          if (!isSupabaseConfigured()) {
                            setAvailability(loadAvailability());
                          }
                          alert('All available slots deleted.');
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {availability.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No time slots available yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Add slots above to start accepting bookings.</p>
                  </div>
                ) : (
                  <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-900 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{availability.length}</div>
                        <div className="text-xs text-gray-400">Total Slots</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{availability.filter(s => !s.isBooked).length}</div>
                        <div className="text-xs text-gray-400">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{availability.filter(s => s.isBooked).length}</div>
                        <div className="text-xs text-gray-400">Booked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {(() => {
                            const uniqueDates = new Set(availability.map(s => s.date));
                            return uniqueDates.size;
                          })()}
                        </div>
                        <div className="text-xs text-gray-400">Days Scheduled</div>
                      </div>
                    </div>
                  </>
                )}
                {availability.length > 0 && (
                  <div className="space-y-4">
                    {/* Group slots by date */}
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
                            <span>
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {slots
                              .sort((a, b) => a.time.localeCompare(b.time))
                              .map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`flex items-center justify-between p-3 rounded-md border ${
                                    slot.isBooked
                                      ? 'bg-red-900/20 border-red-700/50 cursor-pointer hover:bg-red-900/30'
                                      : 'bg-green-900/20 border-green-700/50'
                                  }`}
                                  onClick={() => {
                                    if (slot.isBooked) {
                                      handleShowBookingDetails(slot.id);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${slot.isBooked ? 'text-red-400' : 'text-green-400'}`} />
                                    <span className={slot.isBooked ? 'text-red-300' : 'text-green-300'}>
                                      {formatTime(slot.time)}
                                    </span>
                                    {slot.isBooked && (
                                      <span className="text-xs text-red-400">(click for details)</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {slot.isBooked && slot.bookingId && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleReleaseSlot(slot.bookingId!)}
                                        className="h-6 w-6 p-0 text-yellow-400 hover:text-yellow-300"
                                        title="Release slot"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                      </Button>
                                    )}
                                    {!slot.isBooked && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteSlot(slot.id)}
                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Add - Redesigned */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl">⚡ Quick Add Time Slots</CardTitle>
                <CardDescription>Easily create multiple availability slots at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">

                  {/* Mode Switcher */}
                  <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-700 w-fit">
                    <button
                      type="button"
                      onClick={() => setQuickAddMode('single')}
                      className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                        quickAddMode === 'single'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Single Slot
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAddMode('batch')}
                      className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                        quickAddMode === 'batch'
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Batch Slots
                    </button>
                  </div>

                  {/* Single Slot Mode */}
                  {quickAddMode === 'single' && (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <Label className="text-lg font-semibold text-blue-400 mb-4 block">Add a Single Time Slot</Label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-gray-400 mb-1 block">Date</Label>
                          <Input
                            type="date"
                            value={newSlotDate}
                            onChange={(e) => setNewSlotDate(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white h-11"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-gray-400 mb-1 block">Time</Label>
                          <Input
                            type="time"
                            value={newSlotTime}
                            onChange={(e) => setNewSlotTime(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white h-11"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleAddSlot}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
                        disabled={!newSlotDate || !newSlotTime}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add This Slot
                      </Button>
                    </div>
                  )}

                  {/* Batch Slots Mode */}
                  {quickAddMode === 'batch' && (
                    <>
                      {/* Step 1: Date Range */}
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <Label className="text-lg font-semibold text-blue-400 mb-3 block">Step 1: Choose Date Range</Label>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label className="text-sm text-gray-400 mb-1 block">From</Label>
                            <Input
                              type="date"
                              value={quickAddStartDate}
                              onChange={(e) => setQuickAddStartDate(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white h-11"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-400 mb-1 block">To</Label>
                            <Input
                              type="date"
                              value={quickAddEndDate}
                              onChange={(e) => setQuickAddEndDate(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white h-11"
                              min={quickAddStartDate || new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const today = new Date();
                              const next7 = new Date(today);
                              next7.setDate(today.getDate() + 7);
                              setQuickAddStartDate(today.toISOString().split('T')[0]);
                              setQuickAddEndDate(next7.toISOString().split('T')[0]);
                            }}
                          >
                            Next 7 Days
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const today = new Date();
                              const next30 = new Date(today);
                              next30.setDate(today.getDate() + 30);
                              setQuickAddStartDate(today.toISOString().split('T')[0]);
                              setQuickAddEndDate(next30.toISOString().split('T')[0]);
                            }}
                          >
                            Next 30 Days
                          </Button>
                        </div>
                      </div>

                      {/* Step 2: Select Days */}
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <Label className="text-lg font-semibold text-blue-400 mb-3 block">Step 2: Select Days of the Week</Label>
                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const isSelected = quickAddDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleQuickAddDay(day)}
                                className={`h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-400 text-white scale-105'
                                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-blue-500'
                                }`}
                              >
                                <span className="text-xs font-bold mb-1">{day.substring(0, 3).toUpperCase()}</span>
                                <span className="text-[10px]">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                {isSelected && <Check className="w-4 h-4 mt-1" />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setQuickAddDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])}
                          >
                            Mon-Fri
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setQuickAddDays(['saturday'])}
                          >
                            Saturday Only
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setQuickAddDays([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>

                      {/* Step 3: Set Times */}
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <Label className="text-lg font-semibold text-blue-400 mb-3 block">Step 3: Set Working Hours</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm text-gray-400 mb-1 block">Start Time</Label>
                            <Input
                              type="time"
                              value={quickAddStartTime}
                              onChange={(e) => setQuickAddStartTime(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white h-11"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-400 mb-1 block">End Time</Label>
                            <Input
                              type="time"
                              value={quickAddEndTime}
                              onChange={(e) => setQuickAddEndTime(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white h-11"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-400 mb-1 block">Time Slots Every</Label>
                            <select
                              value={quickAddInterval}
                              onChange={(e) => setQuickAddInterval(e.target.value)}
                              className="flex h-11 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                            >
                              <option value="30">30 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                              <option value="150">2.5 hours</option>
                              <option value="180">3 hours</option>
                              <option value="210">3.5 hours</option>
                              <option value="240">4 hours</option>
                              <option value="270">4.5 hours</option>
                              <option value="300">5 hours</option>
                              <option value="330">5.5 hours</option>
                              <option value="360">6 hours</option>
                              <option value="390">6.5 hours</option>
                              <option value="420">7 hours</option>
                              <option value="450">7.5 hours</option>
                              <option value="480">8 hours</option>
                              <option value="510">8.5 hours</option>
                              <option value="540">9 hours</option>
                              <option value="570">9.5 hours</option>
                              <option value="600">10 hours</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setQuickAddStartTime('08:00');
                              setQuickAddEndTime('18:00');
                              setQuickAddInterval('60');
                            }}
                          >
                            8AM - 6PM (1hr slots)
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setQuickAddStartTime('09:00');
                              setQuickAddEndTime('17:00');
                              setQuickAddInterval('60');
                            }}
                          >
                            9AM - 5PM (1hr slots)
                          </Button>
                        </div>
                      </div>

                      {/* Summary */}
                      {quickAddStartDate && quickAddEndDate && quickAddDays.length > 0 && (
                        <div className="bg-green-900/20 border-2 border-green-600 rounded-lg p-4">
                          <Label className="text-green-400 font-bold text-base mb-2 block">✓ Ready to Generate</Label>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400">Dates:</span>
                              <p className="text-white font-semibold">{quickAddStartDate} to {quickAddEndDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Days:</span>
                              <p className="text-white font-semibold">{quickAddDays.map(d => d.substring(0,3)).join(', ')}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Hours:</span>
                              <p className="text-white font-semibold">{quickAddStartTime} - {quickAddEndTime}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Interval:</span>
                              <p className="text-white font-semibold">{quickAddInterval} min slots</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generate Button */}
                      <Button
                        onClick={handleQuickAdd}
                        className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg"
                        disabled={!quickAddStartDate || !quickAddEndDate || quickAddDays.length === 0}
                      >
                        <Plus className="w-6 h-6 mr-2" />
                        Generate Time Slots
                      </Button>

                      {(!quickAddStartDate || !quickAddEndDate || quickAddDays.length === 0) && (
                        <p className="text-center text-sm text-gray-500">Complete all steps above to generate slots</p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && currentUser?.role === 'owner' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>Manage admin panel access</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddUser(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {adminUsers.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((user) => (
                      <Card key={user.id} className="bg-gray-900 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <User className="w-8 h-8 text-blue-400" />
                                <div>
                                  <h3 className="text-white font-semibold">{user.fullName}</h3>
                                  <p className="text-sm text-gray-400">@{user.username}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      user.role === 'owner' ? 'bg-purple-600' :
                                      user.role === 'admin' ? 'bg-blue-600' :
                                      'bg-gray-600'
                                    }`}>
                                      {user.role.toUpperCase()}
                                    </span>
                                    {user.lastLogin && (
                                      <span className="text-xs text-gray-500">
                                        Last login: {new Date(user.lastLogin).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetPassword(user.id)}
                              >
                                Reset Password
                              </Button>
                              {user.id !== currentUser.id && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={user.role === 'owner' && adminUsers.filter(u => u.role === 'owner').length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">Add New User</CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUser({ username: '', password: '', fullName: '', role: 'staff' });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newUsername" className="text-white">Username *</Label>
                      <Input
                        id="newUsername"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-white">Password *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newFullName" className="text-white">Full Name *</Label>
                      <Input
                        id="newFullName"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        className="bg-gray-900 border-gray-700 text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newRole" className="text-white">Role *</Label>
                      <select
                        id="newRole"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'owner' | 'admin' | 'staff' })}
                        className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-white shadow-sm"
                      >
                        <option value="staff">Staff - View only</option>
                        <option value="admin">Admin - Full access except user management</option>
                        <option value="owner">Owner - Full access including user management</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1"
                        onClick={handleAddUser}
                      >
                        Add User
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => {
                          setShowAddUser(false);
                          setNewUser({ username: '', password: '', fullName: '', role: 'staff' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Track all admin panel activity</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No activity logged yet</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.slice(0, 100).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className={`p-2 rounded ${
                        log.action === 'login' ? 'bg-green-600/20 text-green-400' :
                        log.action === 'logout' ? 'bg-gray-600/20 text-gray-400' :
                        log.action === 'content_update' ? 'bg-blue-600/20 text-blue-400' :
                        log.action === 'booking_update' ? 'bg-purple-600/20 text-purple-400' :
                        log.action === 'availability_update' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{log.username}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            log.action === 'login' ? 'bg-green-600' :
                            log.action === 'logout' ? 'bg-gray-600' :
                            log.action === 'content_update' ? 'bg-blue-600' :
                            log.action === 'booking_update' ? 'bg-purple-600' :
                            log.action === 'availability_update' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {log.action.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length > 100 && (
                    <p className="text-center text-sm text-gray-500 pt-4">
                      Showing latest 100 of {auditLogs.length} logs
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Details Modal */}
        {showBookingDetails && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white">Booking Details</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowBookingDetails(false);
                      setSelectedBooking(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-gray-400">Customer Name</Label>
                  <p className="text-white font-semibold">{selectedBooking.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Phone</Label>
                  <p className="text-white">{selectedBooking.phone}</p>
                </div>
                {selectedBooking.email && (
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <p className="text-white">{selectedBooking.email}</p>
                  </div>
                )}
                {selectedBooking.address && (
                  <div>
                    <Label className="text-gray-400">Service Address</Label>
                    <p className="text-white">{selectedBooking.address}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-400">Vehicle</Label>
                  <p className="text-white">{selectedBooking.vehicleType}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Service</Label>
                  <p className="text-white">{selectedBooking.service}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Appointment</Label>
                  <p className="text-white">
                    {new Date(selectedBooking.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {formatTime(selectedBooking.time)}
                  </p>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <Label className="text-gray-400">Notes</Label>
                    <p className="text-white">{selectedBooking.notes}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-400">Status</Label>
                  <p className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedBooking.status === 'confirmed' ? 'bg-green-600' :
                    selectedBooking.status === 'completed' ? 'bg-blue-600' :
                    selectedBooking.status === 'cancelled' ? 'bg-red-600' :
                    'bg-yellow-600'
                  }`}>
                    {selectedBooking.status.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (selectedBooking.email) {
                        window.open(`mailto:${selectedBooking.email}`);
                      }
                    }}
                    disabled={!selectedBooking.email}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      window.open(`tel:${selectedBooking.phone}`);
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format time in 12-hour format
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}
