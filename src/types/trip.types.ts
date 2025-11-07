export type TripStatus = 'published' | 'draft' | 'completed' | 'cancelled' | string;

export interface TripDriver {
  id: string;
  name: string;
  email: string;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  status: TripStatus;
  driver: TripDriver;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTripPayload {
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats?: number;
  status?: TripStatus;
}

export interface TripFilters {
  origin?: string;
  destination?: string;
  date?: string;
  status?: TripStatus;
}

