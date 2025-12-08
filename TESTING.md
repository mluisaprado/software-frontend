# 🧪 Guía de Testing

Este proyecto utiliza **Jest** y **React Testing Library** para realizar tests unitarios y de integración.

## 📋 Tabla de Contenidos

- [Dependencias](#-dependencias-instaladas)
- [Comandos](#-comandos-disponibles)
- [Estructura de Tests](#-estructura-de-tests)
- [Guía de Escritura de Tests](#-guía-de-escritura-de-tests)
- [Ejemplos Prácticos](#-ejemplos-prácticos)
- [Configuración](#-configuración)
- [CI/CD Integration](#-cicd-integration)
- [Buenas Prácticas](#-buenas-prácticas)
- [Troubleshooting](#-troubleshooting)
- [Recursos](#-recursos)

## 📦 Dependencias Instaladas

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "jest-expo": "^51.0.3",
    "@testing-library/react-native": "^12.4.3",
    "@testing-library/jest-native": "^5.4.3",
    "react-test-renderer": "19.1.0",
    "@types/jest": "^29.5.12",
    "jest-transform-stub": "^2.0.0",
    "prettier": "^3.7.4"
  }
}
```

### Descripción de Dependencias

- **jest**: Framework de testing principal
- **jest-expo**: Preset de Jest configurado para Expo
- **@testing-library/react-native**: Utilidades para testear componentes React Native
- **react-test-renderer**: Para renderizar componentes en tests
- **@types/jest**: Tipos de TypeScript para Jest

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar un test específico
npm test -- authService.test.ts

# Ejecutar tests en modo verbose (más información)
npm test -- --verbose
```

## 📁 Estructura de Tests

Los tests deben ubicarse junto a los archivos que prueban o en carpetas `__tests__`:

```
src/
├── services/
│   ├── authService.ts
│   └── __tests__/
│       └── authService.test.ts          ✅ Tests de servicios
├── components/
│   ├── DateInput.tsx
│   └── __tests__/
│       └── DateInput.test.tsx          ✅ Tests de componentes
├── utils/
│   ├── storage.ts
│   └── __tests__/
│       └── storage.test.ts             ✅ Tests de utilidades
└── context/
    ├── AuthContext.tsx
    └── __tests__/
        └── AuthContext.test.tsx        ✅ Tests de contextos
```

### Convenciones de Nombres

- Archivos de test: `*.test.ts` o `*.test.tsx`
- Archivos de spec: `*.spec.ts` o `*.spec.tsx`
- Carpetas: `__tests__/` junto al archivo fuente

## ✍️ Guía de Escritura de Tests

### 1. Test de Servicios

Los servicios son funciones que interactúan con APIs o realizan lógica de negocio.

**Estructura básica:**

```typescript
import { serviceFunction } from '../serviceFile';
import api from '../apiClient';

// Mock de dependencias externas
jest.mock('../apiClient');

describe('serviceFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks antes de cada test
  });

  it('debe hacer X cuando Y', async () => {
    // Arrange: Preparar datos y mocks
    const mockData = { /* ... */ };
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });

    // Act: Ejecutar la función
    const result = await serviceFunction();

    // Assert: Verificar resultados
    expect(result).toEqual(mockData);
    expect(api.get).toHaveBeenCalledWith('/endpoint');
  });
});
```

### 2. Test de Utilidades

Las utilidades son funciones puras o helpers que no dependen de APIs.

```typescript
import { utilityFunction } from '../utilityFile';

describe('utilityFunction', () => {
  it('debe retornar X cuando recibe Y', () => {
    const input = 'test';
    const expected = 'expected output';
    
    const result = utilityFunction(input);
    
    expect(result).toBe(expected);
  });

  it('debe manejar casos edge', () => {
    expect(utilityFunction(null)).toBe(null);
    expect(utilityFunction(undefined)).toBe(undefined);
  });
});
```

### 3. Test de Componentes

Los componentes React Native requieren mocks adicionales.

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

// Mock de dependencias antes de importar
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
}));

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Texto esperado')).toBeTruthy();
  });
});
```

## 📚 Ejemplos Prácticos

### Ejemplo 1: Test de Servicio de Autenticación

```typescript
// src/services/__tests__/authService.test.ts
import { authService } from '../authService';
import api from '../apiClient';
import { LoginCredentials } from '../../types/auth.types';

jest.mock('../apiClient');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe hacer login exitosamente con credenciales válidas', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Login exitoso',
          data: {
            token: 'mock-token-123',
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
            },
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.token).toBe('mock-token-123');
      expect(result.user.email).toBe('test@example.com');
    });

    it('debe lanzar error con credenciales inválidas', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toThrow(
        'Credenciales inválidas'
      );
    });
  });
});
```

### Ejemplo 2: Test de Utilidad de Almacenamiento

```typescript
// src/utils/__tests__/storage.test.ts
import storage from '../storage';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('web platform', () => {
    it('debe guardar un item en localStorage', async () => {
      const mockLocalStorage = {
        setItem: jest.fn(),
      };
      global.localStorage = mockLocalStorage as any;

      await storage.setItem('test-key', 'test-value');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        'test-value'
      );
    });
  });
});
```

### Ejemplo 3: Test de Componente

```typescript
// src/components/__tests__/DateInput.test.tsx
import React from 'react';
import DateInput from '../DateInput';

