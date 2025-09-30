// hooks/useCartValidation.ts
// Custom hook for cart validation state management

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useCart } from '@/contexts/CartContext';
import cartValidationService from '@/services/cartValidationService';
import {
  ValidationState,
  ValidationResult,
  CartValidationHookResult,
  ValidationIssue,
  DEFAULT_VALIDATION_CONFIG,
  RealTimeValidationConfig,
} from '@/types/validation.types';

interface UseCartValidationOptions {
  autoValidate?: boolean;
  validationInterval?: number;
  showToastNotifications?: boolean;
}

/**
 * Custom hook for managing cart validation state
 *
 * Features:
 * - Validates cart items for stock availability
 * - Detects price changes
 * - Provides validation state and methods
 * - Auto-validates on cart changes (optional)
 * - Real-time validation via intervals (optional)
 *
 * @param options - Configuration options
 * @returns Cart validation state and methods
 */
export function useCartValidation(
  options: UseCartValidationOptions = {}
): CartValidationHookResult {
  const {
    autoValidate = true,
    validationInterval = DEFAULT_VALIDATION_CONFIG.validationInterval,
    showToastNotifications = DEFAULT_VALIDATION_CONFIG.showToastNotifications,
  } = options;

  const { state: cartState, actions: cartActions } = useCart();

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    validationResult: null,
    error: null,
    lastValidated: null,
  });

  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isValidatingRef = useRef(false);

  /**
   * Validate cart items against backend
   */
  const validateCart = useCallback(async (): Promise<ValidationResult | null> => {
    if (isValidatingRef.current) {
      console.log('⚠️ [VALIDATION HOOK] Validation already in progress, skipping...');
      return validationState.validationResult;
    }

    if (cartState.items.length === 0) {
      console.log('ℹ️ [VALIDATION HOOK] Cart is empty, skipping validation');
      return null;
    }

    try {
      isValidatingRef.current = true;
      setValidationState(prev => ({
        ...prev,
        isValidating: true,
        error: null,
      }));

      console.log('✅ [VALIDATION HOOK] Validating cart with', cartState.items.length, 'items');

      const response = await cartValidationService.validateCart();

      if (response.success && response.data) {
        const result = cartValidationService.transformValidationResponse(response.data);

        console.log('✅ [VALIDATION HOOK] Validation completed:', {
          valid: result.valid,
          canCheckout: result.canCheckout,
          issueCount: result.issues.length,
          invalidItemCount: result.invalidItems.length,
        });

        setValidationState({
          isValidating: false,
          validationResult: result,
          error: null,
          lastValidated: new Date().toISOString(),
        });

        // Show toast notifications for issues
        if (showToastNotifications && result.issues.length > 0) {
          showValidationNotifications(result);
        }

        return result;
      } else {
        throw new Error(response.error || 'Validation failed');
      }
    } catch (error) {
      console.error('❌ [VALIDATION HOOK] Validation error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to validate cart';

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage,
      }));

      if (showToastNotifications) {
        Alert.alert('Validation Error', errorMessage);
      }

      return null;
    } finally {
      isValidatingRef.current = false;
    }
  }, [cartState.items, showToastNotifications, validationState.validationResult]);

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    console.log('🗑️ [VALIDATION HOOK] Clearing validation state');
    setValidationState({
      isValidating: false,
      validationResult: null,
      error: null,
      lastValidated: null,
    });
  }, []);

  /**
   * Remove all invalid items from cart
   */
  const removeInvalidItems = useCallback(async () => {
    if (!validationState.validationResult) {
      console.log('⚠️ [VALIDATION HOOK] No validation result available');
      return;
    }

    const invalidItems = validationState.validationResult.invalidItems;

    if (invalidItems.length === 0) {
      console.log('ℹ️ [VALIDATION HOOK] No invalid items to remove');
      return;
    }

    try {
      console.log('🗑️ [VALIDATION HOOK] Removing', invalidItems.length, 'invalid items');

      // Remove each invalid item
      for (const invalidItem of invalidItems) {
        await cartActions.removeItem(invalidItem.itemId);
      }

      // Clear validation state after removing items
      clearValidation();

      if (showToastNotifications) {
        Alert.alert(
          'Items Removed',
          `${invalidItems.length} invalid item(s) removed from cart`
        );
      }

      console.log('✅ [VALIDATION HOOK] Invalid items removed successfully');
    } catch (error) {
      console.error('❌ [VALIDATION HOOK] Error removing invalid items:', error);

      if (showToastNotifications) {
        Alert.alert('Error', 'Failed to remove some items. Please try again.');
      }
    }
  }, [validationState.validationResult, cartActions, clearValidation, showToastNotifications]);

  /**
   * Check if a specific item is valid
   */
  const isItemValid = useCallback((itemId: string): boolean => {
    if (!validationState.validationResult) {
      return true; // Assume valid if not validated
    }

    const invalidItem = validationState.validationResult.invalidItems.find(
      item => item.itemId === itemId
    );

    return !invalidItem;
  }, [validationState.validationResult]);

  /**
   * Show toast notifications for validation issues
   */
  const showValidationNotifications = useCallback((result: ValidationResult) => {
    const errorIssues = result.issues.filter(issue => issue.severity === 'error');
    const warningIssues = result.issues.filter(issue => issue.severity === 'warning');

    if (errorIssues.length > 0) {
      const message = errorIssues.length === 1
        ? errorIssues[0].message
        : `${errorIssues.length} items have issues`;

      Alert.alert('Cart Issues', message);
    } else if (warningIssues.length > 0) {
      const message = warningIssues.length === 1
        ? warningIssues[0].message
        : `${warningIssues.length} items have low stock`;

      // Don't show alert for warnings, just log
      console.log('⚠️ [VALIDATION HOOK] Warnings:', message);
    }
  }, []);

  /**
   * Auto-validate when cart changes
   */
  useEffect(() => {
    if (autoValidate && cartState.items.length > 0) {
      console.log('🔄 [VALIDATION HOOK] Cart changed, auto-validating...');

      // Debounce validation to avoid excessive API calls
      const timeoutId = setTimeout(() => {
        validateCart();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [cartState.items, autoValidate]);

  /**
   * Periodic validation (real-time updates)
   */
  useEffect(() => {
    if (validationInterval > 0 && cartState.items.length > 0) {
      console.log('⏰ [VALIDATION HOOK] Starting periodic validation every', validationInterval, 'ms');

      validationTimerRef.current = setInterval(() => {
        console.log('🔄 [VALIDATION HOOK] Periodic validation triggered');
        validateCart();
      }, validationInterval);

      return () => {
        if (validationTimerRef.current) {
          clearInterval(validationTimerRef.current);
          validationTimerRef.current = null;
        }
      };
    }
  }, [validationInterval, cartState.items.length, validateCart]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearInterval(validationTimerRef.current);
      }
    };
  }, []);

  // Computed values
  const hasInvalidItems = validationState.validationResult
    ? validationState.validationResult.invalidItems.length > 0
    : false;

  const canCheckout = validationState.validationResult
    ? validationState.validationResult.canCheckout
    : true;

  const invalidItemCount = validationState.validationResult
    ? validationState.validationResult.invalidItems.length
    : 0;

  const warningCount = validationState.validationResult
    ? validationState.validationResult.issues.filter(issue => issue.severity === 'warning').length
    : 0;

  const errorCount = validationState.validationResult
    ? validationState.validationResult.issues.filter(issue => issue.severity === 'error').length
    : 0;

  return {
    validationState,
    hasInvalidItems,
    canCheckout,
    invalidItemCount,
    warningCount,
    errorCount,
    validateCart,
    clearValidation,
    removeInvalidItems,
    isItemValid,
  };
}

export default useCartValidation;