import api from './apiClient';
import { CreateTripPayload, Trip, TripFilters } from '../types/trip.types';

interface TripsResponse {
  success?: boolean;
  data: Trip[];
}

interface CreateTripResponse {
  success?: boolean;
  data: Trip;
}

export const tripService = {
  async createTrip(payload: CreateTripPayload): Promise<Trip> {
    const response = await api.post<CreateTripResponse>('/trips', payload);

    // Caso típico del backend: { success: true, data: trip }
    if ('data' in response.data) {
      return response.data.data;
    }

    // Fallback (por si el backend cambiara)
    return response.data as unknown as Trip;
  },

  async listTrips(filters: TripFilters = {}): Promise<Trip[]> {
    const response = await api.get<TripsResponse | Trip[]>('/trips', {
      params: filters,
    });

    const payload = response.data;

    // Caso 1: el backend devuelve solo un arreglo
    if (Array.isArray(payload)) {
      return payload;
    }

    // Caso 2: backend devuelve { success, data }
    if ('data' in payload) {
      return payload.data;
    }

    // Fallback defensivo
    return [];
  },
};

export default tripService;