// Mock de dependencias
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('native-base', () => ({
  Box: ({ children }: any) => children,
  Input: (props: any) => <input {...props} />,
  useTheme: () => ({}),
}));

describe('DateInput', () => {
  it('debe exportar el componente correctamente', () => {
    expect(DateInput).toBeDefined();
    expect(typeof DateInput).toBe('function');
  });
});
```

## 🔧 Configuración

### jest.config.js

```javascript
module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|...)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  testEnvironment: 'jsdom',
};
```

### jest.setup.js

Este archivo configura mocks globales que se aplican a todos los tests:

- ✅ Mock de `expo-secure-store`
- ✅ Mock de `native-base`
- ✅ Mock de `@react-navigation/native`
- ✅ Mock de `axios`
- ✅ Configuración de `localStorage` para web

## 🔄 CI/CD Integration

Los tests se ejecutan automáticamente en el pipeline de CI/CD:

```yaml
# .github/workflows/web-netlify.yml
test:
  name: 🧪 Tests
  runs-on: ubuntu-latest
  needs: lint
  steps:
    - name: Instalar dependencias
      run: npm ci --legacy-peer-deps
    - name: Ejecutar tests
      run: npm test -- --coverage --coverageReporters=text --coverageReporters=lcov
```

**Flujo del pipeline:**
```
Lint → Test → Build → Deploy
```

Los tests deben pasar para que el build continúe.

## 📝 Buenas Prácticas

### 1. Nombres Descriptivos

✅ **Bueno:**
```typescript
it('debe retornar error cuando el email no existe', async () => {
  // ...
});
```

❌ **Malo:**
```typescript
it('test 1', async () => {
  // ...
});
```

### 2. Un Test, Una Aserción

✅ **Bueno:**
```typescript
it('debe validar el formato de email', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('debe rechazar emails inválidos', () => {
  expect(isValidEmail('invalid')).toBe(false);
});
```

❌ **Malo:**
```typescript
it('debe validar emails', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
  expect(isValidEmail('invalid')).toBe(false);
  expect(isValidEmail('another@test.com')).toBe(true);
});
```

### 3. Usar `beforeEach` para Limpiar Estado

```typescript
describe('service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks
    // Resetear estado si es necesario
  });
});
```

### 4. Mockear Dependencias Externas

```typescript
// Siempre mockear APIs, navegación, storage, etc.
jest.mock('../apiClient');
jest.mock('@react-navigation/native');
jest.mock('expo-secure-store');
```

### 5. Testear Casos Edge

```typescript
describe('function', () => {
  it('debe manejar valores null', () => {
    expect(function(null)).toBe(null);
  });

  it('debe manejar valores undefined', () => {
    expect(function(undefined)).toBe(undefined);
  });

  it('debe manejar arrays vacíos', () => {
    expect(function([])).toEqual([]);
  });
});
```

### 6. Cobertura de Código

- **Objetivo mínimo**: 70% de cobertura
- **Ideal**: 80%+ de cobertura
- **Crítico**: 100% en funciones críticas (autenticación, pagos, etc.)

Ver cobertura:
```bash
npm run test:coverage
```

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Problema:** Jest no puede encontrar un módulo.

**Solución:**
1. Verifica que el módulo esté instalado: `npm list <module-name>`
2. Verifica que esté en `package.json`
3. Ejecuta `npm install --legacy-peer-deps`
4. Verifica `transformIgnorePatterns` en `jest.config.js`

### Error: "SyntaxError: Unexpected token"

**Problema:** Babel no está transformando correctamente el código.

**Solución:**
1. Verifica `babel.config.js`
2. Asegúrate de que `babel-preset-expo` esté instalado
3. Verifica `transformIgnorePatterns` en `jest.config.js`

### Error: "Object.defineProperty called on non-object"

**Problema:** Conflicto con `jest-expo` y React Native.

**Solución:**
- Ya resuelto: Usamos preset `react-native` en lugar de `jest-expo`
- Si persiste, verifica que `jest.setup.js` esté configurado correctamente

### Tests muy lentos

**Problema:** Los tests tardan mucho en ejecutarse.

**Solución:**
```bash
# Limitar workers
npm test -- --maxWorkers=2

