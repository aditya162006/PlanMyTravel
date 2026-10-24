export interface User {
  id: number;
  email: string;
  name: string;
  full_name?: string;
  phone?: string;
  country?: string;
  preferred_currency: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  is_active: boolean;
  wallet_balance?: number;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface DestinationImage {
  id: number;
  destination_id: number;
  image_url: string;
  alt_text?: string;
  caption?: string;
  sort_order: number;
}

export interface Attraction {
  name: string;
  category?: string;
  rating?: number;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  country?: string;
  region?: string;
  city?: string;
  tagline?: string;
  category?: string;
  short_description?: string;
  description?: string;
  hero_image_url?: string;
  image_url?: string;
  rating: number;
  is_featured: boolean;
  is_published: boolean;
  best_season?: string;
  cost_currency: string;
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  ideal_stay?: string;
  weather_info?: string;
  travel_styles?: string[];
  attractions?: Attraction[];
  activities?: string[];
  gallery?: DestinationImage[];
  related_stays?: Stay[];
  local_guides?: Guide[];
  insights?: Array<{ title: string; snippet: string; link?: string }>;
}

export interface Stay {
  id: string;
  provider_code?: string;
  name: string;
  city: string;
  country?: string;
  category: string;
  description: string;
  cover_image_url: string;
  images?: string[];
  nightly_rate: number;
  currency: string;
  rating: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  amenities: string[];
  is_verified_provider: boolean;
  source: string;
  requires_partner_checkout: boolean;
}

export interface Guide {
  id: number;
  user_id?: number;
  display_name: string;
  bio?: string;
  destination: string;
  languages: string[];
  specialties: string[];
  daily_rate: number;
  currency: string;
  rating: number;
  review_count: number;
  photo_url: string;
  id_document_url?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  is_active: boolean;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  user_name?: string;
  stay_id?: string;
  guide_id?: number;
  destination_id?: number;
  rating: number;
  title?: string;
  body: string;
  is_verified: boolean;
  created_at: string;
}

export interface WeatherData {
  destination: string;
  date: string;
  temperature_c: number;
  temp_max_c: number;
  temp_min_c: number;
  condition: string;
  icon: string;
  precipitation_probability: number;
  advice: string;
  coordinates: { lat: number; lng: number };
  source: string;
}

export interface FlightOption {
  id?: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  layovers?: string;
  stops?: string;
  estimated_price_per_person: number;
  booking_advice?: string;
  booking_url?: string;
}

export interface TransferOption {
  mode: string;
  from: string;
  to: string;
  duration: string;
  estimated_cost: number;
  tips?: string;
}

export interface ItineraryActivity {
  title: string;
  description: string;
  location: string;
  time: string;
  duration_min: number;
  estimated_cost: number;
}

export interface ItineraryDay {
  day_number: number;
  title: string;
  summary: string;
  morning?: ItineraryActivity;
  afternoon?: ItineraryActivity;
  evening?: ItineraryActivity;
}

export interface BudgetBreakdown {
  flights_total: number;
  accommodation_total: number;
  transfers_and_transit: number;
  activities_and_tickets: number;
  food_and_dining: number;
  contingency_fund: number;
  estimated_grand_total: number;
  remaining_budget: number;
  budget_status: string;
}

export interface Itinerary {
  title: string;
  summary: string;
  destination: string;
  origin: string;
  duration_days: number;
  travelers: number;
  currency: string;
  flights?: {
    outbound?: FlightOption;
    return?: FlightOption;
  };
  transfers?: TransferOption[];
  accommodations?: Stay[];
  verified_hotel_options?: Stay[];
  assigned_guide?: Guide;
  available_guides?: Guide[];
  days: ItineraryDay[];
  budget_breakdown: BudgetBreakdown;
  practical_tips?: string[];
}

export interface Trip {
  id: string;
  user_id: number;
  destination_id?: number;
  title: string;
  start_date?: string;
  end_date?: string;
  travelers: number;
  total_budget?: number;
  currency: string;
  travel_style?: string;
  origin?: string;
  interests?: string[];
  status: string;
  notes?: string;
  destination?: {
    id: number;
    name: string;
    country?: string;
    hero_image_url?: string;
  };
  active_plan?: {
    id: string;
    title: string;
    summary?: string;
    estimated_total?: number;
    currency: string;
    payload?: Itinerary;
    days?: any[];
  };
  created_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  trip_id?: string;
  booking_id?: number;
  type: string;
  amount: number;
  status: string;
  currency: string;
  description?: string;
  reference?: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  trip_id?: string;
  status: string;
  travelers_count: number;
  total_amount: number;
  currency: string;
  contact_name?: string;
  contact_email?: string;
  payment_status: string;
  booked_at: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  trip_id?: string;
  booking_id?: number;
  title: string;
  amount: number;
  currency: string;
  category: string;
  spent_at: string;
  notes?: string;
  paid_with_wallet: boolean;
  created_at: string;
}

export interface ExpenseSummary {
  expenses: Expense[];
  total_spent: number;
  budget: number;
  remaining_budget: number;
  spent_percentage: number;
  is_over_budget: boolean;
  over_budget_by: number;
  alert?: {
    type: 'danger' | 'warning';
    title: string;
    message: string;
    over_by: number;
  } | null;
  categories: Record<string, number>;
  wallet_balance: number;
}

export interface RentalVehicle {
  id: string;
  name: string;
  category: 'cab' | 'motorbike' | 'scooter';
  location: string;
  city: string;
  country: string;
  image_url: string;
  daily_rate: number;
  hourly_rate: number;
  security_deposit: number;
  currency: string;
  transmission: string;
  fuel_type: string;
  engine_capacity: string;
  seats: number;
  luggage_capacity: string;
  mileage: string;
  has_chauffeur: boolean;
  inclusions: string[];
  requirements: {
    min_age: number;
    license: string;
    deposit_type: string;
    fuel_policy: string;
  };
  pickup_locations: string[];
  rating: number;
  review_count: number;
  supplier: string;
}

export interface SOSAuthority {
  destination: string;
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  tourist_police: string;
  embassy_hotline: string;
  authority_name: string;
  dispatch_center: string;
  response_time_sla: string;
  emergency_language: string;
  safety_instructions: string[];
}

export interface SOSIncident {
  incident_id: string;
  trip_id?: string;
  user_id?: number;
  user_name: string;
  user_phone?: string;
  destination: string;
  emergency_type: string;
  user_location: string;
  latitude?: number;
  longitude?: number;
  user_notes?: string;
  status: 'ALERT_BROADCASTED' | 'DISPATCHED' | 'RESOLVED_SAFE';
  authority: SOSAuthority;
  dispatched_at: string;
  estimated_arrival: string;
  resolution_notes?: string;
  resolved_at?: string;
}



