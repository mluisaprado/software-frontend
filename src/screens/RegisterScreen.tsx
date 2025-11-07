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
import { RegisterCredentials } from '../types/auth.types';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const toast = useToast();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<RegisterCredentials>>({});

  const showRegisterError = (message: string) => {
    toast.show({
      title: 'Error',
      description: message,
      placement: 'top',
      bg: 'error.600',
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegisterCredentials> = {};

    if (!credentials.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (credentials.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

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

    if (!credentials.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (credentials.password !== credentials.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    clearError();
    try {
      await register(credentials);
    } catch {
      showRegisterError('No se pudo crear la cuenta. Inténtalo de nuevo.');
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials, value: string) => {
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
                ¡Únete a nosotros!
              </Heading>
              <Text fontSize="md" color="neutral.600">
                Crea tu cuenta y comienza a viajar
              </Text>
            </VStack>

            <VStack space={5}>
              <FormControl isInvalid={Boolean(validationErrors.name)}>
                <FormControl.Label>Nombre completo</FormControl.Label>
                <Input
                  value={credentials.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
                <FormControl.ErrorMessage>
                  {validationErrors.name}
                </FormControl.ErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(validationErrors.email)}>
                <FormControl.Label>Email</FormControl.Label>
                <Input
                  value={credentials.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
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

              <FormControl isInvalid={Boolean(validationErrors.confirmPassword)}>
                <FormControl.Label>Confirmar contraseña</FormControl.Label>
                <Input
                  value={credentials.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  autoCapitalize="none"
                  secureTextEntry
                />
                <FormControl.ErrorMessage>
                  {validationErrors.confirmPassword}
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
                onPress={handleRegister}
              >
                Crear Cuenta
              </Button>
            </VStack>

            <HStack justifyContent="center" alignItems="center" space={1} mt={6}>
              <Text color="neutral.600">¿Ya tienes cuenta?</Text>
              <Link
                _text={{ color: 'primary.600', fontWeight: 'semibold' }}
                onPress={() => navigation.navigate('Login')}
              >
                Inicia sesión aquí
              </Link>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
