'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  saveBooking,
  saveBookingToSupabase,
  getAvailableSlots,
  getAvailableSlotsFromSupabase,
  bookAvailabilitySlot,
  bookAvailabilitySlotInSupabase,
  type AvailabilitySlot
} from '@/lib/content';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Calendar, Clock } from 'lucide-react';

interface BookingFormProps {
  children: React.ReactNode;
  selectedService?: string;
}

// Helper function to format time in 12-hour format
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function BookingForm({ children, selectedService }: BookingFormProps) {
  const [open, setOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    vehicleType: '',
    service: selectedService || '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      // Load available slots when dialog opens
      const loadSlots = async () => {
        if (isSupabaseConfigured()) {
          const slots = await getAvailableSlotsFromSupabase();
          setAvailableSlots(slots);
        } else {
          setAvailableSlots(getAvailableSlots());
        }
      };
      loadSlots();
    }
  }, [open]);

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert('Please select an available date and time.');
      return;
    }

    // Save booking to admin panel
    try {
      let booking;
      if (isSupabaseConfigured()) {
        // Use Supabase for real-time multi-user support
        booking = await saveBookingToSupabase({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          vehicleType: formData.vehicleType,
          service: formData.service,
          date: selectedSlot.date,
          time: selectedSlot.time,
          notes: formData.notes,
        });

        // Mark slot as booked in Supabase
        await bookAvailabilitySlotInSupabase(selectedSlot.id, booking.id);
      } else {
        // Fallback to localStorage
        booking = saveBooking({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          vehicleType: formData.vehicleType,
          service: formData.service,
          date: selectedSlot.date,
          time: selectedSlot.time,
          notes: formData.notes,
        });

        // Mark slot as booked in localStorage
        bookAvailabilitySlot(selectedSlot.id, booking.id);
      }

      // Send confirmation emails
      try {
        const emailResponse = await fetch('/api/send-booking-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            vehicleType: formData.vehicleType,
            service: formData.service,
            date: selectedSlot.date,
            time: selectedSlot.time,
            notes: formData.notes,
          }),
        });

        if (emailResponse.ok) {
          alert('Booking confirmed! A confirmation email has been sent to you. We will contact you shortly.');
        } else {
          alert('Booking saved! However, we had trouble sending the confirmation email. We will contact you shortly.');
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        alert('Booking saved! However, we had trouble sending the confirmation email. We will contact you shortly.');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Error submitting booking. Please try again.');
      return;
    }

    // Close dialog
    setOpen(false);

    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      vehicleType: '',
      service: selectedService || '',
      notes: '',
    });
    setSelectedSlot(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Book Your Detailing Service</DialogTitle>
          <DialogDescription className="text-gray-300">
            Fill out the form below and we'll get back to you shortly to confirm your appointment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="(206) 396-9579"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Service Address *</Label>
            <Input
              id="address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="123 Main St, Seattle, WA 98101"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <select
              id="vehicleType"
              required
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select vehicle type</option>
              <option value="Coupe">Coupe</option>
              <option value="Sedan">Sedan</option>
              <option value="Wagon">Wagon</option>
              <option value="Small SUV">Small SUV</option>
              <option value="Small Truck">Small Truck</option>
              <option value="Large Truck">Large Truck</option>
              <option value="Large SUV">Large SUV</option>
              <option value="Mini-Van">Mini-Van</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service Package *</Label>
            <select
              id="service"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="flex h-9 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a service</option>
              <option value="Interior Only - $169.99">Interior Only - $169.99</option>
              <option value="Exterior Only - $159.99">Exterior Only - $159.99</option>
              <option value="Gold Package - $189.99">Gold Package - $189.99</option>
              <option value="Platinum Package - $229.99">Platinum Package - $229.99</option>
              <option value="Full Package - $279.99">Full Package - $279.99</option>
              <option value="Diamond Package - $359.99">Diamond Package - $359.99</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Select Available Date & Time *</Label>
            {availableSlots.length === 0 ? (
              <div className="bg-gray-900 border border-gray-700 rounded-md p-4 text-center">
                <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No available time slots at the moment.</p>
                <p className="text-gray-500 text-xs mt-1">Please check back later or contact us directly.</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-700 rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                {Object.keys(slotsByDate).sort().map((date) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pl-6">
                      {slotsByDate[date].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'bg-blue-600 text-white border-2 border-blue-400'
                              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedSlot && (
              <div className="bg-blue-600/20 border border-blue-600/50 rounded-md p-3 text-sm">
                <p className="text-blue-300">
                  <strong>Selected:</strong> {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime(selectedSlot.time)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Any special requests or questions?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedSlot || availableSlots.length === 0}
            >
              {selectedSlot ? 'Confirm Booking' : 'Select Time Slot'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            {availableSlots.length > 0
              ? "Select a time slot above to book your appointment."
              : "No available slots. Please contact us directly at 206 788 5850."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