# Ejecutar solo tests modificados
npm test -- --onlyChanged
```

### Mock no funciona

**Problema:** El mock no se está aplicando correctamente.

**Solución:**
1. Verifica que el mock esté antes de importar el módulo
2. Usa `jest.resetModules()` si es necesario
3. Verifica que el path del mock sea correcto

```typescript
// ✅ Correcto: Mock antes de importar
jest.mock('../apiClient');
import api from '../apiClient';

// ❌ Incorrecto: Importar antes del mock
import api from '../apiClient';
jest.mock('../apiClient');
```

## 📊 Reporte de Cobertura

### Ver Cobertura Localmente

```bash
npm run test:coverage
```

Esto genera:
- Reporte en consola
- Carpeta `coverage/` con reporte HTML
- Archivo `coverage/lcov.info` para herramientas externas

### Cobertura Actual

Ejecuta `npm run test:coverage` para ver el reporte actual. Los objetivos son:

- **Servicios**: 80%+ (lógica de negocio crítica)
- **Utils**: 80%+ (funciones puras fáciles de testear)
- **Componentes**: 60%+ (puede ser más bajo debido a complejidad)
- **Contextos**: 70%+ (lógica de estado)

## 📚 Recursos

### Documentación Oficial

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing-with-jest/)

### Artículos y Tutoriales

- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)
- [Jest Matchers](https://jestjs.io/docs/using-matchers)
- [Mocking in Jest](https://jestjs.io/docs/mock-functions)

### Herramientas Relacionadas

- [Codecov](https://codecov.io/) - Reporte de cobertura en línea
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)

## 🎯 Checklist para Nuevos Tests

Al crear un nuevo test, asegúrate de:

- [ ] El test tiene un nombre descriptivo
- [ ] El test verifica una sola cosa
- [ ] Las dependencias externas están mockeadas
- [ ] Se usan `beforeEach` para limpiar estado
- [ ] Se testean casos edge (null, undefined, arrays vacíos)
- [ ] El test es rápido (< 1 segundo)
- [ ] El test es determinístico (mismo resultado siempre)
- [ ] El test está en la carpeta correcta (`__tests__/`)

## 💡 Tips Adicionales

1. **Usa `describe` para agrupar tests relacionados:**
```typescript
describe('authService', () => {
  describe('login', () => {
    // tests de login
  });
  
  describe('register', () => {
    // tests de register
  });
});
```

2. **Usa `test.each` para tests similares:**
```typescript
test.each([
  ['test@example.com', true],
  ['invalid', false],
  ['', false],
])('debe validar email %s como %s', (email, expected) => {
  expect(isValidEmail(email)).toBe(expected);
});
```

3. **Usa snapshots con cuidado:**
```typescript
it('debe renderizar correctamente', () => {
  const component = render(<MyComponent />);
  expect(component.toJSON()).toMatchSnapshot();
});
```

---

**¿Necesitas ayuda?** Revisa los tests existentes en `src/**/__tests__/` como referencia.
