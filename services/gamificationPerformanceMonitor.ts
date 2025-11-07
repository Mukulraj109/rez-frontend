// Gamification Performance Monitor
// Tracks and reports performance metrics for gamification features

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  operations: PerformanceMetric[];
}

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

/**
 * Gamification Performance Monitor Service
 */
class GamificationPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
  };

  /**
   * Start tracking a performance metric
   */
  startTimer(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.activeTimers.set(name, startTime);

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    console.log(`⏱️ [PERF] Started timer: ${name}`);
  }

  /**
   * End tracking and record metric
   */
  endTimer(name: string, metadata?: Record<string, any>): number | null {
    const startTime = this.activeTimers.get(name);

    if (!startTime) {
      console.warn(`⚠️ [PERF] No active timer found for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      name,
      startTime,
      endTime,
      duration,
      metadata,
    };

    const metrics = this.metrics.get(name) || [];
    metrics.push(metric);
    this.metrics.set(name, metrics);

    this.activeTimers.delete(name);

    console.log(`✅ [PERF] Completed: ${name} in ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Record a one-off metric without start/end
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name) || [];
    metrics.push(metric);
    this.metrics.set(name, metrics);
  }

  /**
   * Get stats for a specific metric
   */
  getMetricStats(name: string): PerformanceStats | null {
    const operations = this.metrics.get(name);

    if (!operations || operations.length === 0) {
      return null;
    }

    const durations = operations
      .filter(op => op.duration !== undefined)
      .map(op => op.duration!);

    if (durations.length === 0) {
      return null;
    }

    const total = durations.reduce((sum, d) => sum + d, 0);
    const average = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      totalOperations: operations.length,
      averageDuration: average,
      minDuration: min,
      maxDuration: max,
      operations,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceStats> {
    const statsMap = new Map<string, PerformanceStats>();

    for (const [name] of this.metrics) {
      const stats = this.getMetricStats(name);
      if (stats) {
        statsMap.set(name, stats);
      }
    }

    return statsMap;
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheMetrics.hits++;
    this.cacheMetrics.totalRequests++;
    this.updateHitRate();
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMetrics.misses++;
    this.cacheMetrics.totalRequests++;
    this.updateHitRate();
  }

  /**
   * Update cache hit rate
   */
  private updateHitRate(): void {
    if (this.cacheMetrics.totalRequests > 0) {
      this.cacheMetrics.hitRate =
        (this.cacheMetrics.hits / this.cacheMetrics.totalRequests) * 100;
    }
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics };
  }

  /**
   * Reset cache metrics
   */
  resetCacheMetrics(): void {
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    metrics: Record<string, PerformanceStats>;
    cache: CacheMetrics;
    summary: {
      totalMetrics: number;
      totalOperations: number;
      averageOperationTime: number;
    };
  } {
    const allMetrics = this.getAllMetrics();
    const metricsObj: Record<string, PerformanceStats> = {};
    let totalOperations = 0;
    let totalDuration = 0;

    allMetrics.forEach((stats, name) => {
      metricsObj[name] = stats;
      totalOperations += stats.totalOperations;
      totalDuration += stats.averageDuration * stats.totalOperations;
    });

    const averageOperationTime =
      totalOperations > 0 ? totalDuration / totalOperations : 0;

    return {
      metrics: metricsObj,
      cache: this.getCacheMetrics(),
      summary: {
        totalMetrics: allMetrics.size,
        totalOperations,
        averageOperationTime,
      },
    };
  }

  /**
   * Print performance report to console
   */
  printReport(): void {
    const report = this.generateReport();

    console.log('\n📊 [PERF] Performance Report');
    console.log('═'.repeat(60));

    console.log('\n📈 Summary:');
    console.log(`  Total Metrics: ${report.summary.totalMetrics}`);
    console.log(`  Total Operations: ${report.summary.totalOperations}`);
    console.log(`  Avg Operation Time: ${report.summary.averageOperationTime.toFixed(2)}ms`);

    console.log('\n💾 Cache Performance:');
    console.log(`  Total Requests: ${report.cache.totalRequests}`);
    console.log(`  Cache Hits: ${report.cache.hits}`);
    console.log(`  Cache Misses: ${report.cache.misses}`);
    console.log(`  Hit Rate: ${report.cache.hitRate.toFixed(2)}%`);

    console.log('\n⏱️ Operation Metrics:');
    Object.entries(report.metrics).forEach(([name, stats]) => {
      console.log(`\n  ${name}:`);
      console.log(`    Operations: ${stats.totalOperations}`);
      console.log(`    Avg Duration: ${stats.averageDuration.toFixed(2)}ms`);
      console.log(`    Min Duration: ${stats.minDuration.toFixed(2)}ms`);
      console.log(`    Max Duration: ${stats.maxDuration.toFixed(2)}ms`);
    });

    console.log('\n' + '═'.repeat(60));
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.activeTimers.clear();
    this.resetCacheMetrics();
    console.log('🧹 [PERF] All metrics cleared');
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata);

    try {
      const result = await apiCall();
      this.endTimer(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Track component render performance
   */
  trackRender(componentName: string, renderTime: number): void {
    this.recordMetric(`render_${componentName}`, renderTime, {
      type: 'render',
      component: componentName,
    });
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const allMetrics = this.getAllMetrics();
    const cache = this.getCacheMetrics();

    // Check cache hit rate
    if (cache.totalRequests > 10 && cache.hitRate < 50) {
      recommendations.push(
        '⚠️ Low cache hit rate. Consider increasing cache TTL or improving cache strategy.'
      );
    }

    // Check slow operations
    allMetrics.forEach((stats, name) => {
      if (stats.averageDuration > 1000) {
        recommendations.push(
          `⚠️ ${name} is slow (avg: ${stats.averageDuration.toFixed(2)}ms). Consider optimization.`
        );
      }

      if (stats.maxDuration > 3000) {
        recommendations.push(
          `⚠️ ${name} has slow outliers (max: ${stats.maxDuration.toFixed(2)}ms). Investigate performance issues.`
        );
      }
    });

    // Check for memory leaks (too many metrics)
    if (allMetrics.size > 50) {
      recommendations.push(
        '⚠️ Large number of tracked metrics. Consider clearing old metrics to prevent memory leaks.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good!');
    }

    return recommendations;
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }
}

// Export singleton instance
const performanceMonitor = new GamificationPerformanceMonitor();
export default performanceMonitor;

// Named exports for convenience
export {
  performanceMonitor,
  GamificationPerformanceMonitor,
};

// Example usage:
/*
// Track API call
const leaderboard = await performanceMonitor.trackApiCall(
  'fetch_leaderboard',
  () => gamificationAPI.getLeaderboard('monthly')
);

// Track manual timer
performanceMonitor.startTimer('process_achievements');
// ... do work ...
performanceMonitor.endTimer('process_achievements');

// Record cache hit/miss
performanceMonitor.recordCacheHit();

// Get report
performanceMonitor.printReport();

// Get recommendations
const recommendations = performanceMonitor.getRecommendations();
console.log(recommendations);
*/
