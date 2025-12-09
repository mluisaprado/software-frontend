// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";                         // 👈 nuevo
import { useRoute } from "@react-navigation/native";
import { Box, VStack, Heading, Text, Spinner } from "native-base";
import userService, { UserRatingsSummary } from "../services/userService";

type RootStackParamList = {
  ProfileDetail: { userId: number };
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

  const [ratingsSummary, setRatingsSummary] =
    useState<UserRatingsSummary | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  // 🔹 Calificaciones del usuario
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setIsLoadingRatings(true);
        const data = await userService.getUserRatings(userId);
        setRatingsSummary(data);
      } catch (err) {
        console.error("Error cargando ratings:", err);
      } finally {
        setIsLoadingRatings(false);
      }
    };

    if (userId) {
      loadRatings();
    }
  }, [userId]);

  // 🔹 Datos básicos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const baseUrl =
          process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:3000/api";

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

    if (userId) {
      fetchUser();
    }
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
      </VStack>

      {isLoadingRatings ? (
        <Text mt={4} color="gray.500">
          Cargando calificaciones...
        </Text>
      ) : (
        ratingsSummary && (
          <View
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#f9fafb",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Calificaciones recibidas
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 8 }}>
                ⭐ {ratingsSummary.average.toFixed(1)}
              </Text>
              <Text style={{ color: "#6b7280" }}>
                ({ratingsSummary.total}{" "}
                {ratingsSummary.total === 1 ? "opinión" : "opiniones"})
              </Text>
            </View>

            {ratingsSummary.ratings.slice(0, 3).map((r) => (
              <View key={r.id} style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "600" }}>
                  {r.author?.name ?? "Usuario anónimo"} · {r.score}★
                </Text>
                {r.trip && (
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    {r.trip.origin} → {r.trip.destination}
                  </Text>
                )}
                {r.comment && (
                  <Text
                    style={{ marginTop: 2, color: "#4b5563", fontSize: 13 }}
                  >
                    {r.comment}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )
      )}
    </Box>
  );
}
