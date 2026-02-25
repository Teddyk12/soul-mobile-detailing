import { supabase, isSupabaseConfigured } from './supabase';

export interface ServiceFeature {
  text: string;
  included: boolean;
}

export interface Service {
  id: string;
  badge: string;
  image: string;
  title: string;
  price: number;
  description: string;
  features: ServiceFeature[];
  duration: number;
}

export interface HeroContent {
  backgroundImage: string;
  heading: string;
  subheading: string;
}

export interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  image: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
}

export interface WebsiteContent {
  siteName: string;
  hero: HeroContent;
  features: FeatureCard[];
  services: Service[];
  about: AboutContent;
  contact: ContactInfo;
}

export const defaultContent: WebsiteContent = {
  siteName: "Soul Mobile Detailing LLC",
  hero: {
    backgroundImage: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1920&h=1080&fit=crop&q=80",
    heading: "Soul Mobile Detailing",
    subheading: "Professional mobile detailing services that restore your vehicle's beauty and protect your investment"
  },
  features: [
    {
      icon: "sparkles",
      title: "Premium Products",
      description: "We use only the highest quality detailing products and equipment for superior results"
    },
    {
      icon: "shield",
      title: "Satisfaction Guarantee",
      description: "100% satisfaction guaranteed or we'll make it right - your happiness is our priority"
    },
    {
      icon: "clock",
      title: "Mobile Convenience",
      description: "We come to your location - home, office, or anywhere in our service area"
    }
  ],
  services: [
    {
      id: "interior",
      badge: "Interior Only",
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop&q=80",
      title: "Interior Only",
      price: 169.99,
      description: "Complete interior detailing service (3 hours)",
      features: [
        { text: "Vacuum interior carpets, mats, seats & trunk", included: true },
        { text: "Clean & polish dash, console, glove box", included: true },
        { text: "Getting in all cracks and crevices", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Clean & polish all door panels", included: true },
        { text: "Wipe & clean all door jambs", included: true },
        { text: "Spot shampooing (upgrade to full $50)", included: false },
        { text: "Pet-hair removal (add $50/hr)", included: false }
      ],
      duration: 180
    },
    {
      id: "exterior",
      badge: "Exterior Only",
      image: "https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80",
      title: "Exterior Only",
      price: 159.99,
      description: "Professional exterior detailing service (3 hours)",
      features: [
        { text: "Hand wash & Dry", included: true },
        { text: "Remove road tar and pitch", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Clean & dress wheels, tires", included: true },
        { text: "Remove contaminants with clay bar", included: true },
        { text: "Polish and hand wax or ceramic spray wax", included: true }
      ],
      duration: 180
    },
    {
      id: "gold",
      badge: "Value",
      image: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop&q=80",
      title: "Gold Package",
      price: 189.99,
      description: "Quick professional detail inside and out (2.5 hours)",
      features: [
        { text: "Hand wash and dry", included: true },
        { text: "Quick vacuum interior carpets & trunk", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Clean & dress wheels and tires", included: true },
        { text: "Wipe down door panels & dash", included: true },
        { text: "Wipe & clean door & trunk jambs", included: true },
        { text: "Spray on wax or ceramic spray wax", included: true }
      ],
      duration: 150
    },
    {
      id: "platinum",
      badge: "Popular",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80",
      title: "Platinum Package",
      price: 229.99,
      description: "Comprehensive detail service (3 hours)",
      features: [
        { text: "Hand wash and dry", included: true },
        { text: "Vacuum interior carpets & trunk", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Clean & dress wheels and tires", included: true },
        { text: "Wipe down dash and door panels", included: true },
        { text: "Clean & polish door panels", included: true },
        { text: "Wipe & clean door, trunk jambs", included: true },
        { text: "Spray on wax or ceramic spray wax", included: true }
      ],
      duration: 180
    },
    {
      id: "full",
      badge: "Best for Resale",
      image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop&q=80",
      title: "Full Package",
      price: 279.99,
      description: "Recommended for those selling their vehicle (4 hours)",
      features: [
        { text: "Hand wash and dry", included: true },
        { text: "Vacuum interior carpets & trunk", included: true },
        { text: "Clean & polish dashboard, console & glove box", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Wipe & clean door & trunk jambs", included: true },
        { text: "Clean & polish door panels", included: true },
        { text: "Spot Shampoo interior (upgrade to full $50)", included: true },
        { text: "Clean & dress wheels and tires", included: true },
        { text: "De-grease engine & dress", included: true },
        { text: "Spray wax or ceramic spray wax", included: true }
      ],
      duration: 240
    },
    {
      id: "diamond",
      badge: "Ultimate",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80",
      title: "Diamond Package",
      price: 359.99,
      description: "Our most comprehensive detailing service (5 hours)",
      features: [
        { text: "Hand wash and dry", included: true },
        { text: "Vacuum & shampoo interior carpets & seats", included: true },
        { text: "Steam clean interior where needed", included: true },
        { text: "Treat & condition all leather and vinyl", included: true },
        { text: "Clean & polish dash, console, door panels", included: true },
        { text: "Clean interior & exterior windows", included: true },
        { text: "Wipe & clean door & trunk jambs", included: true },
        { text: "Clean & dress wheels and tires", included: true },
        { text: "De-grease engine & dress", included: true },
        { text: "Remove contaminants with clay-bar", included: true },
        { text: "Revive all exterior trims", included: true },
        { text: "Paint polish with hand wax/sealant/ceramic", included: true }
      ],
      duration: 300
    }
  ],
  about: {
    heading: "About Soul Mobile Detailing",
    paragraph1: "With over 3 years of experience in automotive detailing, Soul Mobile Detailing brings professional mobile services directly to your location. We specialize in both interior and exterior detailing services that protect and enhance your vehicle's appearance.",
    paragraph2: "Our mobile detailing service comes to you wherever you are. We use only premium products and proven techniques to deliver results that exceed expectations, all from the convenience of your driveway, office parking lot, or any location you prefer.",
    stat1Label: "Cars Detailed",
    stat1Value: "1000+",
    stat2Label: "Customer Satisfaction",
    stat2Value: "98%",
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&h=800&fit=crop&q=80"
  },
  contact: {
    phone: "425 574 6475",
    email: "soulmobiledetailingllc@gmail.com",
    hours: {
      weekday: "Mon-Fri: 8AM-6PM",
      saturday: "Sat: 8AM-4PM",
      sunday: "Sun: By Appointment"
    }
  }
};

// ============================================
// STORAGE FUNCTIONS - HYBRID APPROACH
// ============================================

// Storage functions
export function saveContent(content: WebsiteContent): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('websiteContent', JSON.stringify(content));
  }
}

export function loadContent(): WebsiteContent {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('websiteContent');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored content:', e);
      }
    }
  }
  return defaultContent;
}

