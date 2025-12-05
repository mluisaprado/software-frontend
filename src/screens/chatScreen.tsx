// src/screens/ChatScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Spinner,
  useToast,
  ScrollView,
} from 'native-base';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import messageService, { ChatMessage } from '../services/messageService';

interface ChatRouteParams {
  tripId: number;
  otherUserId: number;
  otherUserName: string;
}

export default function ChatScreen() {
  const route = useRoute<any>();
  const { tripId, otherUserId, otherUserName } =
    (route.params as ChatRouteParams) ?? {};

  const { user } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [text, setText] = useState('');

  const loadMessages = useCallback(async () => {
    if (!tripId || !otherUserId) return;
    setIsLoading(true);
    try {
      const data = await messageService.listMessages(tripId, otherUserId);
      setMessages(data);
    } catch (error: any) {
      console.error('Error al cargar mensajes:', error);
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ?? 'No se pudieron obtener los mensajes',
        bg: 'error.600',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, otherUserId, toast]);

  useEffect(() => {
    loadMessages();
    // Polling simple cada 5s
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!tripId || !otherUserId) return;

    setIsSending(true);
    try {
      const sent = await messageService.sendMessage(
        tripId,
        otherUserId,
        text.trim()
      );
      setText('');
      setMessages((prev) => [...prev, sent]);
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ?? 'No se pudo enviar el mensaje',
        bg: 'error.600',
      });
    } finally {
      setIsSending(false);
    }
  };

  const currentUserId = user?.id;

  const renderBubble = (msg: ChatMessage) => {
    const isMine = msg.user_sender_id === currentUserId;

    return (
      <HStack
        key={msg.id}
        justifyContent={isMine ? 'flex-end' : 'flex-start'}
        mb={2}
      >
        <Box
          maxW="80%"
          px={3}
          py={2}
          borderRadius="2xl"
          bg={isMine ? 'primary.600' : 'neutral.200'}
        >
          <Text color={isMine ? 'white' : 'neutral.900'}>{msg.content}</Text>
          <Text
            fontSize="xs"
            mt={1}
            color={isMine ? 'primary.100' : 'neutral.500'}
          >
            {new Date(msg.createdAt).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Box>
      </HStack>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Box flex={1} bg="white" safeArea px={4} py={4}>
        <Heading size="md" mb={2}>
          Chat con {otherUserName ?? 'usuario'}
        </Heading>

        <Box
          flex={1}
          borderWidth={1}
          borderColor="neutral.200"
          borderRadius="2xl"
          p={3}
        >
          {isLoading ? (
            <HStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              space={2}
            >
              <Spinner color="primary.600" />
              <Text color="neutral.600">Cargando mensajes...</Text>
            </HStack>
          ) : messages.length === 0 ? (
            <VStack flex={1} justifyContent="center" alignItems="center">
              <Text color="neutral.500" textAlign="center">
                Aún no hay mensajes. ¡Envía el primero!
              </Text>
            </VStack>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(renderBubble)}
            </ScrollView>
          )}
        </Box>

        <HStack mt={3} space={2} alignItems="center">
          <Input
            flex={1}
            placeholder="Escribe un mensaje..."
            value={text}
            onChangeText={setText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Button
            bg="primary.600"
            _pressed={{ bg: 'primary.700' }}
            onPress={handleSend}
            isLoading={isSending}
          >
            Enviar
          </Button>
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
}
