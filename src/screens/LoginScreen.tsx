import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  Heading,
  FormControl,
  Input,
  Button,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  HStack,
  Link,
  useToast,
} from 'native-base';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types/auth.types';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const toast = useToast();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({});

  const showAuthError = (message: string) => {
    toast.show({
      title: 'Error',
      description: message,
      placement: 'top',
      bg: 'error.600',
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'El email no es válido';
    }

    if (!credentials.password) {
      errors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    clearError();
    try {
      await login(credentials);
      toast.show({
        title: 'Sesión iniciada',
        placement: 'top',
        bg: 'success.600',
      });
    } catch {
      showAuthError('No se pudo iniciar sesión. Verifica tus credenciales.');
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      bg="white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box flex={1} px={8} py={12} bg="white">
          <VStack flex={1} space={10} justifyContent="center">
            <VStack space={3}>
              <Heading size="xl" color="neutral.900">
                ¡Bienvenido de vuelta!
              </Heading>
              <Text fontSize="md" color="neutral.600">
                Inicia sesión para continuar
              </Text>
            </VStack>

            <VStack space={5}>
              <FormControl isInvalid={Boolean(validationErrors.email)}>
                <FormControl.Label>Email</FormControl.Label>
                <Input
                  value={credentials.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <FormControl.ErrorMessage>
                  {validationErrors.email}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(validationErrors.password)}>
                <FormControl.Label>Contraseña</FormControl.Label>
                <Input
                  value={credentials.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  autoCapitalize="none"
                  secureTextEntry
                />
                <FormControl.ErrorMessage>
                  {validationErrors.password}
                </FormControl.ErrorMessage>
              </FormControl>

              {error && (
                <Alert status="error" borderRadius="xl">
                  <Alert.Icon />
                  <Text color="error.700" ml={2}>
                    {error}
                  </Text>
                </Alert>
              )}

              <Button
                bg="primary.600"
                _pressed={{ bg: 'primary.700' }}
                isLoading={isLoading}
                onPress={handleLogin}
              >
                Iniciar Sesión
              </Button>
            </VStack>

            <HStack justifyContent="center" alignItems="center" space={1} mt={6}>
              <Text color="neutral.600">¿No tienes cuenta?</Text>
              <Link
                _text={{ color: 'primary.600', fontWeight: 'semibold' }}
                onPress={() => navigation.navigate('Register')}
              >
                Regístrate aquí
              </Link>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
