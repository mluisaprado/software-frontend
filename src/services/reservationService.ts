// src/services/reservationService.ts
import apiClient from "./apiClient";

/**
 * Tipos compartidos
 */
export interface DriverSummary {
  id: number;
  name: string;
  email: string;
}

export interface TripSummary {
  id: number;
  origin: string;
  destination: string;
  departure_time: string;
  driver?: DriverSummary;
}

export interface ReservationSummary {
  id: number;
  status: string;
  user_id: number;
  trip_id: number;
  trip: TripSummary;
}

export interface PastTripsResponse {
  asPassenger: ReservationSummary[];
  asDriver: any[]; // viajes donde tú manejaste (por ahora no lo usamos tanto)
}

/**
 * 👇 Este ya lo tenías: para "Próximos viajes"
 */
export interface UpcomingReservation {
  id: number;
  status: string;
  role: "driver" | "passenger";
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
 * Reservar un viaje
 */
async function reserveTrip(tripId: number | string) {
  const response = await apiClient.post(`/trips/${tripId}/reservations`, {});
  return response.data;
}

/**
 * Listar reservas de un viaje (para el conductor)
 */
async function listReservationsForTrip(tripId: number | string) {
  const response = await apiClient.get(`/trips/${tripId}/reservations`);

  // backend responde { success, data: [...] }
  return response.data.data ?? [];
}

/**
 * Aceptar reserva
 */
async function acceptReservation(reservationId: number | string) {
  const response = await apiClient.patch(
    `/reservations/${reservationId}/accept`,
    {}
  );
  return response.data;
}

/**
 * Rechazar reserva
 */
async function rejectReservation(reservationId: number | string) {
  const response = await apiClient.patch(
    `/reservations/${reservationId}/reject`,
    {}
  );
  return response.data;
}

/**
 * 👇 Próximos viajes (CU6/CU7): ya lo tenías, solo que ahora con apiClient
 * GET /reservations/my-upcoming
 */
async function listMyUpcomingTrips(): Promise<UpcomingReservation[]> {
  const response = await apiClient.get("/reservations/my-upcoming");

  const payload: any = response.data;

  if (Array.isArray(payload)) {
    return payload as UpcomingReservation[];
  }

  if (payload?.data) {
    return payload.data as UpcomingReservation[];
  }

  return [];
}

/**
 * CU9: listar historial de viajes pasados
 * GET /reservations/my-past
 */
async function listMyPastTrips(): Promise<PastTripsResponse> {
  const response = await apiClient.get("/reservations/my-past");
  // backend responde { success, data: { asPassenger, asDriver } }
  return response.data.data as PastTripsResponse;
}

/**
 * CU9: calificar viaje (pasajera → conductor)
 * PATCH /reservations/:id/rate
 */
async function rateReservation(
  reservationId: number,
  rating: number,
  comment: string
) {
  const response = await apiClient.patch(`/reservations/${reservationId}/rate`, {
    rating,
    comment,
  });
  return response.data;
}

const reservationService = {
  reserveTrip,
  listReservationsForTrip,
  acceptReservation,
  rejectReservation,
  listMyUpcomingTrips,
  listMyPastTrips,
  rateReservation,
};

export default reservationService;
