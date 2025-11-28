/**
 * Monitoring & Analytics Integration Example
 * Complete example showing how to integrate all monitoring services
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';

// Import monitoring services
import { webVitalsService } from '@/services/webVitalsService';
import { performanceMetricsService } from '@/services/performanceMetricsService';
import { errorTrackingService } from '@/services/errorTrackingService';
import { optimizedAnalyticsService } from '@/services/analyticsService.optimized';
import { backendMonitoringService } from '@/services/backendMonitoringService';

// Import hooks
import usePerformanceMetrics from '@/hooks/usePerformanceMetrics';
import usePerformanceDashboard from '@/hooks/usePerformanceDashboard';

// Import dev tools
import PerformanceDevTools from '@/components/dev/PerformanceDevTools';

// ============================================================================
// Example 1: App-Level Integration (Root Layout)
// ============================================================================

export function RootLayoutExample() {
  useEffect(() => {
    // 1. Initialize Web Vitals (web only)
    if (Platform.OS === 'web') {
      webVitalsService.init((metric) => {
        // Send Web Vitals to analytics
        optimizedAnalyticsService.track('web_vital', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
        }, 'normal');

        console.log(`[WebVitals] ${metric.name}: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'}`);
      });
    }

    // 2. Configure analytics
    optimizedAnalyticsService.updateConfig({
      flushInterval: 5000,
      maxQueueSize: 50,
      maxBatchSize: 20,
      debounceTime: 300,
      enableOfflineQueue: true,
      enableBatching: true,
    });

    // 3. Setup error tracking
    errorTrackingService.setEnabled(true);

    // Add error listener
    const unsubscribe = errorTrackingService.addErrorListener((error) => {
      // Send critical errors to analytics immediately
      if (error.severity === 'critical') {
        optimizedAnalyticsService.track('critical_error', {
          message: error.message,
          type: error.type,
          route: error.context.route,
        }, 'high');
      }

      // Log to console in dev
      if (__DEV__) {
        console.error('[ErrorTracking]', error);
      }
    });

    // 4. Enable backend monitoring
    if (__DEV__) {
      backendMonitoringService.setEnabled(true);
    }

    // 5. Track app session start
    optimizedAnalyticsService.track('app_session_start', {
      platform: Platform.OS,
      version: '1.0.0',
    }, 'high');

    // Cleanup
    return () => {
      unsubscribe();
      optimizedAnalyticsService.track('app_session_end', {
        duration: Date.now(),
      }, 'high');
      optimizedAnalyticsService.cleanup();
    };
  }, []);

  return (
    <>
      {/* Your app content */}
      <YourAppContent />

      {/* Dev tools (only in dev mode) */}
      <PerformanceDevTools />
    </>
  );
}

// ============================================================================
// Example 2: Screen/Page Level Integration
// ============================================================================

export function HomepageExample() {
  // Track screen performance
  useEffect(() => {
    const screenStartTime = performance.now();

    // Track page view
    optimizedAnalyticsService.trackPageView('Homepage', {
      referrer: 'direct',
    });

    // Track screen load start
    performanceMetricsService.trackMetric('screen_load_start', Date.now(), 'ms');

    return () => {
      const screenLoadTime = performance.now() - screenStartTime;

      // Track page load metrics
      performanceMetricsService.trackPageLoad({
        pageName: 'Homepage',
        totalTime: screenLoadTime,
        apiTime: 0, // Will be tracked separately
        renderTime: screenLoadTime,
        sectionsLoaded: 8,
      });

      console.log(`[Performance] Homepage loaded in ${screenLoadTime.toFixed(0)}ms`);
    };
  }, []);

  return (
    <View>
      <Text>Homepage</Text>
    </View>
  );
}

// ============================================================================
// Example 3: Component Level Integration
// ============================================================================

export function ProductCardExample({ product }: { product: any }) {
  // Track component performance
  const { trackInteraction, getRenderCount } = usePerformanceMetrics({
    componentName: 'ProductCard',
    trackRenders: true,
    trackMount: true,
    logSlowRenders: true,
    slowRenderThreshold: 16, // 60fps
  });

  const handleClick = () => {
    const endTracking = trackInteraction('product_click', {
      productId: product.id,
    });

    // Track analytics event
    optimizedAnalyticsService.track('product_click', {
      productId: product.id,
      productName: product.name,
      price: product.price,
    });

    // Navigate
    router.push(`/product/${product.id}`);

    endTracking();
  };

  return (
    <TouchableOpacity onPress={handleClick}>
      <Text>{product.name}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Example 4: API Call Integration
// ============================================================================

export async function fetchProductsExample() {
  const endpoint = '/api/products';
  const method = 'GET';
  const startTime = performance.now();

  try {
    // Make API call
    const response = await fetch(endpoint, { method });
    const duration = performance.now() - startTime;

    // Track API performance
    performanceMetricsService.trackAPILatency(
      endpoint,
      duration,
      method,
      response.status,
      response.ok
    );

    // Track backend monitoring
    backendMonitoringService.trackAPIResponse(
      endpoint,
      duration,
      response.status,
      method
    );

    // Track errors if failed
    if (!response.ok) {
      const responseData = await response.json();
      errorTrackingService.trackAPIError(endpoint, {
        status: response.status,
        data: responseData,
      });
    }

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`[Performance] Slow API: ${method} ${endpoint} took ${duration.toFixed(0)}ms`);
    }

    return await response.json();
  } catch (error) {
    const duration = performance.now() - startTime;

    // Track network error
    performanceMetricsService.trackAPILatency(
      endpoint,
      duration,
      method,
      0,
      false
    );

    errorTrackingService.trackNetworkError(
      endpoint,
      0,
      error as Error,
      { method }
    );

    throw error;
  }
}