export function resetContent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('websiteContent');
  }
}

// NEW: Supabase content functions
export async function saveContentToSupabase(content: WebsiteContent): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using localStorage only');
    saveContent(content);
    return;
  }

  try {
    // Get the first (and only) content record
    const { data: existing } = await supabase
      .from('website_content')
      .select('id')
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('website_content')
        .update({
          site_name: content.siteName,
          hero: content.hero,
          features: content.features,
          services: content.services,
          about: content.about,
          contact: content.contact,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('website_content')
        .insert({
          site_name: content.siteName,
          hero: content.hero,
          features: content.features,
          services: content.services,
          about: content.about,
          contact: content.contact
        });

      if (error) throw error;
    }

    // Also save to localStorage as backup
    saveContent(content);
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    // Fallback to localStorage
    saveContent(content);
    throw error;
  }
}

export async function loadContentFromSupabase(): Promise<WebsiteContent> {
  if (!isSupabaseConfigured()) {
    return loadContent();
  }

  try {
    const { data, error } = await supabase
      .from('website_content')
      .select('*')
      .single();

    if (error) throw error;

    if (data) {
      const content: WebsiteContent = {
        siteName: data.site_name,
        hero: data.hero,
        features: data.features,
        services: data.services,
        about: data.about,
        contact: data.contact
      };

      // Cache in localStorage
      saveContent(content);
      return content;
    }
  } catch (error) {
    console.error('Error loading from Supabase:', error);
  }

  // Fallback to localStorage
  return loadContent();
}

// Booking types and functions
export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  vehicleType: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface AvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format (e.g., "09:00", "14:30")
  isBooked: boolean;
  bookingId?: string; // Reference to booking if slot is taken
}

// ============================================
// BOOKING FUNCTIONS - LOCAL STORAGE
// ============================================

