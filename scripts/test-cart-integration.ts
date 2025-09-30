// Cart Integration Test Script
// Tests the frontend cart service against the backend

import cartService from '../services/cartApi';
import apiClient from '../services/apiClient';

// Test user token (replace with a valid token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGMxNDVkNWYwMTY1MTVkOGViMzFjMGMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1OTEyODYzNCwiZXhwIjoxNzU5MjE1MDM0fQ.NxgFG7XTIFpv6QOM8JoGUkiM0hSwWqEXxOQsOKgtzcc';

// Test product IDs from our backend
const TEST_PRODUCT_IDS = {
  IPHONE: '68da62658dc2bd85d0afdb4e',
  JAVASCRIPT_BOOK: '68da62658dc2bd85d0afdb57',
  DATA_SCIENCE_BOOK: '68da62658dc2bd85d0afdb58'
};

async function testCartIntegration() {
  console.log('🧪 Starting Cart Integration Tests...\n');

  // Set auth token
  apiClient.setAuthToken(TEST_TOKEN);

  try {
    // Test 1: Get Cart
    console.log('📋 Test 1: Get Cart');
    const cartResponse = await cartService.getCart();
    console.log('✅ Get Cart Response:', {
      success: cartResponse.success,
      itemCount: cartResponse.data?.itemCount || 0,
      storeCount: cartResponse.data?.storeCount || 0,
      subtotal: cartResponse.data?.totals?.subtotal || 0
    });

    // Test 2: Add Item to Cart
    console.log('\n➕ Test 2: Add Item to Cart');
    const addResponse = await cartService.addToCart({
      productId: TEST_PRODUCT_IDS.JAVASCRIPT_BOOK,
      quantity: 1
    });
    console.log('✅ Add to Cart Response:', {
      success: addResponse.success,
      itemCount: addResponse.data?.itemCount || 0,
      message: addResponse.message
    });

    // Test 3: Update Item Quantity
    console.log('\n✏️ Test 3: Update Item Quantity');
    const updateResponse = await cartService.updateCartItem(
      TEST_PRODUCT_IDS.IPHONE,
      { quantity: 3 }
    );
    console.log('✅ Update Item Response:', {
      success: updateResponse.success,
      itemCount: updateResponse.data?.itemCount || 0,
      message: updateResponse.message
    });

    // Test 4: Get Cart Summary
    console.log('\n📊 Test 4: Get Cart Summary');
    const summaryResponse = await cartService.getCartSummary();
    console.log('✅ Cart Summary Response:', {
      success: summaryResponse.success,
      itemCount: summaryResponse.data?.itemCount || 0,
      subtotal: summaryResponse.data?.totals?.subtotal || 0,
      tax: summaryResponse.data?.totals?.tax || 0,
      total: summaryResponse.data?.totals?.total || 0
    });

    // Test 5: Validate Cart
    console.log('\n🔍 Test 5: Validate Cart');
    const validateResponse = await cartService.validateCart();
    console.log('✅ Validate Cart Response:', {
      success: validateResponse.success,
      valid: validateResponse.data?.valid || false,
      message: validateResponse.message
    });

    // Test 6: Remove Item
    console.log('\n🗑️ Test 6: Remove Item');
    const removeResponse = await cartService.removeCartItem(
      TEST_PRODUCT_IDS.JAVASCRIPT_BOOK
    );
    console.log('✅ Remove Item Response:', {
      success: removeResponse.success,
      itemCount: removeResponse.data?.itemCount || 0,
      message: removeResponse.message
    });

    // Final Cart State
    console.log('\n📋 Final Cart State');
    const finalCartResponse = await cartService.getCart();
    console.log('✅ Final Cart:', {
      success: finalCartResponse.success,
      itemCount: finalCartResponse.data?.itemCount || 0,
      storeCount: finalCartResponse.data?.storeCount || 0,
      subtotal: finalCartResponse.data?.totals?.subtotal || 0,
      items: finalCartResponse.data?.items?.map(item => ({
        name: item.product?.name,
        quantity: item.quantity,
        price: item.price
      })) || []
    });

    console.log('\n🎉 All Cart Integration Tests Completed Successfully!');

  } catch (error) {
    console.error('❌ Cart Integration Test Failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the tests
testCartIntegration();