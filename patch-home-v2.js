const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/(tabs)/index.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find the start line (line 466 - "// Calculate loyalty points")
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Calculate loyalty points based on the documentation:')) {
    startLine = i;
  }
  if (startLine >= 0 && lines[i].includes('setTotalSaved(0);') && lines[i+1] && lines[i+1].includes('}')) {
    // Find the last setTotalSaved(0) in the catch block
    if (i > startLine + 70) { // Make sure we're past the main block
      endLine = i + 1; // Include the closing brace
      break;
    }
  }
}

if (startLine === -1) {
  console.log('❌ Could not find start of loyalty points code');
  process.exit(1);
}

if (endLine === -1) {
  console.log('❌ Could not find end of loyalty points code');
  process.exit(1);
}

console.log(`Found code block from line ${startLine + 1} to ${endLine + 1}`);

// New code to insert
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

// Replace the lines
const newLines = [
  ...lines.slice(0, startLine),
  ...newCode.split('\n'),
  ...lines.slice(endLine + 1)
];

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('✅ Home page patched successfully!');
console.log('   Removed loyalty points calculation/sync logic');
console.log('   Now shows actual wallet balance');
