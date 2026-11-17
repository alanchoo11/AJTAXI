export type Locale = 'kk' | 'ru' | 'en';
export type VehicleStatus = 'available' | 'on_request' | 'unavailable';
export type RentalPeriod = 'day' | 'week' | 'month';
export type ApplicationStatus = 'new' | 'under_review' | 'contacted' | 'approved' | 'rejected';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  transmission: string | null;
  fuel_type: string | null;
  description: Partial<Record<Locale, string>>;
  image_urls: string[];
  daily_price: number | null;
  weekly_price: number | null;
  monthly_price: number | null;
  deposit: number | null;
  rental_conditions: Partial<Record<Locale, string>>;
  availability_status: VehicleStatus;
  is_demo: boolean;
}

export interface FAQItem {
  id: string;
  category: string;
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

export interface DriverApplicationInput {
  fullName: string;
  phone: string;
  preferredLanguage: Locale;
  ownsVehicle: boolean;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  additionalMessage?: string;
  consent: boolean;
  website?: string;
}

export interface RentalApplicationInput {
  fullName: string;
  phone: string;
  vehicleId: string;
  rentalPeriod: RentalPeriod;
  preferredStartDate: string;
  additionalMessage?: string;
  consent: boolean;
  website?: string;
}
