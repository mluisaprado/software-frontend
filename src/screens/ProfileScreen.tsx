// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Box, VStack, Heading, Text, Spinner } from "native-base";

type RootStackParamList = {
  ProfileDetail: { userId: number };
  // acá van las otras rutas que ya tengan definidas en tu app
};

type ProfileDetailParams = RootStackParamList["ProfileDetail"];

interface User {
  id: number;
  name: string;
  email?: string;
}

export default function ProfileScreen() {
  const route = useRoute();
  const { userId } = (route.params as ProfileDetailParams) ?? {};

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3000/api";

        const response = await fetch(`${baseUrl}/users/${userId}`);

        if (!response.ok) {
          throw new Error("No se pudo cargar el perfil");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Spinner />
        <Text mt={2}>Cargando perfil…</Text>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text>{error ?? "Usuario no encontrado"}</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} safeArea px={4} py={4}>
      <VStack space={3}>
        <Heading size="lg">{user.name}</Heading>
        {user.email && (
          <Text fontSize="md" color="gray.600">
            {user.email}
          </Text>
        )}
        {/* Aquí después podemos agregar rating, cantidad de viajes, etc. */}
      </VStack>
    </Box>
  );
}
