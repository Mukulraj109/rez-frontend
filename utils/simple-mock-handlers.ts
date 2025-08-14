// Simple mock handlers for testing StoreActionButtons component

export const createSimpleMockHandlers = () => ({
  handleBuyPress: async () => {
    console.log('🛒 [BUY] Button pressed - Adding item to cart...');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('✅ [BUY] Item successfully added to cart!');
  },

  handleLockPress: async () => {
    console.log('🔒 [LOCK] Button pressed - Reserving product...');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ [LOCK] Product reserved for 15 minutes!');
  },

  handleBookingPress: async () => {
    console.log('📅 [BOOKING] Button pressed - Initiating booking...');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('✅ [BOOKING] Booking process started!');
  },
});