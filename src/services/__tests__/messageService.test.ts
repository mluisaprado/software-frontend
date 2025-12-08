import messageService, { ChatMessage } from '../messageService';
import api from '../apiClient';

// Mock del apiClient
jest.mock('../apiClient');

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listMessages', () => {
    it('debe listar mensajes cuando el backend devuelve un array directamente', async () => {
      const tripId = 1;
      const otherUserId = 2;

      const mockMessages: ChatMessage[] = [
        {
          id: 1,
          trip_id: tripId,
          user_sender_id: 1,
          user_receiver_id: otherUserId,
          content: 'Hola, ¿cuándo salimos?',
          read: false,
          createdAt: '2024-12-20T10:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z',
        },
        {
          id: 2,
          trip_id: tripId,
          user_sender_id: otherUserId,
          user_receiver_id: 1,
          content: 'A las 10:00 AM',
          read: true,
          createdAt: '2024-12-20T10:05:00Z',
          updatedAt: '2024-12-20T10:05:00Z',
        },
      ];

      const mockResponse = {
        data: mockMessages,
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.listMessages(tripId, otherUserId);

      expect(api.get).toHaveBeenCalledWith(`/messages/${tripId}/${otherUserId}`);
      expect(result).toEqual(mockMessages);
      expect(result.length).toBe(2);
    });

    it('debe listar mensajes cuando el backend devuelve { success, data }', async () => {
      const tripId = 1;
      const otherUserId = 2;

      const mockMessages: ChatMessage[] = [
        {
          id: 1,
          trip_id: tripId,
          user_sender_id: 1,
          user_receiver_id: otherUserId,
          content: 'Mensaje de prueba',
          read: false,
          createdAt: '2024-12-20T10:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z',
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockMessages,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.listMessages(tripId, otherUserId);

      expect(api.get).toHaveBeenCalledWith(`/messages/${tripId}/${otherUserId}`);
      expect(result).toEqual(mockMessages);
    });

    it('debe retornar array vacío cuando el formato no es reconocido', async () => {
      const tripId = 1;
      const otherUserId = 2;

      const mockResponse = {
        data: {
          success: true,
          // Sin campo data ni es array
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.listMessages(tripId, otherUserId);

      expect(result).toEqual([]);
    });

    it('debe retornar array vacío cuando payload.data es null', async () => {
      const tripId = 1;
      const otherUserId = 2;

      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.listMessages(tripId, otherUserId);

      expect(result).toEqual([]);
    });

    it('debe lanzar error cuando la petición falla', async () => {
      const tripId = 1;
      const otherUserId = 2;

      const mockError = {
        response: {
          data: {
            message: 'Error al obtener mensajes',
          },
        },
      };

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(
        messageService.listMessages(tripId, otherUserId)
      ).rejects.toEqual(mockError);
    });
  });

  describe('sendMessage', () => {
    it('debe enviar un mensaje exitosamente cuando el backend devuelve { success, data }', async () => {
      const tripId = 1;
      const receiverId = 2;
      const content = 'Mensaje de prueba';

      const mockMessage: ChatMessage = {
        id: 1,
        trip_id: tripId,
        user_sender_id: 1,
        user_receiver_id: receiverId,
        content,
        read: false,
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-20T10:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockMessage,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.sendMessage(
        tripId,
        receiverId,
        content
      );

      expect(api.post).toHaveBeenCalledWith('/messages', {
        tripId,
        receiverId,
        content,
      });
      expect(result).toEqual(mockMessage);
      expect(result.content).toBe(content);
    });

    it('debe enviar un mensaje cuando el backend devuelve directamente el objeto mensaje', async () => {
      const tripId = 1;
      const receiverId = 2;
      const content = 'Otro mensaje';

      const mockMessage: ChatMessage = {
        id: 2,
        trip_id: tripId,
        user_sender_id: 1,
        user_receiver_id: receiverId,
        content,
        read: false,
        createdAt: '2024-12-20T11:00:00Z',
        updatedAt: '2024-12-20T11:00:00Z',
      };

      const mockResponse = {
        data: mockMessage,
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.sendMessage(
        tripId,
        receiverId,
        content
      );

      expect(api.post).toHaveBeenCalledWith('/messages', {
        tripId,
        receiverId,
        content,
      });
      expect(result).toEqual(mockMessage);
    });

    it('debe manejar respuesta cuando payload.data es undefined y retorna payload directamente', async () => {
      const tripId = 1;
      const receiverId = 2;
      const content = 'Mensaje sin data';

      const mockMessage: ChatMessage = {
        id: 3,
        trip_id: tripId,
        user_sender_id: 1,
        user_receiver_id: receiverId,
        content,
        read: false,
        createdAt: '2024-12-20T12:00:00Z',
        updatedAt: '2024-12-20T12:00:00Z',
      };

      const mockResponse = {
        data: {
          success: true,
          // Sin campo data
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      // El servicio retornará payload?.data ?? payload
      // Como payload.data es undefined, retornará payload (el objeto con success: true)
      const result = await messageService.sendMessage(
        tripId,
        receiverId,
        content
      );

      expect(result).toEqual({ success: true });
    });

    it('debe lanzar error cuando el envío falla', async () => {
      const tripId = 1;
      const receiverId = 2;
      const content = 'Mensaje que falla';

      const mockError = {
        response: {
          data: {
            message: 'Error al enviar mensaje',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(
        messageService.sendMessage(tripId, receiverId, content)
      ).rejects.toEqual(mockError);
    });

    it('debe enviar mensajes con contenido vacío si es permitido', async () => {
      const tripId = 1;
      const receiverId = 2;
      const content = '';

      const mockMessage: ChatMessage = {
        id: 4,
        trip_id: tripId,
        user_sender_id: 1,
        user_receiver_id: receiverId,
        content,
        read: false,
        createdAt: '2024-12-20T13:00:00Z',
        updatedAt: '2024-12-20T13:00:00Z',
      };

      const mockResponse = {
        data: mockMessage,
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await messageService.sendMessage(
        tripId,
        receiverId,
        content
      );

      expect(api.post).toHaveBeenCalledWith('/messages', {
        tripId,
        receiverId,
        content: '',
      });
      expect(result.content).toBe('');
    });
  });
});

