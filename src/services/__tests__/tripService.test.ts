import tripService from '../tripService';
import api from '../apiClient';
import { CreateTripPayload, Trip } from '../../types/trip.types';

// Mock del apiClient
jest.mock('../apiClient');

describe('tripService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTrip', () => {
    it('debe crear un viaje exitosamente cuando el backend devuelve { success, data }', async () => {
      const payload: CreateTripPayload = {
        origin: 'Madrid',
        destination: 'Barcelona',
        departure_time: '2024-12-25T10:00:00Z',
        available_seats: 4,
      };

      const mockTrip: Trip = {
        id: '1',
        origin: 'Madrid',
        destination: 'Barcelona',
        departure_time: '2024-12-25T10:00:00Z',
        price_per_seat: 20,
        total_seats: 4,
        available_seats: 4,
        status: 'published',
        driver: {
          id: '1',
          name: 'Test Driver',
          email: 'driver@example.com',
        },
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockTrip,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.createTrip(payload);

      expect(api.post).toHaveBeenCalledWith('/trips', payload);
      expect(result).toEqual(mockTrip);
      expect(result.id).toBe('1');
      expect(result.origin).toBe('Madrid');
    });

    it('debe crear un viaje cuando el backend devuelve directamente el objeto trip', async () => {
      const payload: CreateTripPayload = {
        origin: 'Valencia',
        destination: 'Sevilla',
        departure_time: '2024-12-26T14:00:00Z',
        price_per_seat: 15,
        total_seats: 2,
        available_seats: 2,
      };

      const mockTrip: Trip = {
        id: '2',
        origin: 'Valencia',
        destination: 'Sevilla',
        departure_time: '2024-12-26T14:00:00Z',
        price_per_seat: 15,
        total_seats: 2,
        available_seats: 2,
        status: 'published',
        driver: {
          id: '2',
          name: 'Test Driver 2',
          email: 'driver2@example.com',
        },
      };

      const mockResponse = {
        data: mockTrip,
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.createTrip(payload);

      expect(api.post).toHaveBeenCalledWith('/trips', payload);
      expect(result).toEqual(mockTrip);
    });

    it('debe lanzar error cuando la creación falla', async () => {
      const payload: CreateTripPayload = {
        origin: 'Madrid',
        destination: 'Barcelona',
        departure_time: '2024-12-25T10:00:00Z',
        price_per_seat: 20,
        total_seats: 4,
        available_seats: 4,
      };

      const mockError = {
        response: {
          data: {
            message: 'Error al crear el viaje',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(tripService.createTrip(payload)).rejects.toEqual(mockError);
      expect(api.post).toHaveBeenCalledWith('/trips', payload);
    });
  });

  describe('listTrips', () => {
    it('debe listar viajes cuando el backend devuelve un array directamente', async () => {
      const mockTrips: Trip[] = [
        {
          id: '1',
          origin: 'Madrid',
          destination: 'Barcelona',
          departure_time: '2024-12-25T10:00:00Z',
          price_per_seat: 20,
          total_seats: 4,
          available_seats: 4,
          status: 'published',
          driver: {
            id: '1',
            name: 'Test Driver',
            email: 'driver@example.com',
          },
        },
        {
          id: '2',
          origin: 'Valencia',
          destination: 'Sevilla',
          departure_time: '2024-12-26T14:00:00Z',
          price_per_seat: 15,
          total_seats: 2,
          available_seats: 2,
          status: 'published',
          driver: {
            id: '2',
            name: 'Test Driver 2',
            email: 'driver2@example.com',
          },
        },
      ];

      const mockResponse = {
        data: mockTrips,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.listTrips();

      expect(api.get).toHaveBeenCalledWith('/trips', { params: {} });
      expect(result).toEqual(mockTrips);
      expect(result.length).toBe(2);
    });

    it('debe listar viajes cuando el backend devuelve { success, data }', async () => {
      const mockTrips: Trip[] = [
        {
          id: '1',
          origin: 'Madrid',
          destination: 'Barcelona',
          departure_time: '2024-12-25T10:00:00Z',
          price_per_seat: 20,
          total_seats: 4,
          available_seats: 4,
          status: 'published',
          driver: {
            id: '1',
            name: 'Test Driver',
            email: 'driver@example.com',
          },
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockTrips,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.listTrips();

      expect(api.get).toHaveBeenCalledWith('/trips', { params: {} });
      expect(result).toEqual(mockTrips);
    });

    it('debe listar viajes con filtros', async () => {
      const filters = {
        origin: 'Madrid',
        destination: 'Barcelona',
      };

      const mockTrips: Trip[] = [
        {
          id: '1',
          origin: 'Madrid',
          destination: 'Barcelona',
          departure_time: '2024-12-25T10:00:00Z',
          price_per_seat: 20,
          total_seats: 4,
          available_seats: 4,
          status: 'published',
          driver: {
            id: '1',
            name: 'Test Driver',
            email: 'driver@example.com',
          },
        },
      ];

      const mockResponse = {
        data: mockTrips,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.listTrips(filters);

      expect(api.get).toHaveBeenCalledWith('/trips', { params: filters });
      expect(result).toEqual(mockTrips);
    });

    it('debe retornar array vacío cuando el formato de respuesta no es reconocido', async () => {
      const mockResponse = {
        data: {
          success: false,
          // Sin campo 'data'
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.listTrips();

      expect(api.get).toHaveBeenCalledWith('/trips', { params: {} });
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío cuando el payload no es un array ni tiene data', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'No hay viajes',
          // Sin campo 'data'
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tripService.listTrips();

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

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(tripService.listTrips()).rejects.toEqual(mockError);
    });
  });
});

