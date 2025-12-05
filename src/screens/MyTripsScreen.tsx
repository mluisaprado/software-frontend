// src/screens/MyTripsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Spinner,
  useToast,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import tripService from '../services/tripService';
import { Trip } from '../types/trip.types';

export default function MyTripsScreen() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation<any>();

  const loadTrips = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const allTrips = await tripService.listTrips({});
      const myTrips = allTrips.filter((t) => t.driver?.id === user.id);
      setTrips(myTrips);
    } catch (error: any) {
      toast.show({
        title: 'Error',
        description:
          error?.response?.data?.message ?? 'No se pudieron obtener tus viajes',
        bg: 'error.600',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const renderTrip = ({ item }: { item: Trip }) => {
    const departureDate = new Date(item.departure_time);
    const formattedDate = departureDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

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
          <Heading size="sm" color="neutral.900">
            {item.origin} → {item.destination}
          </Heading>
          <Text color="neutral.600" fontSize="sm">
            Salida: {formattedDate}
          </Text>
          <Text color="neutral.600" fontSize="sm">
            Asientos: {item.available_seats} / {item.total_seats}
          </Text>

          <Button
            mt={2}
            bg="primary.600"
            _pressed={{ bg: 'primary.700' }}
            onPress={() =>
              navigation.navigate('TripReservations', {
                tripId: item.id,
                origin: item.origin,
                destination: item.destination,
              })
            }
          >
            Ver solicitudes
          </Button>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="white" safeArea px={6} py={4}>
      <Heading size="lg" mb={4}>
        Mis viajes
      </Heading>

      {isLoading ? (
        <HStack justifyContent="center" alignItems="center" flex={1} space={2}>
          <Spinner color="primary.600" />
          <Text color="neutral.600">Cargando tus viajes...</Text>
        </HStack>
      ) : trips.length === 0 ? (
        <Box
          borderWidth={1}
          borderColor="neutral.200"
          borderRadius="2xl"
          p={6}
          alignItems="center"
        >
          <Text color="neutral.500" textAlign="center">
            Aún no has publicado viajes.
          </Text>
        </Box>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Box>
  );
}
