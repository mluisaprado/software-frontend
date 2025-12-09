import React, { useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TripsSearchScreen from '../screens/TripsSearchScreen';
import TripCreateScreen from '../screens/TripCreateScreen';
import ProfileScreen from "../screens/ProfileScreen";
import { View, Text, ActivityIndicator, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import MyTripsScreen from '../screens/MyTripsScreen';
import TripReservationsScreen from '../screens/TripReservationsScreen';
import ChatScreen from '../screens/chatScreen';
import MyUpcomingTripsScreen from '../screens/MyUpcomingTripsScreen';
import { authService } from '../services/authService';
import { API_BASE_URL } from '../services/apiClient';
import { useNavigation } from '@react-navigation/native';
import storage from '../utils/storage';
import MyPastTripsScreen from "../screens/MyPastTripsScreen";
import RateReservationScreen from "../screens/RateReservationScreen";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AppStack = createStackNavigator();

// Stack de autenticación (Login/Register)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
    
  );
}

// Tab Navigator para usuarios autenticados
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="TripsSearch"
        component={TripsSearchScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="TripCreate"
        component={TripCreateScreen}
        options={{
          tabBarLabel: 'Publicar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>➕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator>
      {/* Pantalla principal: las tabs */}
      <AppStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Pantalla para VISITAR perfil de otro usuario (CU5) */}
      <AppStack.Screen
        name="ProfileDetail"
        component={ProfileScreen} 
        options={{ title: "Perfil" }}
      />
      <AppStack.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{ title: 'Mis viajes' }}
      />
      <AppStack.Screen
        name="TripReservations"
        component={TripReservationsScreen}
        options={{ title: 'Solicitudes' }}
      />
      
      <AppStack.Screen
        name="MyUpcomingTrips"
        component={MyUpcomingTripsScreen}
        options={{ title: 'Próximos viajes' }}
      />

      <AppStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />

      <AppStack.Screen
        name="MyPastTrips"
        component={MyPastTripsScreen}
        options={{ title: "Historial de viajes" }}
      />

      <AppStack.Screen
        name="RateReservation"
        component={RateReservationScreen}
        options={{ title: "Calificar viaje" }}
      />
    </AppStack.Navigator>

    
  );
}

function AccountScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Construir URL completa de la imagen
  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return null;
    // Si ya es una URL completa, retornarla
    if (user.profile_picture.startsWith('http')) {
      return user.profile_picture;
    }
    // Construir URL completa con el base URL del backend
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${user.profile_picture}`;
  };

  // Cargar foto de perfil al montar el componente
  React.useEffect(() => {
    if (user?.profile_picture) {
      const url = getProfilePictureUrl();
      setProfilePicture(url);
    } else {
      setProfilePicture(null);
    }
  }, [user?.profile_picture]);

  const handleSelectImage = () => {
    if (Platform.OS === 'web') {
      // En web, usar input file
      fileInputRef.current?.click();
    } else {
      // En móvil, usar expo-image-picker (se puede implementar después)
      Alert.alert('Info', 'La selección de imagen en móvil se implementará próximamente');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await authService.uploadProfilePicture(file);
      
      // Actualizar el usuario en el storage
      const updatedUser = { ...user, profile_picture: result.profile_picture };
      await storage.setItem('userData', JSON.stringify(updatedUser));
      
      // Actualizar el estado local para mostrar la nueva imagen inmediatamente
      const baseUrl = API_BASE_URL.replace('/api', '');
      const newUrl = `${baseUrl}${result.profile_picture}`;
      setProfilePicture(newUrl);
      
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
      
      // Recargar el perfil del usuario para obtener datos actualizados del backend
      try {
        const profileData = await authService.getProfile();
        if (profileData?.profile_picture) {
          const updatedUserData = { ...user, ...profileData };
          await storage.setItem('userData', JSON.stringify(updatedUserData));
          // Actualizar la URL de la imagen con los datos del backend
          const backendUrl = profileData.profile_picture.startsWith('http') 
            ? profileData.profile_picture 
            : `${baseUrl}${profileData.profile_picture}`;
          setProfilePicture(backendUrl);
        }
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        // Aún así, la imagen ya se actualizó localmente
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo subir la foto de perfil');
    } finally {
      setIsUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 24,
      }}
    >
      {/* Input file oculto para web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {/* Avatar con foto de perfil */}
      <TouchableOpacity
        onPress={handleSelectImage}
        disabled={isUploading}
        style={{
          marginBottom: 24,
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            backgroundColor: '#dbeafe',
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: '#2563eb',
          }}
        >
          {(profilePicture || getProfilePictureUrl()) ? (
            <Image
              source={{ uri: profilePicture || getProfilePictureUrl()! }}
              style={{
                width: 96,
                height: 96,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 32 }}>👤</Text>
          )}
        </View>
        {isUploading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color="white" />
          </View>
        )}
      </TouchableOpacity>
      
      {Platform.OS === 'web' && (
        <TouchableOpacity
          onPress={handleSelectImage}
          disabled={isUploading}
          style={{
            marginBottom: 24,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#2563eb', fontSize: 14, fontWeight: '500' }}>
            {isUploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Nombre + mail */}
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 8,
        }}
      >
        {user?.name || 'Usuario'}
      </Text>

      <Text style={{ color: '#6b7280', marginBottom: 32 }}>
        {user?.email}
      </Text>

      {/* Botón gestionar solicitudes */}
      <TouchableOpacity
        style={{
          backgroundColor: '#2563eb',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 32,
          marginBottom: 12,
        }}
        onPress={() => navigation.navigate('MyTrips')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Gestionar solicitudes
        </Text>
      </TouchableOpacity>
      {/* Botón próximos viajes */}
      <TouchableOpacity
        style={{
          backgroundColor: '#10b981', // verde bonito
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 32,
          marginBottom: 12,
        }}
        onPress={() => navigation.navigate('MyUpcomingTrips')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Próximos viajes
        </Text>
      </TouchableOpacity>

    <TouchableOpacity
      style={{
        backgroundColor: "#f59e0b", // amarillo
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginBottom: 12,
      }}
      onPress={() => navigation.navigate("MyPastTrips")}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        Historial de viajes
      </Text>
    </TouchableOpacity>


      {/* Botón logout */}
      <TouchableOpacity
        style={{
          backgroundColor: '#ef4444',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 32,
        }}
        onPress={logout}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Pantalla de carga
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={{ color: '#6b7280', marginTop: 16 }}>Cargando...</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
