const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Old code that calculates and syncs loyalty points
const oldCode = `        // Calculate loyalty points based on the documentation:
        // Shop: 1 point per ₹10 spent
        // Review: 50 points per review
        // Refer: 200 points per referral
        // Video: 100 points per video

        const stats = response.data;
        const shopPoints = Math.floor((stats.orders?.totalSpent || 0) / 10); // 1 point per ₹10
        const reviewPoints = 0; // Reviews not available in current API response
        const referralPoints = (stats.user?.totalReferrals || 0) * 200; // 200 points per referral
        const videoPoints = (stats.videos?.totalCreated || 0) * 100; // 100 points per video

        const totalLoyaltyPoints = shopPoints + reviewPoints + referralPoints + videoPoints;

        // NEW: Sync loyalty points with wallet
        try {
          const walletApi = (await import('@/services/walletApi')).default;
          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
            const actualWalletCoins = rezCoin?.amount || 0;

            // Calculate total savings from wallet statistics
            const walletStats = walletResponse.data.statistics;
            if (walletStats) {
              const cashback = walletStats.totalCashback || 0;
              const refunds = walletStats.totalRefunds || 0;
              const totalSavings = cashback + refunds;
              setTotalSaved(totalSavings);
            }

            // If loyalty points > wallet coins, sync the difference
            if (totalLoyaltyPoints > actualWalletCoins) {
              const difference = totalLoyaltyPoints - actualWalletCoins;

              setSyncStatus('syncing');

              const creditResponse = await walletApi.creditLoyaltyPoints({
                amount: difference,
                source: {
                  type: 'loyalty_sync',
                  description: 'Syncing loyalty points to wallet',
                  metadata: {
                    shopPoints,
                    referralPoints,
                    videoPoints,
                    totalCalculated: totalLoyaltyPoints,
                    previousWalletBalance: actualWalletCoins
                  }
                }
              });

              if (creditResponse.success && creditResponse.data) {

                // Display the synced wallet coins
                setUserPoints(creditResponse.data.balance.available);
                setSyncStatus('success');
              } else {
                console.error('❌ [HOME] Failed to sync loyalty points:', creditResponse.error);
                // Fallback to calculated loyalty points
                setUserPoints(totalLoyaltyPoints);
                setSyncStatus('error');
              }
            } else {
              // Wallet has more or equal coins, use wallet balance

              setUserPoints(actualWalletCoins);
              setSyncStatus('success');
            }
          } else {
            console.warn('⚠️ [HOME] Could not get wallet balance, using calculated loyalty points');
            setUserPoints(totalLoyaltyPoints);
            setTotalSaved(0);
          }
        } catch (walletError) {
          console.error('❌ [HOME] Error syncing with wallet:', walletError);
          // Fallback to calculated loyalty points
          setUserPoints(totalLoyaltyPoints);
          setTotalSaved(0);
        }`;

// New code that simply shows wallet balance
const newCode = `        // Simply fetch and display wallet balance (coins are earned via games, achievements, daily check-in)
        try {
          const walletApi = (await import('@/services/walletApi')).default;
          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
            const actualWalletCoins = rezCoin?.amount || 0;

            // Display the actual wallet balance (no calculation/sync - just show the real balance)
            setUserPoints(actualWalletCoins);
            setSyncStatus('success');

            // Calculate total savings from wallet statistics
            const walletStats = walletResponse.data.statistics;
            if (walletStats) {
              const cashback = walletStats.totalCashback || 0;
              const refunds = walletStats.totalRefunds || 0;
              const totalSavings = cashback + refunds;
              setTotalSaved(totalSavings);
            }
          } else {
            console.warn('⚠️ [HOME] Could not get wallet balance');
            setUserPoints(0);
            setTotalSaved(0);
          }
        } catch (walletError) {
          console.error('❌ [HOME] Error fetching wallet:', walletError);
          setUserPoints(0);
          setTotalSaved(0);
        }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content);
  console.log('✅ Home page patched successfully!');
  console.log('   Removed loyalty points calculation/sync logic');
  console.log('   Now shows actual wallet balance');
} else if (content.includes('Simply fetch and display wallet balance')) {
  console.log('✅ Already patched!');
} else {
  console.log('❌ Could not find the code to patch');
  console.log('   The file may have been modified');
}
