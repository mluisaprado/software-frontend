// Los matchers de @testing-library/react-native v12.4+ están integrados

// Mock de Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock de NativeBase - simplificado para evitar problemas de parsing
jest.mock('native-base', () => {
  const React = require('react');
  
  return {
    Box: ({ children, ...props }) => React.createElement('View', props, children),
    VStack: ({ children, ...props }) => React.createElement('View', props, children),
    HStack: ({ children, ...props }) => React.createElement('View', props, children),
    Text: ({ children, ...props }) => React.createElement('Text', props, children),
    Heading: ({ children, ...props }) => React.createElement('Text', props, children),
    Input: (props) => React.createElement('TextInput', props),
    Button: ({ children, onPress, ...props }) => 
      React.createElement('TouchableOpacity', { ...props, onPress }, children),
    FormControl: ({ children }) => React.createElement('View', {}, children),
    'FormControl.Label': ({ children }) => React.createElement('Text', {}, children),
    'FormControl.ErrorMessage': ({ children }) => React.createElement('Text', {}, children),
    Select: ({ children }) => React.createElement('View', {}, children),
    'Select.Item': ({ children }) => React.createElement('View', {}, children),
    Spinner: () => React.createElement('ActivityIndicator'),
    useToast: () => ({
      show: jest.fn(),
    }),
    Badge: ({ children }) => React.createElement('View', {}, children),
    Pressable: ({ children, onPress, ...props }) => 
      React.createElement('TouchableOpacity', { ...props, onPress }, children),
    NativeBaseProvider: ({ children }) => children,
    useTheme: () => ({}),
  };
});

// Mock de React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock de Axios
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => actualAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };
});

// Mock de expo-secure-store para web
if (typeof window !== 'undefined') {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

