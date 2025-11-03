# Testing Guide - React Native with Jest

## Quick Start

### Running Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- referral.test.tsx
```

## Writing Tests - Templates

### 1. Component Test Template

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MyComponent from '../app/MyComponent';
import { useAuth } from '@/contexts/AuthContext';
import * as someApi from '@/services/someApi';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/services/someApi');

describe('MyComponent', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      state: { isAuthenticated: true, user: { id: '123' } },
    });
  });

  test('renders without crashing', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Some Text')).toBeTruthy();
  });

  test('handles button press', async () => {
    const { getByText } = render(<MyComponent />);
    const button = getByText('Press Me');

    fireEvent.press(button);

    await waitFor(() => {
      expect(someApi.doSomething).toHaveBeenCalled();
    });
  });
});
```

### 2. API Service Test Template

```typescript
import axios from 'axios';
import { getSomeData } from '@/services/someApi';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('someApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await getSomeData();

    expect(result).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/some-endpoint');
  });

  test('handles error correctly', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(getSomeData()).rejects.toThrow('Network error');
  });
});
```

### 3. Hook Test Template

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => useMyHook());

    expect(result.current.value).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  test('updates value when function is called', async () => {
    const { result } = renderHook(() => useMyHook());

    await act(async () => {
      await result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### 4. Context Test Template

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { MyProvider, useMyContext } from '@/contexts/MyContext';
import { Text } from 'react-native';

const TestComponent = () => {
  const { value } = useMyContext();
  return <Text>{value}</Text>;
};

describe('MyContext', () => {
  test('provides default values', () => {
    const { getByText } = render(
      <MyProvider>
        <TestComponent />
      </MyProvider>
    );

    expect(getByText('default value')).toBeTruthy();
  });
});
```

## Common Testing Patterns

### Testing Async Operations

```typescript
test('loads data on mount', async () => {
  const mockData = { items: [] };
  (someApi.fetchData as jest.Mock).mockResolvedValue(mockData);

  const { getByText } = render(<MyComponent />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(getByText('Data loaded')).toBeTruthy();
  });
});
```

### Testing Navigation

```typescript
test('navigates to detail page', () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  const { getByText } = render(<MyComponent />);

  fireEvent.press(getByText('View Details'));

  expect(mockPush).toHaveBeenCalledWith('/details/123');
});
```

### Testing Forms

```typescript
test('submits form with valid data', async () => {
  const mockSubmit = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <MyForm onSubmit={mockSubmit} />
  );

  fireEvent.changeText(getByPlaceholderText('Name'), 'John Doe');
  fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
  fireEvent.press(getByText('Submit'));

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### Testing Error States

```typescript
test('displays error message on API failure', async () => {
  (someApi.fetchData as jest.Mock).mockRejectedValue(
    new Error('Failed to fetch')
  );

  const { getByText } = render(<MyComponent />);

  await waitFor(() => {
    expect(getByText('Failed to fetch')).toBeTruthy();
  });
});
```

### Testing Loading States

```typescript
test('shows loading spinner while fetching', async () => {
  // Mock a delayed response
  (someApi.fetchData as jest.Mock).mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve([]), 100))
  );

  const { getByTestId, queryByTestId } = render(<MyComponent />);

  // Should show loading
  expect(getByTestId('loading-spinner')).toBeTruthy();

  // Wait for loading to finish
  await waitFor(() => {
    expect(queryByTestId('loading-spinner')).toBeNull();
  });
});
```

## Available Matchers

### From @testing-library/jest-native

```typescript
// Presence
expect(element).toBeOnTheScreen();
expect(element).toBeVisible();
expect(element).toBeEmptyElement();

// Text
expect(element).toHaveTextContent('text');
expect(element).toContainElement(childElement);

// Props
expect(element).toHaveProp('propName', 'value');
expect(element).toHaveStyle({ color: 'red' });

// Accessibility
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toBeSelected();
```

### Standard Jest Matchers

```typescript
// Equality
expect(value).toBe(5);
expect(value).toEqual({ a: 1 });
expect(value).toStrictEqual({ a: 1 });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3);

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ a: 1 });

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveReturned();
expect(fn).toThrow();
```

## Mocking Strategies

### Mock Entire Module

```typescript
jest.mock('@/services/someApi', () => ({
  fetchData: jest.fn(),
  postData: jest.fn(),
}));
```

### Mock Specific Functions

```typescript
import * as someApi from '@/services/someApi';
jest.spyOn(someApi, 'fetchData').mockResolvedValue(mockData);
```

### Mock with Implementation

```typescript
jest.mock('@/services/someApi', () => ({
  fetchData: jest.fn((id) => Promise.resolve({ id, name: 'Test' })),
}));
```

### Mock Context

```typescript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => children,
}));
```

## Best Practices

### 1. Use Test IDs for Important Elements
```typescript
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// In test
const { getByTestId } = render(<MyComponent />);
fireEvent.press(getByTestId('submit-button'));
```

### 2. Clean Up After Tests
```typescript
afterEach(() => {
  jest.clearAllMocks();
  // Clear any other global state
});
```

### 3. Group Related Tests
```typescript
describe('MyComponent', () => {
  describe('when user is authenticated', () => {
    // Tests for authenticated state
  });

  describe('when user is not authenticated', () => {
    // Tests for unauthenticated state
  });
});
```

### 4. Test User Behavior, Not Implementation
```typescript
// Good - tests what user sees
test('shows success message after form submission', async () => {
  // ...
  expect(getByText('Form submitted successfully')).toBeTruthy();
});

// Bad - tests implementation details
test('calls setState with correct value', () => {
  // Don't test internal state management
});
```

### 5. Use Descriptive Test Names
```typescript
// Good
test('displays error message when API call fails', () => {});

// Bad
test('error test', () => {});
```

## Debugging Tests

### 1. Use debug() to See Current DOM
```typescript
test('my test', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints component tree
});
```

### 2. Use screen.logTestingPlaygroundURL()
```typescript
import { screen } from '@testing-library/react-native';

test('my test', () => {
  render(<MyComponent />);
  screen.logTestingPlaygroundURL();
});
```

### 3. Increase Timeout for Slow Tests
```typescript
test('slow operation', async () => {
  // ... test code
}, 30000); // 30 second timeout
```

### 4. Run Single Test
```bash
npm test -- -t "test name pattern"
```

## Coverage Reports

After running `npm run test:coverage`, view reports at:
- **Terminal**: Summary shown in console
- **HTML**: `coverage/lcov-report/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI tools)

## Common Issues & Solutions

### Issue: "Cannot find module '@/...'
**Solution**: Check `moduleNameMapper` in `jest.config.js`

### Issue: "Invariant Violation: Native module cannot be null"
**Solution**: Add mock for the native module in `jest.setup.js`

### Issue: Tests fail with "document is not defined"
**Solution**: Use `testEnvironment: 'node'` or mock document object

### Issue: Async tests timing out
**Solution**:
- Ensure you're using `await waitFor()`
- Check if API mocks are resolving
- Increase timeout

## Example Test Structure

```
frontend/
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── Card.test.tsx
│   ├── services/
│   │   ├── authApi.test.ts
│   │   └── cartApi.test.ts
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useCart.test.ts
│   ├── utils/
│   │   ├── validation.test.ts
│   │   └── formatting.test.ts
│   └── pages/
│       ├── referral.test.tsx
│       └── checkout.test.tsx
├── jest.config.js
├── jest.setup.js
└── package.json
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library React Native](https://callstack.github.io/react-native-testing-library/)
- [Jest Expo](https://docs.expo.dev/guides/testing-with-jest/)
- [Sample Test: referral.test.tsx](C:\Users\Mukul raj\Downloads\rez-new\rez-app\frontend\__tests__\referral.test.tsx)

---

**Happy Testing!** 🧪
