// src/screens/RateReservationScreen.tsx
import React, { useState } from "react";
import { TouchableOpacity, TextInput } from "react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useToast,
} from "native-base";
import { useRoute, useNavigation } from "@react-navigation/native";
import reservationService from "../services/reservationService";

type RateReservationParams = {
  reservationId: number;
  origin: string;
  destination: string;
  departureTime?: string;
};

export default function RateReservationScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();

  const { reservationId, origin, destination, departureTime } =
    (route.params as RateReservationParams) ?? {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formattedDate =
    departureTime &&
    new Date(departureTime).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const handleSubmit = async () => {
    if (!reservationId) {
      toast.show({
        title: "Error",
        description: "No se encontró la reserva a calificar",
        bg: "error.600",
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.show({
        title: "Selecciona una calificación",
        description: "Debes elegir entre 1 y 5 estrellas",
        bg: "warning.600",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await reservationService.rateReservation(reservationId, rating, comment);

      toast.show({
        title: "¡Gracias por tu calificación!",
        description: "Tu opinión nos ayuda a mejorar la comunidad",
        bg: "success.600",
      });

      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      toast.show({
        title: "Error",
        description:
          error?.response?.data?.message ??
          "No se pudo registrar la calificación",
        bg: "error.600",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box flex={1} bg="white" safeArea px={6} py={4}>
      <Heading size="md" mb={2}>
        Calificar viaje
      </Heading>

      <VStack space={3} mb={4}>
        <Text fontWeight="bold">
          {origin} → {destination}
        </Text>
        {formattedDate && (
          <Text color="neutral.600" fontSize="sm">
            {formattedDate}
          </Text>
        )}
      </VStack>

      <VStack space={4}>
        <Text fontWeight="bold">Tu calificación</Text>

        <HStack space={3} alignItems="center">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text
                fontSize="3xl"
                color={rating >= star ? "amber.400" : "neutral.300"}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>

        <Text fontWeight="bold">Comentario (opcional)</Text>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="¿Algo que quieras destacar del viaje?"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 12,
            padding: 12,
            minHeight: 100,
            textAlignVertical: "top",
            fontSize: 14,
          }}
        />

        <Button
          mt={4}
          bg="primary.600"
          _pressed={{ bg: "primary.700" }}
          isLoading={isSubmitting}
          onPress={handleSubmit}
        >
          Enviar calificación
        </Button>
      </VStack>
    </Box>
  );
}
