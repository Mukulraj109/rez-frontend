// API Services Index
// Central export file for all API services

// Core API client
import apiClient from './apiClient';
export { default as apiClient } from './apiClient';
export type { ApiResponse, RequestOptions } from './apiClient';

// Authentication service
import authService from './authApi';
export { default as authService } from './authApi';
export type {
  User,
  AuthResponse,
  OtpRequest,
  OtpVerification,
  ProfileUpdate
} from './authApi';

// Products service
import productsService from './productsApi';
export { default as productsService } from './productsApi';
export type {
  Product,
  ProductsQuery,
  ProductsResponse,
  SearchQuery,
  SearchResponse
} from './productsApi';

// Cart service
import cartService from './cartApi';
export { default as cartService } from './cartApi';
export type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  ApplyCouponRequest,
  ShippingEstimate
} from './cartApi';

// Orders service
import ordersService from './ordersApi';
export { default as ordersService } from './ordersApi';
export type {
  Order,
  OrderItem,
  CreateOrderRequest,
  OrdersQuery,
  OrdersResponse,
  PaymentIntent,
  RefundRequest
} from './ordersApi';

// Stores service
import storesService from './storesApi';
export { default as storesService } from './storesApi';
export type {
  Store,
  StoresQuery,
  StoresResponse,
  StoreAnalytics,
  StoreFollow
} from './storesApi';

// Videos service
import videosService from './videosApi';
export { default as videosService } from './videosApi';
export type {
  Video,
  VideosQuery,
  VideosResponse,
  VideoUpload,
  VideoComment,
  VideoAnalytics
} from './videosApi';

// Projects service
import projectsService from './projectsApi';
export { default as projectsService } from './projectsApi';
export type {
  Project,
  ProjectTask,
  ProjectMilestone,
  ProjectsQuery,
  ProjectsResponse,
  CreateProjectRequest,
  ProjectAnalytics
} from './projectsApi';

// Notifications service
import notificationsService from './notificationsApi';
export { default as notificationsService } from './notificationsApi';
export type {
  Notification,
  NotificationPreferences,
  NotificationsQuery,
  NotificationsResponse,
  PushSubscription,
  NotificationTemplate
} from './notificationsApi';

// Reviews service
import reviewsService from './reviewsApi';
export { default as reviewsService } from './reviewsApi';
export type {
  Review,
  ReviewsQuery,
  ReviewsResponse,
  CreateReviewRequest,
  ReviewStats
} from './reviewsApi';

// Wishlist service
import wishlistService from './wishlistApi';
export { default as wishlistService } from './wishlistApi';
export type {
  Wishlist,
  WishlistItem,
  WishlistsQuery,
  WishlistsResponse,
  CreateWishlistRequest,
  AddToWishlistRequest,
  WishlistAnalytics
} from './wishlistApi';

// Service registry for easy access
export const services = {
  auth: authService,
  products: productsService,
  cart: cartService,
  orders: ordersService,
  stores: storesService,
  videos: videosService,
  projects: projectsService,
  notifications: notificationsService,
  reviews: reviewsService,
  wishlist: wishlistService,
} as const;

// Initialize all services with authentication token
export const initializeServices = (authToken: string | null) => {
  // Set auth token for all services
  apiClient.setAuthToken(authToken);
  
  // Services automatically use the shared apiClient instance
  // so the token will be available to all of them
};

// Health check for all services
export const checkServicesHealth = async () => {
  try {
    const healthCheck = await apiClient.healthCheck();
    return {
      status: healthCheck.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: healthCheck.data
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};