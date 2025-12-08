import reservationService, { UpcomingReservation } from '../reservationService';
import storage from '../../utils/storage';
import axios from 'axios';

// Mock de axios y storage
jest.mock('axios');
jest.mock('../../utils/storage');

// Mock de process.env
const originalEnv = process.env;

describe('reservationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    (storage.getItem as jest.Mock).mockResolvedValue('mock-token');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('reserveTrip', () => {
    it('debe reservar un viaje exitosamente', async () => {
      const tripId = '1';
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 1,
            trip_id: tripId,
            user_id: 2,
            status: 'pending',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.reserveTrip(tripId);

      expect(storage.getItem).toHaveBeenCalledWith('authToken');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining(`/trips/${tripId}/reservations`),
        {},
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe usar el token de autenticación correctamente', async () => {
      const tripId = '2';
      (storage.getItem as jest.Mock).mockResolvedValue('another-token');

      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await reservationService.reserveTrip(tripId);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {},
        {
          headers: {
            Authorization: 'Bearer another-token',
          },
        }
      );
    });

    it('debe funcionar sin token si no existe', async () => {
      const tripId = '3';
      (storage.getItem as jest.Mock).mockResolvedValue(null);

      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await reservationService.reserveTrip(tripId);

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {},
        {
          headers: {},
        }
      );
    });

    it('debe lanzar error cuando la reserva falla', async () => {
      const tripId = '1';
      const mockError = {
        response: {
          data: {
            message: 'No hay asientos disponibles',
          },
        },
      };

      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(reservationService.reserveTrip(tripId)).rejects.toEqual(
        mockError
      );
    });
  });

  describe('listReservationsForTrip', () => {
    it('debe listar reservas de un viaje exitosamente', async () => {
      const tripId = '1';
      const mockReservations = [
        {
          id: 1,
          trip_id: tripId,
          user_id: 2,
          status: 'pending',
        },
        {
          id: 2,
          trip_id: tripId,
          user_id: 3,
          status: 'accepted',
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockReservations,
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.listReservationsForTrip(tripId);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/trips/${tripId}/reservations`),
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toEqual(mockReservations);
    });

    it('debe retornar array vacío cuando no hay data en la respuesta', async () => {
      const tripId = '1';
      const mockResponse = {
        data: {
          success: true,
          // Sin campo data
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.listReservationsForTrip(tripId);

      expect(result).toEqual([]);
    });

    it('debe funcionar con número como tripId', async () => {
      const tripId = 123;
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      });

      await reservationService.listReservationsForTrip(tripId);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/trips/123/reservations'),
        expect.any(Object)
      );
    });
  });

  describe('acceptReservation', () => {
    it('debe aceptar una reserva exitosamente', async () => {
      const reservationId = '1';
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: reservationId,
            status: 'accepted',
          },
        },
      };

      (axios.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.acceptReservation(reservationId);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/reservations/${reservationId}/accept`),
        {},
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe funcionar con número como reservationId', async () => {
      const reservationId = 456;
      (axios.patch as jest.Mock).mockResolvedValue({ data: {} });

      await reservationService.acceptReservation(reservationId);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/456/accept'),
        {},
        expect.any(Object)
      );
    });

    it('debe lanzar error cuando la aceptación falla', async () => {
      const reservationId = '1';
      const mockError = {
        response: {
          data: {
            message: 'Reserva no encontrada',
          },
        },
      };

      (axios.patch as jest.Mock).mockRejectedValue(mockError);

      await expect(
        reservationService.acceptReservation(reservationId)
      ).rejects.toEqual(mockError);
    });
  });

  describe('rejectReservation', () => {
    it('debe rechazar una reserva exitosamente', async () => {
      const reservationId = '1';
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: reservationId,
            status: 'rejected',
          },
        },
      };

      (axios.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.rejectReservation(reservationId);

      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`/reservations/${reservationId}/reject`),
        {},
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe lanzar error cuando el rechazo falla', async () => {
      const reservationId = '1';
      const mockError = {
        response: {
          data: {
            message: 'No autorizado',
          },
        },
      };

      (axios.patch as jest.Mock).mockRejectedValue(mockError);

      await expect(
        reservationService.rejectReservation(reservationId)
      ).rejects.toEqual(mockError);
    });
  });

  describe('listMyUpcomingTrips', () => {
    it('debe listar mis próximos viajes cuando el backend devuelve un array', async () => {
      const mockUpcomingTrips: UpcomingReservation[] = [
        {
          id: 1,
          status: 'accepted',
          role: 'passenger',
          trip: {
            id: 1,
            origin: 'Madrid',
            destination: 'Barcelona',
            departure_time: '2024-12-25T10:00:00Z',
            driver: {
              id: 1,
              name: 'Driver Name',
              email: 'driver@example.com',
            },
          },
        },
      ];

      const mockResponse = {
        data: mockUpcomingTrips,
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.listMyUpcomingTrips();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/reservations/my-upcoming'),
        {
          headers: {
            Authorization: 'Bearer mock-token',
          },
        }
      );
      expect(result).toEqual(mockUpcomingTrips);
    });

    it('debe listar mis próximos viajes cuando el backend devuelve { data }', async () => {
      const mockUpcomingTrips: UpcomingReservation[] = [
        {
          id: 1,
          status: 'accepted',
          role: 'passenger',
          trip: {
            id: 1,
            origin: 'Madrid',
            destination: 'Barcelona',
            departure_time: '2024-12-25T10:00:00Z',
          },
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockUpcomingTrips,
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.listMyUpcomingTrips();

      expect(result).toEqual(mockUpcomingTrips);
    });

    it('debe retornar array vacío cuando el formato no es reconocido', async () => {
      const mockResponse = {
        data: {
          success: true,
          // Sin campo data ni es array
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await reservationService.listMyUpcomingTrips();

      expect(result).toEqual([]);
    });

    it('debe lanzar error cuando la petición falla', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Error al obtener viajes',
          },
        },
      };

      (axios.get as jest.Mock).mockRejectedValue(mockError);

      await expect(reservationService.listMyUpcomingTrips()).rejects.toEqual(
        mockError
      );
    });
  });
});

