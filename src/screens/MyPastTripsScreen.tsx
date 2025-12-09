// src/screens/MyPastTripsScreen.tsx
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Spinner,
  Button,
  useToast,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import reservationService, {
  PastTripsResponse,
  ReservationSummary,
} from "../services/reservationService";

export default function MyPastTripsScreen() {
  const [data, setData] = useState<PastTripsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation<any>();

  const loadPast = async () => {
    try {
      setIsLoading(true);
      const response = await reservationService.listMyPastTrips();
      setData(response);
    } catch (error: any) {
      console.error("Error al cargar historial:", error);
      toast.show({
        title: "Error",
        description:
          error?.response?.data?.message ??
          "No se pudo obtener tu historial de viajes",
        bg: "error.600",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPast();
  }, []);

  const renderPassengerItem = ({ item }: { item: ReservationSummary }) => {
    const trip = item.trip;
    if (!trip) return null;

    const formattedDate = new Date(
      trip.departure_time
    ).toLocaleString("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const driverName = trip.driver?.name ?? "Conductor";

    return (
      <Box
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
                Fecha: {formattedDate}
              </Text>
              <Text color="neutral.600" fontSize="sm">
                Conductor: {driverName}
              </Text>
            </VStack>
            <Badge colorScheme="emerald" variant="subtle" borderRadius="lg">
              Fuiste pasajera
            </Badge>
          </HStack>

          <Button
            mt={2}
            variant="outline"
            borderColor="amber.500"
            _text={{ color: "amber.600" }}
            onPress={() =>
              navigation.navigate("RateReservation", {
                reservationId: item.id,
                origin: trip.origin,
                destination: trip.destination,
                departureTime: trip.departure_time,
              })
            }
          >
            Calificar viaje
          </Button>
        </VStack>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="white" safeArea px={6} py={4}>
      <Heading size="lg" mb={4}>
        Historial de viajes
      </Heading>

      {isLoading ? (
        <HStack justifyContent="center" alignItems="center" flex={1} space={2}>
          <Spinner color="primary.600" />
          <Text color="neutral.600">Cargando historial...</Text>
        </HStack>
      ) : !data || data.asPassenger.length === 0 ? (
        <Box
          borderWidth={1}
          borderColor="neutral.200"
          borderRadius="2xl"
          p={6}
          alignItems="center"
        >
          <Text color="neutral.500" textAlign="center">
            Aún no tienes viajes pasados como pasajera.
          </Text>
        </Box>
      ) : (
        <>
          <Heading size="md" mb={2}>
            Viajes donde fuiste pasajera
          </Heading>
          <FlatList
            data={data.asPassenger}
            renderItem={renderPassengerItem}
            keyExtractor={(item) => `passenger-${item.id}`}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </Box>
  );
}
