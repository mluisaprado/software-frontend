/**
 * Tests básicos para DateInput
 * 
 * NOTA: Los tests de renderizado completo requieren mockear
 * @react-native-community/datetimepicker que tiene problemas de parsing
 * con la configuración actual de Jest. Estos tests básicos verifican
 * que el módulo se exporta correctamente.
 */

// Mock del datetimepicker antes de importar DateInput
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('View', { testID: 'dateTimePicker' }),
    DateTimePickerAndroid: {},
  };
});

// Mock de native-base
jest.mock('native-base', () => {
  const React = require('react');
  return {
    Box: ({ children }: any) => React.createElement('View', {}, children),
    Input: (props: any) => React.createElement('TextInput', props),
    useTheme: () => ({}),
  };
});

describe('DateInput', () => {
  it('debe exportar el componente correctamente', () => {
    // Importar después de configurar los mocks
    const DateInput = require('../DateInput').default;
    expect(DateInput).toBeDefined();
    expect(typeof DateInput).toBe('function');
  });
});

