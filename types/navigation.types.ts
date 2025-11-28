// Navigation Types
// Comprehensive type definitions for the navigation system

import { Href } from 'expo-router';

/**
 * Platform types supported by the app
 */
export type Platform = 'web' | 'ios' | 'android';

/**
 * Navigation method types
 */
export type NavigationMethod = 'push' | 'replace' | 'back' | 'dismiss';

/**
 * Navigation result status
 */
export type NavigationStatus = 'success' | 'failed' | 'fallback';

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  route: string;
  timestamp: number;
  method: NavigationMethod;
  params?: Record<string, any>;
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  fallbackRoute?: Href;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  animate?: boolean;
  replace?: boolean;
  params?: Record<string, any>;
}

/**
 * Safe navigation result
 */
export interface NavigationResult {
  status: NavigationStatus;
  route?: string;
  error?: Error;
  fallbackUsed?: boolean;
}

/**
 * Navigation guard function type
 */
export type NavigationGuard = (
  to: string,
  from?: string
) => boolean | Promise<boolean>;

/**
 * Navigation middleware function type
 */
export type NavigationMiddleware = (
  to: string,
  next: () => void,
  from?: string
) => void | Promise<void>;

/**
 * Navigation event types
 */
export enum NavigationEvent {
  BEFORE_NAVIGATE = 'beforeNavigate',
  AFTER_NAVIGATE = 'afterNavigate',
  NAVIGATION_ERROR = 'navigationError',
  NAVIGATION_BLOCKED = 'navigationBlocked',
}

/**
 * Navigation event listener
 */
export interface NavigationEventListener {
  event: NavigationEvent;
  handler: (data: any) => void;
}

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  requiresAuth?: boolean;
  fallback?: Href;
  guards?: NavigationGuard[];
  metadata?: Record<string, any>;
}

/**
 * Navigation state
 */
export interface NavigationState {
  currentRoute: string;
  history: NavigationHistoryEntry[];
  canGoBack: boolean;
  isNavigating: boolean;
  platform: Platform;
}

/**
 * Back button configuration
 */
export interface BackButtonConfig {
  fallbackRoute?: Href;
  onPress?: () => void;
  showConfirmation?: boolean;
  confirmationMessage?: string;
  style?: any;
  iconColor?: string;
  iconSize?: number;
}

/**
 * Deep link configuration
 */
export interface DeepLinkConfig {
  scheme: string;
  host?: string;
  path: string;
  params?: Record<string, any>;
}

/**
 * Navigation analytics event
 */
export interface NavigationAnalyticsEvent {
  route: string;
  method: NavigationMethod;
  timestamp: number;
  duration?: number;
  success: boolean;
  error?: string;
  platform: Platform;
}

/**
 * Navigation queue item
 */
export interface NavigationQueueItem {
  id: string;
  route: Href;
  options: NavigationOptions;
  priority: number;
  timestamp: number;
  attempts: number;
}

/**
 * Navigation error types
 */
export enum NavigationErrorType {
  INVALID_ROUTE = 'INVALID_ROUTE',
  NAVIGATION_BLOCKED = 'NAVIGATION_BLOCKED',
  NO_HISTORY = 'NO_HISTORY',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Navigation error
 */
export class NavigationError extends Error {
  type: NavigationErrorType;
  route?: string;
  originalError?: Error;

  constructor(
    type: NavigationErrorType,
    message: string,
    route?: string,
    originalError?: Error
  ) {
    super(message);
    this.type = type;
    this.route = route;
    this.originalError = originalError;
    this.name = 'NavigationError';
  }
}

/**
 * Navigation service interface
 */
export interface INavigationService {
  navigate(route: Href, options?: NavigationOptions): Promise<NavigationResult>;
  goBack(fallbackRoute?: Href): Promise<NavigationResult>;
  replace(route: Href, options?: NavigationOptions): Promise<NavigationResult>;
  canGoBack(): boolean;
  getCurrentRoute(): string;
  getHistory(): NavigationHistoryEntry[];
  clearHistory(): void;
  addGuard(guard: NavigationGuard): void;
  removeGuard(guard: NavigationGuard): void;
  addEventListener(
    event: NavigationEvent,
    handler: (data: any) => void
  ): void;
  removeEventListener(
    event: NavigationEvent,
    handler: (data: any) => void
  ): void;
}

/**
 * Stack configuration
 */
export interface StackConfig {
  maxSize?: number;
  persistToStorage?: boolean;
  storageKey?: string;
}

/**
 * Tab navigation configuration
 */
export interface TabConfig {
  resetOnTabChange?: boolean;
  preserveState?: boolean;
}

/**
 * Modal navigation configuration
 */
export interface ModalConfig {
  dismissOnBackdropPress?: boolean;
  fullScreen?: boolean;
  presentationStyle?: 'modal' | 'fullScreen' | 'formSheet';
}
