import api from './apiClient';
import { CreateTripPayload, Trip, TripFilters } from '../types/trip.types';

interface CreateTripResponse {
  data: Trip;
}

export const tripService = {
  async createTrip(payload: CreateTripPayload): Promise<Trip> {
    const response = await api.post<CreateTripResponse>('/trips', payload);
    const data = response.data;
    return data.data ?? (data as unknown as Trip);
  },

  async listTrips(filters: TripFilters = {}): Promise<Trip[]> {
    const response = await api.get<{ data: Trip[] } | Trip[]>('/trips', {
      params: filters,
    });

    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.data ?? [];
  },
};

export default tripService;