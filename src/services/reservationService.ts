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

export default {
  reserveTrip,
  listReservationsForTrip,
  acceptReservation,
  rejectReservation,
};

