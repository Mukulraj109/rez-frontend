/**
 * Request Deduplication Examples
 * Demonstrates various use cases for the Request Deduplicator
 */

import {
  RequestDeduplicator,
  globalDeduplicator,
  createRequestKey,
  withDeduplication,
  dedupeGet,
  createScopedDeduplicator,
  DeduplicationError
} from './requestDeduplicator';
import apiClient from '@/services/apiClient';

// ============================================
// Example 1: Basic Usage with Global Deduplicator
// ============================================

async function example1_BasicUsage() {
  console.log('\n=== Example 1: Basic Usage ===\n');

  // Multiple components call the same API simultaneously
  const promises = [
    globalDeduplicator.dedupe('user-profile', () =>
      fetch('https://api.example.com/user/123').then(r => r.json())
    ),
    globalDeduplicator.dedupe('user-profile', () =>
      fetch('https://api.example.com/user/123').then(r => r.json())
    ),
    globalDeduplicator.dedupe('user-profile', () =>
      fetch('https://api.example.com/user/123').then(r => r.json())
    )
  ];

  // Only ONE actual fetch call is made!
  // All three promises resolve with the same data
  const results = await Promise.all(promises);

  console.log('All results identical:', results[0] === results[1] && results[1] === results[2]);

  // Check stats
  const stats = globalDeduplicator.getStats();
  console.log('Requests saved:', stats.saved); // Should be 2
}

// ============================================
// Example 2: Using with apiClient (Automatic)
// ============================================

async function example2_ApiClientAutomatic() {
  console.log('\n=== Example 2: API Client (Automatic) ===\n');

  // GET requests are automatically deduplicated
  const promises = [
    apiClient.get('/users/me'),
    apiClient.get('/users/me'),
    apiClient.get('/users/me')
  ];

  // Only 1 actual network request!
  const results = await Promise.all(promises);

  console.log('Results:', results);

  // Print stats
  apiClient.printDeduplicationStats();
}

// ============================================
// Example 3: Disable Deduplication for Specific Request
// ============================================

async function example3_DisableDeduplication() {
  console.log('\n=== Example 3: Disable Deduplication ===\n');

  // Force separate requests (bypass deduplication)
  const promises = [
    apiClient.get('/users/me', undefined, { deduplicate: false }),
    apiClient.get('/users/me', undefined, { deduplicate: false })
  ];

  // 2 actual network requests
  const results = await Promise.all(promises);

  console.log('Made 2 separate requests');
}

// ============================================
// Example 4: POST with Optional Deduplication
// ============================================

async function example4_PostDeduplication() {
  console.log('\n=== Example 4: POST Deduplication ===\n');

  const formData = { email: 'user@example.com' };

  // By default, POST is NOT deduplicated (good for mutations)
  const promises1 = [
    apiClient.post('/newsletter/subscribe', formData),
    apiClient.post('/newsletter/subscribe', formData)
  ];

  // 2 actual POST requests (creates 2 subscriptions - probably not desired)
  await Promise.all(promises1);

  // But you can enable deduplication for idempotent POSTs
  const promises2 = [
    apiClient.post('/newsletter/subscribe', formData, { deduplicate: true }),
    apiClient.post('/newsletter/subscribe', formData, { deduplicate: true })
  ];

  // Only 1 POST request (safer!)
  await Promise.all(promises2);
}

// ============================================
// Example 5: Using withDeduplication HOF
// ============================================

// Wrap any async function
const fetchUserProfile = async (userId: string) => {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  return response.json();
};

// Create deduplicated version
const fetchUserProfileDeduplicated = withDeduplication(
  fetchUserProfile,
  (userId: string) => `user-${userId}` // Key generator
);

async function example5_HigherOrderFunction() {
  console.log('\n=== Example 5: Higher-Order Function ===\n');

  // Multiple simultaneous calls
  const promises = [
    fetchUserProfileDeduplicated('123'),
    fetchUserProfileDeduplicated('123'),
    fetchUserProfileDeduplicated('456'), // Different user - separate request
  ];

  const results = await Promise.all(promises);

  console.log('User 123 results identical:', results[0] === results[1]);
  console.log('User 456 different:', results[2] !== results[0]);
}

// ============================================
// Example 6: Scoped Deduplicator
// ============================================

async function example6_ScopedDeduplicator() {
  console.log('\n=== Example 6: Scoped Deduplicator ===\n');

  // Create a deduplicator just for product API calls
  const productDeduplicator = createScopedDeduplicator('products', {
    timeout: 15000,
    enableLogging: true
  });

  // Use it
  const promises = [
    productDeduplicator.dedupe('product-123', () =>
      fetch('https://api.example.com/products/123').then(r => r.json())
    ),
    productDeduplicator.dedupe('product-123', () =>
      fetch('https://api.example.com/products/123').then(r => r.json())
    )
  ];

  await Promise.all(promises);

  // Get scoped stats
  productDeduplicator.printStats();
}

// ============================================
// Example 7: Request Cancellation
// ============================================

