// Mock @react-native-async-storage/async-storage with actual storage
const storage = new Map();

const mockAsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(storage.get(key) || null)),
  setItem: jest.fn((key, value) => {
    storage.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    storage.delete(key);
    return Promise.resolve();
  }),
  multiGet: jest.fn((keys) =>
    Promise.resolve(keys.map(key => [key, storage.get(key) || null]))
  ),
  multiSet: jest.fn((pairs) => {
    pairs.forEach(([key, value]) => storage.set(key, value));
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach(key => storage.delete(key));
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Array.from(storage.keys()))),
  clear: jest.fn(() => {
    storage.clear();
    return Promise.resolve();
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}));

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Link: 'Link',
  Redirect: 'Redirect',
  Href: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
  useFocusEffect: jest.fn(),
}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup custom matchers
import { extendMatchers } from './__tests__/utils/testHelpers';
extendMatchers();

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  storage.clear();
});

