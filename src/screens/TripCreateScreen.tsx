import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  Input,
  Button,
  KeyboardAvoidingView,
  ScrollView,
  useToast,
  HStack,
} from 'native-base';
import { Platform } from 'react-native';
import tripService from '../services/tripService';
import { CreateTripPayload } from '../types/trip.types';
import DateInput from '../components/DateInput';

const initialForm: CreateTripPayload = {
  origin: '',
  destination: '',
  departure_time: '',
  price_per_seat: 0,
  total_seats: 1,
  available_seats: undefined,
};

export default function TripCreateScreen() {
  const [form, setForm] = useState<CreateTripPayload>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const toast = useToast();

  const handleChange = <K extends keyof CreateTripPayload>(
    key: K,
    value: CreateTripPayload[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.origin.trim()) {
      newErrors.origin = 'El origen es requerido';
    }

    if (!form.destination.trim()) {
      newErrors.destination = 'El destino es requerido';
    }

    if (!form.departure_time) {
      newErrors.departure_time = 'La fecha y hora de salida son requeridas';
    } else if (new Date(form.departure_time).getTime() <= Date.now()) {
      newErrors.departure_time = 'La fecha de salida debe ser futura';
    }

    if (!form.price_per_seat || Number(form.price_per_seat) <= 0) {
      newErrors.price_per_seat = 'El precio debe ser mayor a 0';
    }

    if (!form.total_seats || Number(form.total_seats) <= 0) {
      newErrors.total_seats = 'Los asientos deben ser mayores a 0';
    }

    if (
      form.available_seats !== undefined &&
      Number(form.available_seats) > Number(form.total_seats)
    ) {
      newErrors.available_seats = 'No puede superar el total de asientos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPayload = (): CreateTripPayload => {
    const payload: CreateTripPayload = {
      ...form,
      price_per_seat: Number(form.price_per_seat),
      total_seats: Number(form.total_seats),
      status: 'published',
    };

    if (form.available_seats !== undefined && form.available_seats !== null) {
      payload.available_seats = Number(form.available_seats);
    } else {
      delete payload.available_seats;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = formatPayload();
      await tripService.createTrip(payload);
      toast.show({
        title: 'Viaje publicado',
        description: 'Tu viaje se publicó correctamente.',
        bg: 'success.600',
      });
      setForm(initialForm);
      setErrors({});
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'No se pudo publicar el viaje';
      toast.show({
        title: 'Error',
        description: message,
        bg: 'error.600',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      bg="white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box flex={1} px={6} py={8} bg="white">
          <Heading size="lg" color="neutral.900" mb={2}>
            Publicar viaje
          </Heading>
          <Text color="neutral.500" mb={6}>
            Completa los datos para publicar un viaje disponible para la comunidad.
          </Text>

          <VStack space={5}>
            <FormControl isInvalid={Boolean(errors.origin)}>
              <FormControl.Label>Origen</FormControl.Label>
              <Input
                placeholder="Ciudad de origen"
                value={form.origin}
                onChangeText={(value) => handleChange('origin', value)}
                autoCapitalize="words"
              />
              <FormControl.ErrorMessage>{errors.origin}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.destination)}>
              <FormControl.Label>Destino</FormControl.Label>
              <Input
                placeholder="Ciudad de destino"
                value={form.destination}
                onChangeText={(value) => handleChange('destination', value)}
                autoCapitalize="words"
              />
              <FormControl.ErrorMessage>{errors.destination}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.departure_time)}>
              <FormControl.Label>Fecha y hora de salida</FormControl.Label>
              <DateInput
                mode="datetime"
                value={form.departure_time}
                placeholder="Selecciona fecha y hora"
                onChange={(date) => handleChange('departure_time', date.toISOString())}
                minimumDate={new Date()}
                isInvalid={Boolean(errors.departure_time)}
              />
              <FormControl.ErrorMessage>{errors.departure_time}</FormControl.ErrorMessage>
            </FormControl>

            <HStack space={4}>
              <FormControl flex={1} isInvalid={Boolean(errors.price_per_seat)}>
                <FormControl.Label>Precio por asiento</FormControl.Label>
                <Input
                  placeholder="0"
                  value={form.price_per_seat ? String(form.price_per_seat) : ''}
                  onChangeText={(value) =>
                    handleChange('price_per_seat', Number(value.replace(',', '.')))
                  }
                  keyboardType="decimal-pad"
                />
                <FormControl.ErrorMessage>{errors.price_per_seat}</FormControl.ErrorMessage>
              </FormControl>

              <FormControl flex={1} isInvalid={Boolean(errors.total_seats)}>
                <FormControl.Label>Total de asientos</FormControl.Label>
                <Input
                  placeholder="1"
                  value={form.total_seats ? String(form.total_seats) : ''}
                  onChangeText={(value) =>
                    handleChange('total_seats', Number(value.replace(',', '.')))
                  }
                  keyboardType="number-pad"
                />
                <FormControl.ErrorMessage>{errors.total_seats}</FormControl.ErrorMessage>
              </FormControl>
            </HStack>

            <Button
              bg="primary.600"
              _pressed={{ bg: 'primary.700' }}
              onPress={handleSubmit}
              isLoading={isSubmitting}
            >
              Publicar viaje
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

