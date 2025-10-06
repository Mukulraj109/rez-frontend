import asyncStorageService from './asyncStorageService';
import cartService from './cartApi';

export interface QueuedOperation {
  id: string;
  type: 'add' | 'update' | 'remove' | 'clear' | 'apply_coupon' | 'remove_coupon';
  timestamp: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

/**
 * Offline Queue Service
 * Manages queued operations when the app is offline
 */
class OfflineQueueService {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private syncCallbacks: Array<(success: boolean) => void> = [];

  constructor() {
    this.loadQueue();
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const savedQueue = await asyncStorageService.getOfflineQueue();
      this.queue = savedQueue || [];
      console.log('🔄 [OFFLINE QUEUE] Loaded queue:', this.queue.length, 'items');
    } catch (error) {
      console.error('🔄 [OFFLINE QUEUE] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await asyncStorageService.saveOfflineQueue(this.queue);
      console.log('🔄 [OFFLINE QUEUE] Saved queue:', this.queue.length, 'items');
    } catch (error) {
      console.error('🔄 [OFFLINE QUEUE] Failed to save queue:', error);
    }
  }

  /**
   * Add operation to queue
   */
  async addToQueue(
    type: QueuedOperation['type'],
    data: any,
    maxRetries: number = 3
  ): Promise<string> {
    const operation: QueuedOperation = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      retryCount: 0,
      maxRetries,
      status: 'pending'
    };

    this.queue.push(operation);
    await this.saveQueue();

    console.log('🔄 [OFFLINE QUEUE] Added operation to queue:', operation.id, operation.type);

    return operation.id;
  }

  /**
   * Remove operation from queue
   */
  async removeFromQueue(operationId: string): Promise<void> {
    this.queue = this.queue.filter(op => op.id !== operationId);
    await this.saveQueue();
    console.log('🔄 [OFFLINE QUEUE] Removed operation from queue:', operationId);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(op => op.status === 'pending').length,
      processing: this.queue.filter(op => op.status === 'processing').length,
      failed: this.queue.filter(op => op.status === 'failed').length,
      completed: this.queue.filter(op => op.status === 'completed').length
    };
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Clear all completed operations
   */
  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter(op => op.status !== 'completed');
    await this.saveQueue();
    console.log('🔄 [OFFLINE QUEUE] Cleared completed operations');
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await asyncStorageService.clearOfflineQueue();
    console.log('🔄 [OFFLINE QUEUE] Cleared entire queue');
  }

  /**
   * Process a single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<boolean> {
    console.log('🔄 [OFFLINE QUEUE] Processing operation:', operation.id, operation.type);

    operation.status = 'processing';
    await this.saveQueue();

    try {
      let success = false;

      switch (operation.type) {
        case 'add':
          const addResponse = await cartService.addToCart(operation.data);
          success = addResponse.success;
          break;

        case 'update':
          const updateResponse = await cartService.updateCartItem(
            operation.data.productId,
            { quantity: operation.data.quantity },
            operation.data.variant
          );
          success = updateResponse.success;
          break;

        case 'remove':
          const removeResponse = await cartService.removeCartItem(
            operation.data.productId,
            operation.data.variant
          );
          success = removeResponse.success;
          break;

        case 'clear':
          const clearResponse = await cartService.clearCart();
          success = clearResponse.success;
          break;

        case 'apply_coupon':
          const applyCouponResponse = await cartService.applyCoupon(operation.data);
          success = applyCouponResponse.success;
          break;

        case 'remove_coupon':
          const removeCouponResponse = await cartService.removeCoupon();
          success = removeCouponResponse.success;
          break;

        default:
          console.error('🔄 [OFFLINE QUEUE] Unknown operation type:', operation.type);
          success = false;
      }

      if (success) {
        operation.status = 'completed';
        console.log('🔄 [OFFLINE QUEUE] Operation completed successfully:', operation.id);
      } else {
        throw new Error('Operation failed');
      }

      return true;
    } catch (error) {
      console.error('🔄 [OFFLINE QUEUE] Operation failed:', operation.id, error);

      operation.retryCount++;
      operation.error = error instanceof Error ? error.message : 'Unknown error';

      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
        console.error('🔄 [OFFLINE QUEUE] Operation exceeded max retries:', operation.id);
      } else {
        operation.status = 'pending';
        console.log('🔄 [OFFLINE QUEUE] Operation will be retried:', operation.id, 'Retry count:', operation.retryCount);
      }

      return false;
    } finally {
      await this.saveQueue();
    }
  }

  /**
   * Process all pending operations
   */
  async processQueue(): Promise<{ success: boolean; processed: number; failed: number }> {
    if (this.isProcessing) {
      console.log('🔄 [OFFLINE QUEUE] Already processing queue');
      return { success: false, processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    console.log('🔄 [OFFLINE QUEUE] Starting queue processing');

    const pendingOperations = this.queue.filter(
      op => op.status === 'pending' || op.status === 'processing'
    );

    let processed = 0;
    let failed = 0;

    for (const operation of pendingOperations) {
      const success = await this.processOperation(operation);
      if (success) {
        processed++;
      } else {
        failed++;
      }

      // Small delay between operations to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Remove completed operations
    await this.clearCompleted();

    this.isProcessing = false;

    const result = {
      success: failed === 0,
      processed,
      failed
    };

    console.log('🔄 [OFFLINE QUEUE] Queue processing completed:', result);

    // Notify callbacks
    this.syncCallbacks.forEach(callback => callback(result.success));
    this.syncCallbacks = [];

    return result;
  }

  /**
   * Subscribe to sync events
   */
  onSync(callback: (success: boolean) => void): () => void {
    this.syncCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if queue has pending operations
   */
  hasPendingOperations(): boolean {
    return this.queue.some(op => op.status === 'pending' || op.status === 'processing');
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    return this.queue.filter(op => op.status === 'pending').length;
  }

  /**
   * Retry failed operations
   */
  async retryFailedOperations(): Promise<void> {
    const failedOperations = this.queue.filter(op => op.status === 'failed');

    for (const operation of failedOperations) {
      operation.status = 'pending';
      operation.retryCount = 0;
      operation.error = undefined;
    }

    await this.saveQueue();

    console.log('🔄 [OFFLINE QUEUE] Reset', failedOperations.length, 'failed operations for retry');

    // Process the queue
    await this.processQueue();
  }

  /**
   * Handle conflict resolution
   * When both offline and online data exist
   */
  async resolveConflict(
    localData: any,
    serverData: any,
    strategy: 'local' | 'server' | 'merge' = 'server'
  ): Promise<any> {
    console.log('🔄 [OFFLINE QUEUE] Resolving conflict with strategy:', strategy);

    switch (strategy) {
      case 'local':
        // Use local data
        return localData;

      case 'server':
        // Use server data (default)
        return serverData;

      case 'merge':
        // Merge local and server data
        // This is a simple merge strategy, you might need a more sophisticated one
        if (Array.isArray(localData) && Array.isArray(serverData)) {
          // For arrays (like cart items), prefer server data but keep local additions
          const serverIds = new Set(serverData.map((item: any) => item.id));
          const localOnlyItems = localData.filter((item: any) => !serverIds.has(item.id));
          return [...serverData, ...localOnlyItems];
        } else if (typeof localData === 'object' && typeof serverData === 'object') {
          // For objects, merge properties
          return { ...serverData, ...localData };
        } else {
          // For primitives, prefer server data
          return serverData;
        }

      default:
        return serverData;
    }
  }
}

export default new OfflineQueueService();