export function saveBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save booking on server');
  }

  const newBooking: Booking = {
    ...booking,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const bookings = loadBookings();
  bookings.unshift(newBooking);
  localStorage.setItem('bookings', JSON.stringify(bookings));

  return newBooking;
}

export function loadBookings(): Booking[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('bookings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing bookings:', e);
    }
  }
  return [];
}

export function updateBookingStatus(id: string, status: Booking['status']): void {
  if (typeof window === 'undefined') return;

  const bookings = loadBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index].status = status;
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }
}

export function deleteBooking(id: string): void {
  if (typeof window === 'undefined') return;

  const bookings = loadBookings();
  const filtered = bookings.filter(b => b.id !== id);
  localStorage.setItem('bookings', JSON.stringify(filtered));
}

// ============================================
// BOOKING FUNCTIONS - SUPABASE
// ============================================

export async function saveBookingToSupabase(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  if (!isSupabaseConfigured()) {
    return saveBooking(booking);
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        address: booking.address,
        vehicle_type: booking.vehicleType,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    const newBooking: Booking = {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      vehicleType: data.vehicle_type,
      service: data.service,
      date: data.date,
      time: data.time,
      notes: data.notes,
      createdAt: data.created_at,
      status: data.status
    };

    // Also save to localStorage as backup
    const bookings = loadBookings();
    bookings.unshift(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    return newBooking;
  } catch (error) {
    console.error('Error saving booking to Supabase:', error);
    return saveBooking(booking);
  }
}

export async function loadBookingsFromSupabase(): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return loadBookings();
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const bookings: Booking[] = data.map((b: Record<string, unknown>) => ({
      id: b.id as string,
      name: b.name as string,
      phone: b.phone as string,
      email: b.email as string,
      address: b.address as string,
      vehicleType: b.vehicle_type as string,
      service: b.service as string,
      date: b.date as string,
      time: b.time as string,
      notes: b.notes as string,
      createdAt: b.created_at as string,
      status: b.status as Booking['status']
    }));

    // Cache in localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return bookings;
  } catch (error) {
    console.error('Error loading bookings from Supabase:', error);
    return loadBookings();
  }
}

export async function updateBookingStatusInSupabase(id: string, status: Booking['status']): Promise<void> {
  if (!isSupabaseConfigured()) {
    updateBookingStatus(id, status);
    return;
  }

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    // Also update localStorage
    updateBookingStatus(id, status);
  } catch (error) {
    console.error('Error updating booking status in Supabase:', error);
    updateBookingStatus(id, status);
  }
}

export async function deleteBookingFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    deleteBooking(id);
    return;
  }

  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Also delete from localStorage
    deleteBooking(id);
  } catch (error) {
    console.error('Error deleting booking from Supabase:', error);
    deleteBooking(id);
  }
}

// ============================================
// AVAILABILITY FUNCTIONS - LOCAL STORAGE
// ============================================

// Availability management functions
export function loadAvailability(): AvailabilitySlot[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('availability');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing availability:', e);
    }
  }
  return [];
}

export function saveAvailability(slots: AvailabilitySlot[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('availability', JSON.stringify(slots));
}

export function addAvailabilitySlot(date: string, time: string): AvailabilitySlot {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add slot on server');
  }

  const newSlot: AvailabilitySlot = {
    id: Math.random().toString(36).substr(2, 9),
    date,
    time,
    isBooked: false
  };

  const slots = loadAvailability();
  slots.push(newSlot);
  slots.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
  saveAvailability(slots);

  return newSlot;
}

export function deleteAvailabilitySlot(id: string): void {
  if (typeof window === 'undefined') return;

  const slots = loadAvailability();
  const filtered = slots.filter(s => s.id !== id);
  saveAvailability(filtered);
}

export function bookAvailabilitySlot(slotId: string, bookingId: string): void {
  if (typeof window === 'undefined') return;

  const slots = loadAvailability();
  const slot = slots.find(s => s.id === slotId);
  if (slot) {
    slot.isBooked = true;
    slot.bookingId = bookingId;
    saveAvailability(slots);
  }
}

export function releaseAvailabilitySlot(bookingId: string): void {
  if (typeof window === 'undefined') return;

  const slots = loadAvailability();
  const slot = slots.find(s => s.bookingId === bookingId);
  if (slot) {
    slot.isBooked = false;
    slot.bookingId = undefined;
    saveAvailability(slots);
  }
}

