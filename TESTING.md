# 🧪 Guía de Testing

Este proyecto utiliza **Jest** y **React Testing Library** para realizar tests unitarios y de integración.

## 📦 Dependencias Instaladas

- `jest` - Framework de testing
- `jest-expo` - Preset de Jest para Expo
- `@testing-library/react-native` - Utilidades para testear componentes React Native
- `@testing-library/jest-native` - Matchers adicionales para Jest
- `react-test-renderer` - Para renderizar componentes en tests
- `@types/jest` - Tipos de TypeScript para Jest

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## 📁 Estructura de Tests

Los tests deben ubicarse junto a los archivos que prueban o en carpetas `__tests__`:

```
src/
├── services/
│   ├── authService.ts
│   └── __tests__/
│       └── authService.test.ts
├── components/
│   ├── DateInput.tsx
│   └── __tests__/
│       └── DateInput.test.tsx
└── utils/
    ├── storage.ts
    └── __tests__/
        └── storage.test.ts
```

## ✍️ Ejemplos de Tests

### Test de Servicio

```typescript
import { authService } from '../authService';
import api from '../apiClient';

jest.mock('../apiClient');

describe('authService', () => {
  it('debe hacer login exitosamente', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'mock-token',
          user: { id: 1, email: 'test@example.com' },
        },
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.token).toBe('mock-token');
  });
});
```

### Test de Componente

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateInput from '../DateInput';

describe('DateInput', () => {
  it('debe renderizar correctamente', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <DateInput
        placeholder="Selecciona una fecha"
        onChange={mockOnChange}
      />
    );

    expect(getByPlaceholderText('Selecciona una fecha')).toBeTruthy();
  });
});
```

## 🔧 Configuración

### jest.config.js

Configuración principal de Jest con:
- Preset `jest-expo` para Expo
- Transformación de módulos de React Native
- Setup de mocks automático

### jest.setup.js

Archivo de configuración que:
- Mockea `expo-secure-store`
- Mockea `native-base`
- Mockea `@react-navigation/native`
- Mockea `axios`

## 📝 Buenas Prácticas

1. **Nombres descriptivos**: Usa nombres claros para tus tests
2. **Un test, una aserción**: Cada test debe verificar una cosa
3. **Mocks apropiados**: Mockea dependencias externas (APIs, navegación, etc.)
4. **Cobertura**: Apunta a al menos 70% de cobertura de código
5. **Tests rápidos**: Los tests deben ejecutarse rápidamente

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Verifica que las dependencias estén instaladas: `npm install`
- Asegúrate de que el módulo esté en `node_modules`

### Error: "SyntaxError: Unexpected token"
- Verifica que `babel.config.js` esté configurado correctamente
- Asegúrate de que `jest-expo` esté instalado

### Tests muy lentos
- Usa `--maxWorkers=2` para limitar workers
- Verifica que no haya tests que hagan llamadas reales a APIs

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing-with-jest/)

