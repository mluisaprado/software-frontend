import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'react-native';
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
  Spinner,
  useToast,
} from 'native-base';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import tripService from '../services/tripService';
import reservationService from '../services/reservationService';
import { Trip } from '../types/trip.types';
import { UpcomingReservation } from '../services/reservationService';
import { API_BASE_URL } from '../services/apiClient';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<UpcomingReservation[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Array<{ name: string; icon: string; count: number }>>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Construir URL completa de la imagen de perfil
  const getProfilePictureUrl = () => {
    // Intentar obtener de diferentes campos posibles
    const profilePic = 
      userProfile?.profile_picture || 
      userProfile?.avatar ||
      user?.profile_picture || 
      user?.avatar;
    
    if (!profilePic) return null;
    if (profilePic.startsWith('http')) {
      return profilePic;
    }
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${profilePic}`;
  };

  // Actualizar URL de foto de perfil cuando cambien los datos
  useEffect(() => {
    const url = getProfilePictureUrl();
    setProfilePictureUrl(url);
  }, [userProfile, user]);

  // Obtener datos del usuario
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      // El backend puede devolver { data: { ... } } o directamente el objeto
      const profileData = profile?.data || profile;
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      // Si falla, usar datos del contexto
      setUserProfile(user);
    }
  }, [user]);

  // Obtener viajes recientes (próximos viajes donde es pasajero)
  const fetchRecentTrips = useCallback(async () => {
    try {
      const upcomingTrips = await reservationService.listMyUpcomingTrips();
      // Limitar a los 3 más recientes
      const recent = upcomingTrips
        .sort((a, b) => new Date(b.trip.departure_time).getTime() - new Date(a.trip.departure_time).getTime())
        .slice(0, 3);
      setRecentTrips(recent);
    } catch (error: any) {
      console.error('Error al obtener viajes recientes:', error);
      setRecentTrips([]);
    }
  }, []);

  // Obtener destinos populares basados en viajes publicados
  const fetchPopularDestinations = useCallback(async () => {
    try {
      const trips = await tripService.listTrips({ status: 'published' });
      
      // Contar frecuencia de destinos
      const destinationCount: Record<string, number> = {};
      trips.forEach((trip) => {
        const dest = trip.destination;
        destinationCount[dest] = (destinationCount[dest] || 0) + 1;
      });

      // Obtener los 4 destinos más populares
      const sortedDestinations = Object.entries(destinationCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, count]) => ({
          name,
          count,
          icon: getDestinationIcon(name),
        }));

      setPopularDestinations(sortedDestinations);
    } catch (error) {
      console.error('Error al obtener destinos populares:', error);
      // Destinos por defecto si falla
      setPopularDestinations([
        { name: 'Manquehuito', icon: '🏔️', count: 0 },
        { name: 'Aeropuerto', icon: '✈️', count: 0 },
        { name: 'San Cristóbal', icon: '⛰️', count: 0 },
        { name: 'Centro', icon: '🏢', count: 0 },
      ]);
    }
  }, []);

  // Función helper para asignar iconos según el destino
  const getDestinationIcon = (destination: string): string => {
    const lowerDest = destination.toLowerCase();
    if (lowerDest.includes('manquehue') || lowerDest.includes('cerro')) return '🏔️';
    if (lowerDest.includes('aeropuerto') || lowerDest.includes('airport')) return '✈️';
    if (lowerDest.includes('cristóbal') || lowerDest.includes('cristobal')) return '⛰️';
    if (lowerDest.includes('centro') || lowerDest.includes('downtown')) return '🏢';
    if (lowerDest.includes('playa') || lowerDest.includes('beach')) return '🏖️';
    if (lowerDest.includes('mall') || lowerDest.includes('centro comercial')) return '🛍️';
    return '📍';
  };

  // Cargar todos los datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchRecentTrips(),
          fetchPopularDestinations(),
        ]);
      } catch (error) {
        toast.show({
          title: 'Error',
          description: 'No se pudieron cargar algunos datos',
          bg: 'warning.500',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchUserProfile, fetchRecentTrips, fetchPopularDestinations, toast]);

  const displayName = userProfile?.name || user?.name || 'Usuario';
  const firstName = displayName.split(' ')[0];
  const userRating = userProfile?.rating || user?.rating || 4.5;

  if (isLoading) {
    return (
      <Box flex={1} bg="white" alignItems="center" justifyContent="center">
        <Spinner size="lg" color="primary.600" />
        <Text mt={4} color="neutral.600">
          Cargando...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="white">
      <Box safeAreaTop />

      <Box px={6} py={4}>
        <HStack alignItems="center" justifyContent="space-between">
          <VStack flex={1} pr={4}>
            <Text fontSize="2xl" fontWeight="bold" color="neutral.900">
              Hola, Bienvenida {firstName}
            </Text>
          </VStack>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <Box
              width={16}
              height={16}
              borderRadius="full"
              bg="primary.600"
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
            >
              {profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <Text fontSize="xl" color="white">👤</Text>
              )}
            </Box>
          </Pressable>
        </HStack>
      </Box>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <Box px={6} mb={6}>
          <Pressable onPress={() => navigation.navigate('TripCreate')}>
            <Box bg="primary.600" borderRadius="2xl" p={6}>
              <HStack alignItems="center" mb={4}>
                <Box
                  width={20}
                  height={20}
                  borderRadius="full"
                  bg="white"
                  mr={4}
                  overflow="hidden"
                  alignItems="center"
                  justifyContent="center"
                >
                  {profilePictureUrl ? (
                    <Image
                      source={{ uri: profilePictureUrl }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text fontSize="2xl">👤</Text>
                  )}
                </Box>
                <VStack flex={1}>
                  <Text color="white" fontSize="lg" fontWeight="semibold">
                    {displayName}
                  </Text>
                  <HStack alignItems="center" mt={1} space={2}>
                    <Text color="yellow.300" fontSize="sm">
                      {'⭐'.repeat(Math.round(userRating))}
                    </Text>
                    <Text color="white" fontSize="sm">
                      {userRating.toFixed(1)} Estrellas
                    </Text>
                  </HStack>
                </VStack>
                <Pressable hitSlop={8} onPress={() => navigation.navigate('Profile')}>
                  <Text color="white" fontSize="xl">
                    ›
                  </Text>
                </Pressable>
              </HStack>

              <Pressable onPress={() => navigation.navigate('TripCreate')}>
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
              </Pressable>
            </Box>
          </Pressable>
        </Box>

        <Box px={6} mb={6}>
          <Pressable onPress={() => navigation.navigate('TripsSearch')}>
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
          </Pressable>
        </Box>

        {popularDestinations.length > 0 && (
          <Box px={6} mb={6}>
            <Text fontSize="lg" fontWeight="semibold" color="neutral.900" mb={4}>
              Destinos populares
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={4}>
                {popularDestinations.map((destination) => (
                  <Pressable
                    key={destination.name}
                    alignItems="center"
                    onPress={() => {
                      navigation.navigate('TripsSearch', {
                        destination: destination.name,
                      });
                    }}
                  >
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
                    {destination.count > 0 && (
                      <Text fontSize="xs" color="neutral.500" mt={1}>
                        {destination.count} viajes
                      </Text>
                    )}
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </Box>
        )}

        <Box px={6} mb={6}>
          <Text fontSize="lg" fontWeight="semibold" color="neutral.900" mb={4}>
            Última actividad
          </Text>

          {recentTrips.length === 0 ? (
            <Box
              borderWidth={1}
              borderColor="neutral.200"
              borderRadius="2xl"
              p={6}
              bg="neutral.50"
              alignItems="center"
            >
              <Text color="neutral.500" textAlign="center">
                No tienes viajes recientes
              </Text>
              <Pressable
                mt={4}
                borderRadius="lg"
                bg="primary.600"
                px={4}
                py={2}
                onPress={() => navigation.navigate('TripsSearch')}
              >
                <Text color="white" fontSize="sm" fontWeight="semibold">
                  Buscar viajes
                </Text>
              </Pressable>
            </Box>
          ) : (
            <VStack space={4}>
              {recentTrips.map((reservation) => {
                const trip = reservation.trip;
                const departureDate = new Date(trip.departure_time);
                const formattedDate = departureDate.toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <Box
                    key={reservation.id}
                    borderWidth={1}
                    borderColor="neutral.200"
                    borderRadius="2xl"
                    p={4}
                    bg="white"
                    shadow={1}
                  >
                    <HStack alignItems="center" mb={3} space={3}>
                      {trip.driver?.id ? (
                        <Pressable
                          onPress={() => {
                            const driverId = trip.driver?.id;
                            if (driverId) {
                              navigation.navigate('ProfileDetail', {
                                userId: driverId,
                              });
                            }
                          }}
                        >
                          <Avatar bg="neutral.100" size="md">
                            <Text fontSize="md">
                              {trip.driver.name?.charAt(0).toUpperCase() || '👤'}
                            </Text>
                          </Avatar>
                        </Pressable>
                      ) : (
                        <Avatar bg="neutral.100" size="md">
                          <Text fontSize="md">👤</Text>
                        </Avatar>
                      )}
                      <VStack flex={1}>
                        <Text fontWeight="semibold" color="neutral.900">
                          {trip.driver?.name || 'Conductor'}
                        </Text>
                        <Text fontSize="sm" color="neutral.500">
                          {trip.origin} → {trip.destination}
                        </Text>
                        <Text fontSize="xs" color="neutral.400" mt={1}>
                          {formattedDate}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme="primary"
                        variant="subtle"
                        borderRadius="lg"
                        _text={{ fontSize: 'xs', fontWeight: 'medium' }}
                      >
                        {reservation.status}
                      </Badge>
                    </HStack>

                    <Divider bg="neutral.100" mb={3} />

                    <Pressable
                      alignSelf="flex-end"
                      borderRadius="lg"
                      bg="primary.600"
                      px={4}
                      py={2}
                      onPress={() => {
                        const driverId = trip.driver?.id;
                        if (driverId) {
                          navigation.navigate('Chat', {
                            tripId: trip.id,
                            otherUserId: driverId,
                          });
                        } else {
                          toast.show({
                            title: 'Info',
                            description: 'No se puede acceder al chat de este viaje',
                            bg: 'warning.500',
                          });
                        }
                      }}
                    >
                      <Text color="white" fontSize="sm" fontWeight="semibold">
                        Chatear
                      </Text>
                    </Pressable>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>

        <Box height={20} />
      </ScrollView>
    </Box>
  );
}