async function example7_Cancellation() {
  console.log('\n=== Example 7: Request Cancellation ===\n');

  // Start a long request
  const key = 'slow-request';
  const promise = globalDeduplicator.dedupe(
    key,
    () => new Promise(resolve => setTimeout(() => resolve('done'), 10000))
  );

  // Cancel it after 1 second
  setTimeout(() => {
    globalDeduplicator.cancel(key);
    console.log('Request cancelled');
  }, 1000);

  try {
    await promise;
  } catch (error) {
    if (error instanceof DeduplicationError) {
      console.log('Caught cancellation:', error.message);
    }
  }
}

// ============================================
// Example 8: Timeout Handling
// ============================================

async function example8_Timeout() {
  console.log('\n=== Example 8: Timeout ===\n');

  try {
    // This request will timeout after 5 seconds
    await globalDeduplicator.dedupe(
      'slow-api',
      () => new Promise(resolve => setTimeout(() => resolve('done'), 10000)),
      { timeout: 5000 }
    );
  } catch (error) {
    if (error instanceof DeduplicationError && error.reason === 'timeout') {
      console.log('Request timed out:', error.message);
    }
  }
}

// ============================================
// Example 9: Real-World React Component
// ============================================

/*
// Component that fetches user data
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Even if multiple UserProfile components mount simultaneously
    // with the same userId, only ONE API call will be made
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/users/${userId}`);
        if (response.success) {
          setUser(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <Text>Loading...</Text>;
  return <Text>{user?.name}</Text>;
}

// Multiple instances
<View>
  <UserProfile userId="123" /> {/* First call - actual request */}
  <UserProfile userId="123" /> {/* Deduplicated - reuses promise */}
  <UserProfile userId="123" /> {/* Deduplicated - reuses promise */}
</View>
*/

// ============================================
// Example 10: Monitoring and Debugging
// ============================================

async function example10_Monitoring() {
  console.log('\n=== Example 10: Monitoring ===\n');

  // Make some requests
  await Promise.all([
    apiClient.get('/users/1'),
    apiClient.get('/users/1'),
    apiClient.get('/users/2'),
    apiClient.get('/users/2'),
    apiClient.get('/users/2')
  ]);

  // Get detailed stats
  const stats = apiClient.getDeduplicationStats();
  console.log('Total requests:', stats.totalRequests); // 5
  console.log('Deduplicated:', stats.deduplicatedRequests); // 3
  console.log('Saved:', stats.saved); // 3
  console.log('Reduction rate:', (stats.saved / stats.totalRequests * 100).toFixed(1) + '%');

  // Print formatted stats
  apiClient.printDeduplicationStats();

  // Check in-flight requests
  console.log('In-flight keys:', globalDeduplicator.getInFlightKeys());
  console.log('Is user/1 in-flight?', globalDeduplicator.isInFlight('user/1'));
}

// ============================================
// Example 11: Homepage Section Fetching
// ============================================

async function example11_HomepageSections() {
  console.log('\n=== Example 11: Homepage Sections ===\n');

  // Simulate 3 components trying to fetch the same section
  const sectionId = 'featured-products';
  const promises = [
    // Component 1
    fetch(`https://api.example.com/sections/${sectionId}`).then(r => r.json()),
    // Component 2 (duplicate)
    fetch(`https://api.example.com/sections/${sectionId}`).then(r => r.json()),
    // Component 3 (duplicate)
    fetch(`https://api.example.com/sections/${sectionId}`).then(r => r.json())
  ];

  // Without deduplication: 3 network requests
  // With deduplication: 1 network request, shared promise

  const deduplicatedPromises = promises.map((_, index) =>
    globalDeduplicator.dedupe(
      `section-${sectionId}`,
      () => fetch(`https://api.example.com/sections/${sectionId}`).then(r => r.json())
    )
  );

  await Promise.all(deduplicatedPromises);
  console.log('Only 1 request made for all 3 components!');
}

// ============================================
// Example 12: Preventing Race Conditions
// ============================================

async function example12_RaceConditions() {
  console.log('\n=== Example 12: Race Conditions ===\n');

  // Without deduplication, these rapid-fire requests could arrive out of order
  // causing stale data to overwrite fresh data

  const userId = '123';

  // User clicks refresh button 3 times rapidly
  const requests = [
    apiClient.get(`/users/${userId}`),
    apiClient.get(`/users/${userId}`),
    apiClient.get(`/users/${userId}`)
  ];

  // With deduplication: only 1 request, guaranteed consistent result
  const results = await Promise.all(requests);

  console.log('All results identical (no race condition):',
    results[0] === results[1] && results[1] === results[2]
  );
}

// ============================================
// Run All Examples
// ============================================

export async function runAllExamples() {
  await example1_BasicUsage();
  await example2_ApiClientAutomatic();
  await example3_DisableDeduplication();
  await example4_PostDeduplication();
  await example5_HigherOrderFunction();
  await example6_ScopedDeduplicator();
  await example7_Cancellation();
  await example8_Timeout();
  await example10_Monitoring();
  await example11_HomepageSections();
  await example12_RaceConditions();
}

// Export individual examples for testing
export {
  example1_BasicUsage,
  example2_ApiClientAutomatic,
  example3_DisableDeduplication,
  example4_PostDeduplication,
  example5_HigherOrderFunction,
  example6_ScopedDeduplicator,
  example7_Cancellation,
  example8_Timeout,
  example10_Monitoring,
  example11_HomepageSections,
  example12_RaceConditions
};