export function getAvailableSlots(): AvailabilitySlot[] {
  const slots = loadAvailability();
  const today = new Date().toISOString().split('T')[0];
  return slots.filter(s => !s.isBooked && s.date >= today);
}

// ============================================
// AVAILABILITY FUNCTIONS - SUPABASE
// ============================================

export async function loadAvailabilityFromSupabase(): Promise<AvailabilitySlot[]> {
  if (!isSupabaseConfigured()) {
    return loadAvailability();
  }

  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    const slots: AvailabilitySlot[] = data.map((s: Record<string, unknown>) => ({
      id: s.id as string,
      date: s.date as string,
      time: s.time as string,
      isBooked: s.is_booked as boolean,
      bookingId: s.booking_id as string | undefined
    }));

    // Cache in localStorage
    saveAvailability(slots);
    return slots;
  } catch (error) {
    console.error('Error loading availability from Supabase:', error);
    return loadAvailability();
  }
}

export async function addAvailabilitySlotToSupabase(date: string, time: string): Promise<AvailabilitySlot> {
  if (!isSupabaseConfigured()) {
    return addAvailabilitySlot(date, time);
  }

  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .insert({
        date,
        time,
        is_booked: false
      })
      .select()
      .single();

    if (error) throw error;

    const newSlot: AvailabilitySlot = {
      id: data.id,
      date: data.date,
      time: data.time,
      isBooked: data.is_booked,
      bookingId: data.booking_id
    };

    // Also add to localStorage
    const slots = loadAvailability();
    slots.push(newSlot);
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    saveAvailability(slots);

    return newSlot;
  } catch (error) {
    console.error('Error adding slot to Supabase:', error);
    return addAvailabilitySlot(date, time);
  }
}

export async function deleteAvailabilitySlotFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    deleteAvailabilitySlot(id);
    return;
  }

  try {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Also delete from localStorage
    deleteAvailabilitySlot(id);
  } catch (error) {
    console.error('Error deleting slot from Supabase:', error);
    deleteAvailabilitySlot(id);
  }
}

export async function bookAvailabilitySlotInSupabase(slotId: string, bookingId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    bookAvailabilitySlot(slotId, bookingId);
    return;
  }

  try {
    const { error } = await supabase
      .from('availability_slots')
      .update({
        is_booked: true,
        booking_id: bookingId
      })
      .eq('id', slotId);

    if (error) throw error;

    // Also update localStorage
    bookAvailabilitySlot(slotId, bookingId);
  } catch (error) {
    console.error('Error booking slot in Supabase:', error);
    bookAvailabilitySlot(slotId, bookingId);
  }
}

export async function releaseAvailabilitySlotInSupabase(bookingId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    releaseAvailabilitySlot(bookingId);
    return;
  }

  try {
    const { error } = await supabase
      .from('availability_slots')
      .update({
        is_booked: false,
        booking_id: null
      })
      .eq('booking_id', bookingId);

    if (error) throw error;

    // Also update localStorage
    releaseAvailabilitySlot(bookingId);
  } catch (error) {
    console.error('Error releasing slot in Supabase:', error);
    releaseAvailabilitySlot(bookingId);
  }
}

export async function getAvailableSlotsFromSupabase(): Promise<AvailabilitySlot[]> {
  if (!isSupabaseConfigured()) {
    return getAvailableSlots();
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('is_booked', false)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;

    return data.map((s: Record<string, unknown>) => ({
      id: s.id as string,
      date: s.date as string,
      time: s.time as string,
      isBooked: s.is_booked as boolean,
      bookingId: s.booking_id as string | undefined
    }));
  } catch (error) {
    console.error('Error getting available slots from Supabase:', error);
    return getAvailableSlots();
  }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToBookings(callback: (bookings: Booking[]) => void) {
  if (!isSupabaseConfigured()) return null;

  const channel = supabase
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      async () => {
        const bookings = await loadBookingsFromSupabase();
        callback(bookings);
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToAvailability(callback: (slots: AvailabilitySlot[]) => void) {
  if (!isSupabaseConfigured()) return null;

  const channel = supabase
    .channel('availability-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'availability_slots' },
      async () => {
        const slots = await loadAvailabilityFromSupabase();
        callback(slots);
      }
    )
    .subscribe();

  return channel;
}
