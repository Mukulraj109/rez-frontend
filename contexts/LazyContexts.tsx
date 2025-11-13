/**
 * Lazy Context Initialization
 *
 * Defer loading of non-critical contexts to reduce initial bundle size
 * and improve app startup time
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lazyLoad } from '@/utils/lazyLoad';

// ============================================================================
// Lazy Context Loader HOC
// ============================================================================

/**
 * Creates a lazy-loading wrapper for context providers
 * Context will only be loaded when first accessed
 */
export function createLazyContext<T>(
  contextName: string,
  loader: () => Promise<{ default: React.ComponentType<any> }>
) {
  const LazyProvider = lazyLoad(loader, {
    componentName: `${contextName}Provider`,
    enablePreload: true,
  });

  const LoadedContext = createContext<boolean>(false);

  const LazyContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      setIsLoaded(true);
      console.log(`[LazyContext] ${contextName} loaded`);
    }, []);

    return (
      <LoadedContext.Provider value={isLoaded}>
        <LazyProvider>{children}</LazyProvider>
      </LoadedContext.Provider>
    );
  };

  const useIsLoaded = () => useContext(LoadedContext);

  return {
    Provider: LazyContextProvider,
    useIsLoaded,
    preload: () => (LazyProvider as any).preload?.(),
  };
}

// ============================================================================
// Lazy Gamification Context
// ============================================================================

export const LazyGamificationContext = createLazyContext(
  'Gamification',
  () => import('@/contexts/GamificationContext').then(mod => ({
    default: mod.GamificationProvider,
  }))
);

// ============================================================================
// Lazy Socket Context
// ============================================================================

export const LazySocketContext = createLazyContext(
  'Socket',
  () => import('@/contexts/SocketContext').then(mod => ({
    default: mod.SocketProvider,
  }))
);

// ============================================================================
// Lazy Subscription Context
// ============================================================================

export const LazySubscriptionContext = createLazyContext(
  'Subscription',
  () => import('@/contexts/SubscriptionContext').then(mod => ({
    default: mod.SubscriptionProvider,
  }))
);

// ============================================================================
// Lazy Notification Context
// ============================================================================

export const LazyNotificationContext = createLazyContext(
  'Notification',
  () => import('@/contexts/NotificationContext').then(mod => ({
    default: mod.NotificationProvider,
  }))
);

// ============================================================================
// Lazy Security Context
// ============================================================================

export const LazySecurityContext = createLazyContext(
  'Security',
  () => import('@/contexts/SecurityContext').then(mod => ({
    default: mod.SecurityProvider,
  }))
);

// ============================================================================
// Lazy Social Context
// ============================================================================

export const LazySocialContext = createLazyContext(
  'Social',
  () => import('@/contexts/SocialContext').then(mod => ({
    default: mod.SocialProvider,
  }))
);

// ============================================================================
// Conditional Context Loader
// ============================================================================

/**
 * Only load context when a condition is met
 * Useful for feature flags or authentication requirements
 */
export function createConditionalContext<T>(
  contextName: string,
  loader: () => Promise<{ default: React.ComponentType<any> }>,
  condition: () => boolean
) {
  const LazyProvider = lazyLoad(loader, {
    componentName: `${contextName}Provider`,
    enablePreload: true,
  });

  const ConditionalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const shouldLoad = condition();

    if (!shouldLoad) {
      console.log(`[LazyContext] ${contextName} skipped (condition not met)`);
      return <>{children}</>;
    }

    return <LazyProvider>{children}</LazyProvider>;
  };

  return {
    Provider: ConditionalProvider,
    preload: () => (LazyProvider as any).preload?.(),
  };
}

// ============================================================================
// Context Preload Manager
// ============================================================================

class ContextPreloadManager {
  private preloadedContexts = new Set<string>();

  /**
   * Preload a context
   */
  async preload(
    contextName: string,
    preloadFn: () => Promise<any>
  ): Promise<void> {
    if (this.preloadedContexts.has(contextName)) {
      console.log(`[ContextPreload] ${contextName} already preloaded`);
      return;
    }

    try {
      console.log(`[ContextPreload] Preloading ${contextName}...`);
      await preloadFn();
      this.preloadedContexts.add(contextName);
      console.log(`[ContextPreload] ${contextName} preloaded`);
    } catch (error) {
      console.error(`[ContextPreload] Failed to preload ${contextName}:`, error);
    }
  }

