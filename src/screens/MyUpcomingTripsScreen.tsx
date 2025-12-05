// src/screens/MyUpcomingTripsScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  Badge,
  useToast,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import reservationService, {
  UpcomingReservation,
} from '../services/reservationService';

export default function MyUpcomingTripsScreen() {
  const [items, setItems] = useState<UpcomingReservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation<any>();

  const loadUpcoming = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reservationService.listMyUpcomingTrips();
      setItems(data);
    } catch (error: any) {
      console.error('Error al cargar próximos viajes:', error);
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ??
          'No se pudieron obtener tus próximos viajes',
        bg: 'error.600',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  const renderItem = ({ item }: { item: UpcomingReservation }) => {
    const { trip, role } = item;
    if (!trip) return null;

    const departureDate = new Date(trip.departure_time);
    const formattedDate = departureDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const driverName = trip.driver?.name ?? 'Conductor';

    const isPassenger = role === 'passenger';
    const isDriver = role === 'driver';

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
              <Heading size="sm" color="neutral.900">
                {trip.origin} → {trip.destination}
              </Heading>
              <Text color="neutral.600" fontSize="sm">
                Salida: {formattedDate}
              </Text>
              {isPassenger && (
                <Text color="neutral.600" fontSize="sm">
                  Conductor: {driverName}
                </Text>
              )}
            </VStack>

            <Badge
              colorScheme={isDriver ? 'primary' : 'emerald'}
              variant="subtle"
              borderRadius="lg"
            >
              {isDriver ? 'Conduces tú' : 'Vas de pasajero'}
            </Badge>
          </HStack>

          {isPassenger && (
            <Button
              mt={2}
              variant="outline"
              borderColor="primary.600"
              _text={{ color: 'primary.600' }}
              onPress={() =>
                navigation.navigate('Chat', {
                  tripId: trip.id,
                  otherUserId: trip.driver?.id,
                  otherUserName: driverName,
                })
              }
            >
              Chatear con el conductor
            </Button>
          )}

          {isDriver && (
            <Button
              mt={2}
              bg="primary.600"
              _pressed={{ bg: 'primary.700' }}
              onPress={() =>
                navigation.navigate('TripReservations', {
                  tripId: trip.id,
                  origin: trip.origin,
                  destination: trip.destination,
                })
              }
            >
              Gestionar pasajeros
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="white" safeArea px={6} py={4}>
      <Heading size="lg" mb={4}>
        Próximos viajes
      </Heading>

      {isLoading ? (
        <HStack justifyContent="center" alignItems="center" flex={1} space={2}>
          <Spinner color="primary.600" />
          <Text color="neutral.600">Cargando próximos viajes...</Text>
        </HStack>
      ) : items.length === 0 ? (
        <Box
          borderWidth={1}
          borderColor="neutral.200"
          borderRadius="2xl"
          p={6}
          alignItems="center"
        >
          <Text color="neutral.500" textAlign="center">
            Aún no tienes viajes próximos.
          </Text>
        </Box>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.role}-${item.id}`}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Box>
  );
}
