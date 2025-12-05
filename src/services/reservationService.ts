// src/services/reservationService.ts
import axios from 'axios';
import storage from '../utils/storage';

const API_BASE_URL =
  process.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

async function reserveTrip(tripId: string) {
  // 1. Leer token guardado al hacer login
  const token = await storage.getItem('authToken');

  // 2. Hacer POST al backend
  const response = await axios.post(
    `${API_BASE_URL}/trips/${tripId}/reservations`,
    {},
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    }
  );

  // 3. Devolver el body (lo que manda el backend)
  return response.data;
}

export default {
  reserveTrip,
};
