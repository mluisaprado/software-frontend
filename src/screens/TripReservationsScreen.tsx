// src/screens/TripReservationsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  useToast,
} from 'native-base';
import { useRoute, useNavigation } from '@react-navigation/native';
import reservationService from '../services/reservationService';

type RootStackParamList = {
  TripReservations: {
    tripId: number;
    origin: string;
    destination: string;
  };
};

type TripReservationsParams = RootStackParamList['TripReservations'];

interface ReservationItem {
  id: number;
  trip_id: number;
  user_id: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'rejected'
    | 'canceled'
    | 'not_attended'
    | 'completed';
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TripReservationsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { tripId, origin, destination } =
    (route.params as TripReservationsParams) ?? {};

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reservationService.listReservationsForTrip(tripId);
      setReservations(data);
    } catch (error: any) {
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ??
          'No se pudieron obtener las solicitudes',
        bg: 'error.600',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleAccept = async (id: number) => {
    try {
      await reservationService.acceptReservation(id);
      toast.show({
        title: 'Reserva aceptada',
        bg: 'success.600',
      });
      await loadReservations();
    } catch (error: any) {
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ?? 'No se pudo aceptar la reserva',
        bg: 'error.600',
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await reservationService.rejectReservation(id);
      toast.show({
        title: 'Reserva rechazada',
        bg: 'success.600',
      });
      await loadReservations();
    } catch (error: any) {
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ?? 'No se pudo rechazar la reserva',
        bg: 'error.600',
      });
    }
  };

  const renderItem = ({ item }: { item: ReservationItem }) => {
    const isPending = item.status === 'pending';
    const canChat = item.status === 'confirmed';

    return (
      <Box
        key={item.id}
        borderWidth={1}
        borderColor="neutral.200"
        borderRadius="2xl"
        p={4}
        bg="white"
        shadow={1}
        mb={4}
      >
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontWeight="bold">
                {item.user?.name ?? 'Pasajero'}
              </Text>
              <Text color="neutral.600" fontSize="sm">
                {item.user?.email}
              </Text>
            </VStack>
            <Badge
              colorScheme={
                item.status === 'confirmed'
                  ? 'success'
                  : item.status === 'rejected'
                  ? 'danger'
                  : 'warning'
              }
              variant="subtle"
              borderRadius="lg"
            >
              {item.status}
            </Badge>
          </HStack>

          {isPending && (
            <HStack space={3} mt={2}>
              <Button
                flex={1}
                bg="success.600"
                _pressed={{ bg: 'success.700' }}
                onPress={() => handleAccept(item.id)}
              >
                Aceptar
              </Button>
              <Button
                flex={1}
                bg="error.600"
                _pressed={{ bg: 'error.700' }}
                onPress={() => handleReject(item.id)}
              >
                Rechazar
              </Button>
            </HStack>
          )}

          {canChat && item.user && (
            <Button
              mt={2}
              variant="outline"
              borderColor="primary.600"
              _text={{ color: 'primary.600' }}
              onPress={() =>
                navigation.navigate('Chat', {
                  tripId,
                  otherUserId: item.user!.id,
                  otherUserName: item.user!.name,
                })
              }
            >
              Chatear con {item.user.name}
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="white" safeArea px={6} py={4}>
      <Heading size="md" mb={2}>
        Solicitudes para: {origin} → {destination}
      </Heading>

      {isLoading ? (
        <HStack justifyContent="center" alignItems="center" flex={1} space={2}>
          <Spinner color="primary.600" />
          <Text color="neutral.600">Cargando solicitudes...</Text>
        </HStack>
      ) : reservations.length === 0 ? (
        <Box
          borderWidth={1}
          borderColor="neutral.200"
          borderRadius="2xl"
          p={6}
          alignItems="center"
          mt={4}
        >
          <Text color="neutral.500" textAlign="center">
            Aún no tienes solicitudes para este viaje.
          </Text>
        </Box>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Box>
  );
}
