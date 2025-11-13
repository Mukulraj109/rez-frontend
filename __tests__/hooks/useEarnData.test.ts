/**
 * Unit Tests for useEarnData hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useEarnData } from '@/hooks/useEarnData';

jest.mock('@/services/projectsApi', () => ({
  fetchProjects: jest.fn(() => Promise.resolve([])),
}));

describe('useEarnData', () => {
  it('should load earn opportunities', async () => {
    const { result } = renderHook(() => useEarnData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
