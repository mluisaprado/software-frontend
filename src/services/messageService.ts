// src/services/messageService.ts
import api from './apiClient';

export interface ChatMessage {
  id: number;
  trip_id: number;
  user_sender_id: number;
  user_receiver_id: number;
  content: string;
  read?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  success?: boolean;
  data: ChatMessage[];
}

interface SendResponse {
  success?: boolean;
  data: ChatMessage;
}

async function listMessages(tripId: number, otherUserId: number) {
  const response = await api.get<ListResponse | ChatMessage[]>(
    `/messages/${tripId}/${otherUserId}`
  );

  const payload: any = response.data;

  // Caso 1: backend devuelve directamente un array
  if (Array.isArray(payload)) {
    return payload as ChatMessage[];
  }

  // Caso 2: backend devuelve { success, data }
  if (payload?.data) {
    return payload.data as ChatMessage[];
  }

  return [];
}

async function sendMessage(
  tripId: number,
  receiverId: number,
  content: string
) {
  const response = await api.post<SendResponse | ChatMessage>('/messages', {
    tripId,
    receiverId,
    content,
  });

  const payload: any = response.data;
  return (payload?.data ?? payload) as ChatMessage;
}

export default {
  listMessages,
  sendMessage,
};