  /**
   * Preload multiple contexts
   */
  async preloadMultiple(
    contexts: Array<{ name: string; preloadFn: () => Promise<any> }>
  ): Promise<void> {
    console.log(`[ContextPreload] Preloading ${contexts.length} contexts...`);

    const unpreloaded = contexts.filter(
      ctx => !this.preloadedContexts.has(ctx.name)
    );

    try {
      await Promise.all(
        unpreloaded.map(ctx => this.preload(ctx.name, ctx.preloadFn))
      );
      console.log('[ContextPreload] All contexts preloaded');
    } catch (error) {
      console.error('[ContextPreload] Failed to preload contexts:', error);
    }
  }

  /**
   * Check if context is preloaded
   */
  isPreloaded(contextName: string): boolean {
    return this.preloadedContexts.has(contextName);
  }

  /**
   * Reset preload tracking
   */
  reset(): void {
    this.preloadedContexts.clear();
    console.log('[ContextPreload] Manager reset');
  }
}

export const contextPreloadManager = new ContextPreloadManager();

// ============================================================================
// Preload Strategies
// ============================================================================

/**
 * Preload contexts based on user authentication
 */
export async function preloadAuthenticatedContexts(): Promise<void> {
  console.log('[ContextPreload] Preloading authenticated contexts...');

  await contextPreloadManager.preloadMultiple([
    {
      name: 'Socket',
      preloadFn: LazySocketContext.preload,
    },
    {
      name: 'Notification',
      preloadFn: LazyNotificationContext.preload,
    },
    {
      name: 'Security',
      preloadFn: LazySecurityContext.preload,
    },
  ]);
}

/**
 * Preload contexts for gaming features
 */
export async function preloadGamingContexts(): Promise<void> {
  console.log('[ContextPreload] Preloading gaming contexts...');

  await contextPreloadManager.preloadMultiple([
    {
      name: 'Gamification',
      preloadFn: LazyGamificationContext.preload,
    },
  ]);
}

/**
 * Preload contexts for social features
 */
export async function preloadSocialContexts(): Promise<void> {
  console.log('[ContextPreload] Preloading social contexts...');

  await contextPreloadManager.preloadMultiple([
    {
      name: 'Social',
      preloadFn: LazySocialContext.preload,
    },
    {
      name: 'Socket',
      preloadFn: LazySocketContext.preload,
    },
  ]);
}

/**
 * Preload contexts for subscription features
 */
export async function preloadSubscriptionContexts(): Promise<void> {
  console.log('[ContextPreload] Preloading subscription contexts...');

  await contextPreloadManager.preloadMultiple([
    {
      name: 'Subscription',
      preloadFn: LazySubscriptionContext.preload,
    },
  ]);
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to check if a lazy context is loaded
 */
export function useLazyContextLoaded(contextName: string): boolean {
  return contextPreloadManager.isPreloaded(contextName);
}

/**
 * Hook to preload contexts on demand
 */
export function usePreloadContexts() {
  const preloadForAuthentication = async () => {
    await preloadAuthenticatedContexts();
  };

  const preloadForGaming = async () => {
    await preloadGamingContexts();
  };

  const preloadForSocial = async () => {
    await preloadSocialContexts();
  };

  const preloadForSubscription = async () => {
    await preloadSubscriptionContexts();
  };

  return {
    preloadForAuthentication,
    preloadForGaming,
    preloadForSocial,
    preloadForSubscription,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  LazyGamificationContext,
  LazySocketContext,
  LazySubscriptionContext,
  LazyNotificationContext,
  LazySecurityContext,
  LazySocialContext,
  createLazyContext,
  createConditionalContext,
  contextPreloadManager,
  preloadAuthenticatedContexts,
  preloadGamingContexts,
  preloadSocialContexts,
  preloadSubscriptionContexts,
  useLazyContextLoaded,
  usePreloadContexts,
};
