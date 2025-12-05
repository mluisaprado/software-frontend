import React, { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  Input,
  Button,
  Select,
  Spinner,
  useToast,
  Badge,
  Pressable, 
} from 'native-base';
import { useNavigation } from '@react-navigation/native'; 
import tripService from '../services/tripService';
import { Trip, TripFilters } from '../types/trip.types';
import DateInput from '../components/DateInput';
import reservationService from '../services/reservationService';

const defaultFilters: TripFilters = {
  status: 'published',
};

export default function TripsSearchScreen() {
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation<any>(); 

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== null && value !== ''
        )
      ) as TripFilters;

      const data = await tripService.listTrips(cleanedFilters);
      setTrips(data);
    } catch (error: any) {
      toast.show({
        title: 'Error',
        description: error?.response?.data?.message ?? 'No se pudieron obtener los viajes',
        bg: 'error.600',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const handleFilterChange = <K extends keyof TripFilters>(key: K, value: TripFilters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReserve = async (tripId: string | number) => {
    try {
      const result = await reservationService.reserveTrip(tripId);

      toast.show({
        title: 'Reserva enviada',
        description: result?.message ?? 'Reserva creada correctamente',
        bg: 'success.600',
      });

      await fetchTrips();
    } catch (error: any) {
      console.error('Error al reservar viaje:', error);

      const message =
        error?.response?.data?.message ??
        'No se pudo crear la reserva';

      toast.show({
        title: 'Error',
        description: message,
        bg: 'error.600',
      });
    }
  };

  const renderTrip = ({ item }: { item: Trip }) => {
    const departureDate = new Date(item.departure_time);
    const formattedDate = departureDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const handleOpenDriverProfile = () => {
      if (!item.driver?.id) {
        toast.show({
          title: 'Perfil no disponible',
          description: 'Este viaje no tiene un conductor asociado.',
          bg: 'warning.500',
        });
        return;
      }

      navigation.navigate('ProfileDetail', {
        userId: item.driver.id, 
      });
    };

    const isFull =
      item.available_seats === 0 || item.status !== 'published';

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
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1}>
            <Heading size="sm" color="neutral.900">
              {item.origin} → {item.destination}
            </Heading>
            <Text color="neutral.600" fontSize="sm">
              Salida: {formattedDate}
            </Text>
            <Text color="neutral.600" fontSize="sm">
              Asientos disponibles: {item.available_seats} / {item.total_seats}
            </Text>

            {/* Nombre del conductor clickeable para visitar perfil */}
            <Pressable onPress={handleOpenDriverProfile}>
              <Text color="primary.700" fontSize="sm" fontWeight="bold" underline>
                Conductor: {item.driver?.name ?? 'N/A'}
              </Text>
            </Pressable>

            <Button
              size="sm"
              bg={isFull ? 'neutral.300' : 'primary.600'}
              _pressed={{ bg: isFull ? 'neutral.300' : 'primary.700' }}
              isDisabled={isFull}
              onPress={() => handleReserve(item.id)}
            >
              {isFull ? 'Sin cupos' : 'Reservar'}
            </Button>

          </VStack>

          <VStack alignItems="flex-end" space={2}>
            <Text fontSize="lg" fontWeight="bold" color="primary.600">
              ${item.price_per_seat.toFixed(2)}
            </Text>
            <Badge colorScheme="primary" variant="subtle" borderRadius="lg">
              {item.status}
            </Badge>
          </VStack>
        </HStack>
      </Box>
    );
  };



  return (
    <Box flex={1} bg="white" safeArea>
      <Box px={6} py={4}>
        <Heading size="lg" color="neutral.900">
          Buscar viajes
        </Heading>
        <Text color="neutral.500">Filtra por origen, destino, fecha o estado.</Text>
      </Box>

      <Box px={6} mb={4}>
        <VStack space={4}>
          <FormControl>
            <FormControl.Label>Origen</FormControl.Label>
            <Input
              placeholder="Ej. Lima"
              value={filters.origin ?? ''}
              onChangeText={(value) => handleFilterChange('origin', value)}
              autoCapitalize="words"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Destino</FormControl.Label>
            <Input
              placeholder="Ej. Cusco"
              value={filters.destination ?? ''}
              onChangeText={(value) => handleFilterChange('destination', value)}
              autoCapitalize="words"
            />
          </FormControl>

          <HStack space={4}>
            <FormControl flex={1}>
              <FormControl.Label>Fecha</FormControl.Label>
              <DateInput
                mode="date"
                value={filters.date ? `${filters.date}T00:00:00` : undefined}
                placeholder="Selecciona una fecha"
                onChange={(date) =>
                  handleFilterChange('date', date.toISOString().slice(0, 10))
                }
              />
            </FormControl>

            <FormControl flex={1}>
              <FormControl.Label>Estado</FormControl.Label>
              <Select
                selectedValue={filters.status ?? 'published'}
                onValueChange={(value) => handleFilterChange('status', value)}
                accessibilityLabel="Estado del viaje"
              >
                <Select.Item label="Publicado" value="published" />
                <Select.Item label="Borrador" value="draft" />
                <Select.Item label="Completado" value="completed" />
                <Select.Item label="Cancelado" value="cancelled" />
                <Select.Item label="Todos" value="" />
              </Select>
            </FormControl>
          </HStack>

          <Button
            bg="primary.600"
            _pressed={{ bg: 'primary.700' }}
            onPress={fetchTrips}
            isLoading={isLoading}
          >
            Buscar
          </Button>
        </VStack>
      </Box>

      <Box flex={1} px={6}>
        {isLoading ? (
          <HStack justifyContent="center" alignItems="center" flex={1} space={2}>
            <Spinner color="primary.600" />
            <Text color="neutral.600">Buscando viajes...</Text>
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
              Aún no hay viajes que coincidan con tu búsqueda.
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
    </Box>
  );
}
