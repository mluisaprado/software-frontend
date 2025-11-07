import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/theme';

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NativeBaseProvider>
  );
}