// ============================================================================
// Example 5: Error Boundary Integration
// ============================================================================

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundaryExample extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error
    errorTrackingService.trackComponentError(
      this.props.componentName || 'Unknown',
      error,
      errorInfo
    );

    // Log to console in dev
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Usage
export function ErrorBoundaryUsageExample() {
  return (
    <ErrorBoundaryExample componentName="ProductList">
      <ProductListComponent />
    </ErrorBoundaryExample>
  );
}

// ============================================================================
// Example 6: User Action Tracking
// ============================================================================

export function UserActionsExample() {
  const handleAddToCart = (product: any) => {
    // Track user action (debounced)
    optimizedAnalyticsService.trackUserAction('add_to_cart', {
      productId: product.id,
      quantity: 1,
    });

    // Track high-priority conversion event
    optimizedAnalyticsService.trackConversion('add_to_cart', product.price, {
      productId: product.id,
      productName: product.name,
    });
  };

  const handlePurchase = (order: any) => {
    // Track high-priority purchase event
    optimizedAnalyticsService.trackConversion('purchase', order.total, {
      orderId: order.id,
      items: order.items.length,
    });
  };

  const handleScroll = (scrollDepth: number) => {
    // Track low-priority interaction (debounced)
    optimizedAnalyticsService.trackInteraction('scroll', {
      depth: scrollDepth,
    });
  };

  return (
    <View>
      {/* Your UI */}
    </View>
  );
}

// ============================================================================
// Example 7: Performance Dashboard Integration
// ============================================================================

export function PerformanceDashboardExample() {
  const dashboard = usePerformanceDashboard({
    updateInterval: 5000,
    autoRefresh: true,
  });

  if (!dashboard) {
    return <Text>Loading performance data...</Text>;
  }

  return (
    <View>
      <Text>Performance Score: {dashboard.score}/100</Text>
      <Text>Web Vitals Rating: {dashboard.webVitals.rating}</Text>
      <Text>API Latency: {dashboard.customMetrics.avgAPILatency.toFixed(0)}ms</Text>
      <Text>Errors: {dashboard.errors.total}</Text>
      <Text>Cache Hit Rate: {dashboard.customMetrics.cacheHitRate.toFixed(1)}%</Text>

      {dashboard.recommendations.length > 0 && (
        <View>
          <Text>Recommendations:</Text>
          {dashboard.recommendations.map((rec, index) => (
            <Text key={index}>• {rec}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Example 8: Cache Performance Tracking
// ============================================================================

export function CacheExample() {
  const getCachedData = async (key: string) => {
    try {
      // Try cache first
      const cached = await getCacheItem(key);

      if (cached) {
        // Track cache hit
        performanceMetricsService.trackCacheOperation('hit', key);
        backendMonitoringService.trackCacheOperation('hit', key);
        return cached;
      }

      // Track cache miss
      performanceMetricsService.trackCacheOperation('miss', key);
      backendMonitoringService.trackCacheOperation('miss', key);

      // Fetch from API
      const data = await fetchData(key);

      // Store in cache
      await setCacheItem(key, data);
      backendMonitoringService.trackCacheOperation('set', key);

      return data;
    } catch (error) {
      errorTrackingService.trackError(
        error as Error,
        'component',
        'medium',
        { operation: 'cache_get', key }
      );
      throw error;
    }
  };

  return null;
}

// Dummy functions for example
async function getCacheItem(key: string): Promise<any> { return null; }
async function setCacheItem(key: string, data: any): Promise<void> {}
async function fetchData(key: string): Promise<any> { return {}; }
function YourAppContent() { return null; }
function ProductListComponent() { return null; }

// ============================================================================
// Example 9: Custom Performance Metrics
// ============================================================================

export function CustomMetricsExample() {
  useEffect(() => {
    // Track custom metric
    const startTime = performance.now();

    // Do some work
    performHeavyOperation();

    const duration = performance.now() - startTime;

    // Track custom metric
    performanceMetricsService.trackMetric(
      'heavy_operation',
      duration,
      'ms',
      { operation: 'data_processing' }
    );

    // Track if slow
    if (duration > 100) {
      console.warn(`[Performance] Heavy operation took ${duration.toFixed(0)}ms`);
    }
  }, []);

  return null;
}

function performHeavyOperation() {
  // Heavy operation
}

// ============================================================================
// Example 10: Backend Health Monitoring
// ============================================================================

export function BackendHealthExample() {
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await backendMonitoringService.getBackendHealth();

        console.log('[Backend] Health:', health.status);

        if (health.status === 'degraded') {
          // Show warning to user
          console.warn('[Backend] Performance degraded:', {
            apiLatency: health.apiLatency,
            dbLatency: health.dbLatency,
            errorRate: health.errorRate,
          });
        } else if (health.status === 'down') {
          // Show error to user
          console.error('[Backend] System down');

          errorTrackingService.trackError(
            new Error('Backend system down'),
            'network',
            'critical',
            { health }
          );
        }
      } catch (error) {
        console.error('[Backend] Health check failed:', error);
      }
    };

    // Check health on mount
    checkHealth();

    // Check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

// ============================================================================
// Export all examples
// ============================================================================

export default {
  RootLayoutExample,
  HomepageExample,
  ProductCardExample,
  fetchProductsExample,
  ErrorBoundaryExample,
  UserActionsExample,
  PerformanceDashboardExample,
  CacheExample,
  CustomMetricsExample,
  BackendHealthExample,
};
