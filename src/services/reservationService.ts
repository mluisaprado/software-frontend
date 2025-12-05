// src/services/reservationService.ts
import axios from 'axios';
import storage from '../utils/storage';

const API_BASE_URL =
  process.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

async function getAuthHeaders() {
  const token = await storage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function reserveTrip(tripId: string | number) {
  const headers = await getAuthHeaders();

  const response = await axios.post(
    `${API_BASE_URL}/trips/${tripId}/reservations`,
    {},
    { headers }
  );

  return response.data;
}

async function listReservationsForTrip(tripId: string | number) {
  const headers = await getAuthHeaders();

  const response = await axios.get(
    `${API_BASE_URL}/trips/${tripId}/reservations`,
    { headers }
  );

  // backend responde { success, data: [...] }
  return response.data.data ?? [];
}

async function acceptReservation(reservationId: string | number) {
  const headers = await getAuthHeaders();

  const response = await axios.patch(
    `${API_BASE_URL}/reservations/${reservationId}/accept`,
    {},
    { headers }
  );

  return response.data;
}

async function rejectReservation(reservationId: string | number) {
  const headers = await getAuthHeaders();

  const response = await axios.patch(
    `${API_BASE_URL}/reservations/${reservationId}/reject`,
    {},
    { headers }
  );

  return response.data;
}

/**
 * 👇 NUEVO: tipo para usar en MyUpcomingTripsScreen
 */
export interface UpcomingReservation {
  id: number;
  status: string;
  role: 'driver' | 'passenger';
  trip: {
    id: number;
    origin: string;
    destination: string;
    departure_time: string;
    driver?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

/**
 * 👇 NUEVO: próximos viajes donde soy PASAJERO y la reserva está confirmada
 * GET /reservations/my-upcoming
 */
async function listMyUpcomingTrips(): Promise<UpcomingReservation[]> {
  const headers = await getAuthHeaders();

  const response = await axios.get(
    `${API_BASE_URL}/reservations/my-upcoming`,
    { headers }
  );

  const payload: any = response.data;

  if (Array.isArray(payload)) {
    return payload as UpcomingReservation[];
  }

  if (payload?.data) {
    return payload.data as UpcomingReservation[];
  }

  return [];
}

export default {
  reserveTrip,
  listReservationsForTrip,
  acceptReservation,
  rejectReservation,
  // 👇 acuérdate de exportar también la nueva función
  listMyUpcomingTrips,
};
