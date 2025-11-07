import React from 'react';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  VStack,
  Pressable,
  Avatar,
  Badge,
  Divider,
} from 'native-base';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  const popularDestinations = [
    { name: 'Manquehuito', icon: '🏔️' },
    { name: 'Aeropuerto', icon: '✈️' },
    { name: 'San Cristóbal', icon: '⛰️' },
    { name: 'Centro', icon: '🏢' },
  ];

  const recentTrips = [
    {
      id: '1',
      driver: 'Joseph Brostito',
      location: 'San Joaquín',
      distance: '120.2 KM',
      rating: 4.8,
      reviews: 120,
      avatar: '👨‍💼',
    },
  ];

  return (
    <Box flex={1} bg="white">
      <Box safeAreaTop />

      <Box px={6} py={4}>
        <HStack alignItems="center" justifyContent="space-between">
          <VStack flex={1} pr={4}>
            <Text fontSize="2xl" fontWeight="bold" color="neutral.900">
              Hola, Bienvenida {user?.name?.split(' ')[0] || 'Usuario'}
            </Text>
          </VStack>
          <Avatar bg="primary.600" size="lg">
            👤
          </Avatar>
        </HStack>
      </Box>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <Box px={6} mb={6}>
          <Box bg="primary.600" borderRadius="2xl" p={6}>
            <HStack alignItems="center" mb={4}>
              <Avatar bg="white" size="xl" mr={4}>
                👩
              </Avatar>
              <VStack flex={1}>
                <Text color="white" fontSize="lg" fontWeight="semibold">
                  {user?.name || 'María Luisa Prado'}
                </Text>
                <HStack alignItems="center" mt={1} space={2}>
                  <Text color="yellow.300" fontSize="sm">
                    ⭐⭐⭐⭐⭐
                  </Text>
                  <Text color="white" fontSize="sm">
                    4.5 Estrellas
                  </Text>
                </HStack>
              </VStack>
              <Pressable hitSlop={8}>
                <Text color="white" fontSize="xl">
                  ›
                </Text>
              </Pressable>
            </HStack>

            <HStack
              bg="primary.500:alpha.40"
              borderRadius="xl"
              px={4}
              py={3}
              alignItems="center"
              space={3}
            >
              <Text color="white" fontSize="lg">
                📅
              </Text>
              <Text color="white" flex={1}>
                ¿Vas a alguna parte? Sube tu viaje
              </Text>
            </HStack>
          </Box>
        </Box>

        <Box px={6} mb={6}>
          <HStack
            alignItems="center"
            bg="neutral.100"
            borderRadius="xl"
            px={4}
            py={4}
            space={3}
          >
            <Text color="neutral.500" fontSize="lg">
              🔍
            </Text>
            <Text color="neutral.500" flex={1}>
              Busca tu próximo destino
            </Text>
          </HStack>
        </Box>

        <Box px={6} mb={6}>
          <Text fontSize="lg" fontWeight="semibold" color="neutral.900" mb={4}>
            Destinos populares
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={4}>
              {popularDestinations.map((destination) => (
                <Pressable key={destination.name} alignItems="center">
                  <Box
                    width={16}
                    height={16}
                    borderRadius="full"
                    bg="neutral.100"
                    mb={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">{destination.icon}</Text>
                  </Box>
                  <Text fontSize="sm" color="neutral.700" textAlign="center">
                    {destination.name}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </Box>

        <Box px={6} mb={6}>
          <Text fontSize="lg" fontWeight="semibold" color="neutral.900" mb={4}>
            Viajes recientes
          </Text>

          <VStack space={4}>
            {recentTrips.map((trip) => (
              <Box
                key={trip.id}
                borderWidth={1}
                borderColor="neutral.200"
                borderRadius="2xl"
                p={4}
                bg="white"
                shadow={1}
              >
                <HStack alignItems="center" mb={3} space={3}>
                  <Avatar bg="neutral.100" size="md">
                    {trip.avatar}
                  </Avatar>
                  <VStack flex={1}>
                    <Text fontWeight="semibold" color="neutral.900">
                      {trip.driver}
                    </Text>
                    <Text fontSize="sm" color="neutral.500">
                      {trip.location}
                    </Text>
                  </VStack>
                  <VStack alignItems="flex-end" space={1}>
                    <HStack alignItems="center" space={1}>
                      <Text fontSize="sm" color="neutral.500">
                        📍
                      </Text>
                      <Text fontSize="sm" color="neutral.700">
                        {trip.distance}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme="accent"
                      variant="subtle"
                      borderRadius="lg"
                      _text={{ fontSize: 'xs', fontWeight: 'medium', color: 'accent.600' }}
                    >
                      {trip.rating} ⭐
                    </Badge>
                  </VStack>
                </HStack>

                <Divider bg="neutral.100" mb={3} />

                <Pressable
                  alignSelf="flex-end"
                  borderRadius="lg"
                  bg="accent.500"
                  px={4}
                  py={2}
                >
                  <Text color="white" fontSize="sm" fontWeight="semibold">
                    Deja un comentario
                  </Text>
                </Pressable>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box height={20} />
      </ScrollView>
    </Box>
  );
}
