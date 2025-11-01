/**
 * CartSocketIntegration Component
 *
 * This component integrates Socket.IO real-time updates with the CartContext.
 * It listens for stock changes and automatically updates the cart when:
 * - A product goes out of stock (removes from cart)
 * - Stock quantity changes (adjusts cart quantity if needed)
 * - Price changes (notifies user)
 *
 * Usage: Place this component at the root level (already included in _layout.tsx via SocketProvider)
 * Or use it in specific screens where you want cart-socket integration
 */

import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useCart } from '@/contexts/CartContext';
import { useSocket } from '@/contexts/SocketContext';

export function CartSocketIntegration() {
  const { state: cartState, actions: cartActions } = useCart();
  const { onStockUpdate, onOutOfStock, onPriceUpdate } = useSocket();

  useEffect(() => {

    // Subscribe to all products in cart
    cartState.items.forEach(item => {
      // Socket context will handle subscription internally when components mount

    });

    // Listen for stock updates
    const unsubscribeStock = onStockUpdate((payload) => {

      // Find cart item with this product ID
      const cartItem = cartState.items.find(
        item => (item.productId || item.id) === payload.productId
      if (!cartItem) return;

      // If cart quantity exceeds available stock, adjust it
      if (cartItem.quantity > payload.quantity) {

        if (payload.quantity === 0) {
          // Remove item if no stock available
          cartActions.removeItem(cartItem.id);
          Alert.alert(
            'Stock Update',
            `${cartItem.name} is now out of stock and has been removed from your cart.`
        } else {
          // Update quantity to match available stock
          cartActions.updateQuantity(cartItem.id, payload.quantity);
          Alert.alert(
            'Stock Update',
            `${cartItem.name} stock is now ${payload.quantity}. Your cart has been updated.`
        }
      }

      // Show low stock warning
      if (payload.status === 'LOW_STOCK' && cartItem.quantity === payload.quantity) {

        // Could show a toast notification here instead of alert
      }
    });

    // Listen for out of stock notifications
    const unsubscribeOut = onOutOfStock((payload) => {

      const cartItem = cartState.items.find(
        item => (item.productId || item.id) === payload.productId
      if (!cartItem) return;

      // Remove item from cart
      cartActions.removeItem(cartItem.id);
      Alert.alert(
        'Out of Stock',
        `${payload.productName} is now out of stock and has been removed from your cart.`
    });

    // Listen for price updates
    const unsubscribePrice = onPriceUpdate((payload) => {

      const cartItem = cartState.items.find(
        item => (item.productId || item.id) === payload.productId
      if (!cartItem) return;

      // Reload cart to get updated prices
      cartActions.loadCart();

      // Notify user of price change
      const priceChange = payload.newPrice - payload.oldPrice;
      const priceChangeText = priceChange > 0
        ? `increased by $${Math.abs(priceChange).toFixed(2)}`
        : `decreased by $${Math.abs(priceChange).toFixed(2)}`;

      Alert.alert(
        'Price Update',
        `The price of ${cartItem.name} has ${priceChangeText}. Your cart has been updated.`
    });

    // Cleanup
    return () => {

      unsubscribeStock();
      unsubscribeOut();
      unsubscribePrice();
    };
  }, [cartState.items]); // Re-run when cart items change

  // This component doesn't render anything
  return null;
}

export default CartSocketIntegration;