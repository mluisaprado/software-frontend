import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Mock de expo-secure-store
jest.mock('expo-secure-store');

// Mock de localStorage antes de importar storage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock de window para web
Object.defineProperty(global, 'window', {
  value: { localStorage: mockLocalStorage },
  writable: true,
});

jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

// Importar storage después de configurar los mocks
import storage from '../storage';

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear mocks
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('web platform', () => {
    beforeEach(() => {
      (Platform.OS as any) = 'web';
    });

    it('debe guardar un item en localStorage', async () => {
      await storage.setItem('test-key', 'test-value');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('debe obtener un item de localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-value');

      const result = await storage.getItem('test-key');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('debe eliminar un item de localStorage', async () => {
      await storage.deleteItem('test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });

  // Nota: Los tests de plataforma móvil requieren re-importar el módulo
  // después de cambiar Platform.OS, lo cual es complejo. Para este proyecto
  // enfocado en web, los tests de web son suficientes.
  // Si necesitas testear mobile, considera usar jest.resetModules() y
  // re-importar el módulo storage después de cambiar el mock de Platform.
});

