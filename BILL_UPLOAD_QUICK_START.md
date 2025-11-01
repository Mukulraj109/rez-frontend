# Bill Upload - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Use the Enhanced Upload Page

Replace your existing bill upload with the new enhanced version:

```typescript
// In your navigation or routing
import EnhancedBillUpload from '@/app/bill-upload-enhanced';

// Use it as your bill upload page
<EnhancedBillUpload />
```

Or rename the file:
```bash
mv app/bill-upload.tsx app/bill-upload-old.tsx
mv app/bill-upload-enhanced.tsx app/bill-upload.tsx
```

### 2. That's It!

The new system works out of the box with:
- ✅ Automatic OCR extraction
- ✅ Real-time verification
- ✅ Fraud detection
- ✅ Cashback calculation
- ✅ Manual correction
- ✅ Error handling

---

## 📝 Basic Usage

### Simple Implementation

```typescript
import { useBillVerification } from '@/hooks/useBillVerification';

function MyBillUpload() {
  const {
    workflow,
    startVerification,
    submitBill,
    estimatedCashback,
    canProceed
  } = useBillVerification();

  const handleUpload = async (imageUri: string) => {
    // Start automatic verification
    await startVerification(imageUri);

    // System will automatically:
    // - Analyze image quality
    // - Extract text with OCR
    // - Match merchant
    // - Verify bill
    // - Check for fraud
    // - Calculate cashback

    // When ready, submit
    if (canProceed) {
      await submitBill();
      alert(`Success! Earn ₹${estimatedCashback}`);
    }
  };

  return (
    <View>
      <Button onPress={() => handleUpload(imageUri)} />
      {workflow && <Text>{workflow.currentState.message}</Text>}
    </View>
  );
}
```

---

## 🎯 Key Features

### 1. Automatic Verification (No Code Needed!)

Just upload an image and the system handles everything:

```typescript
await startVerification(imageUri);
// ✅ Image analysis
// ✅ OCR extraction
// ✅ Merchant matching
// ✅ Verification
// ✅ Fraud check
// ✅ Cashback calculation
```

### 2. Real-Time Progress

```typescript
{workflow?.currentState && (
  <BillVerificationStatus state={workflow.currentState} />
)}
```

Shows: "Analyzing image... 15% → Extracting text... 30% → etc."

### 3. Manual Corrections (Built-in!)

```typescript
<ManualCorrectionForm
  ocrData={workflow.ocrData}
  onSubmit={applyManualCorrections}
/>
```

Users can fix OCR errors easily.

### 4. Cashback Preview

```typescript
{workflow?.cashbackCalculation && (
  <CashbackCalculator calculation={workflow.cashbackCalculation} />
)}
```

Shows detailed breakdown before submission.

---

## 🔌 Backend Integration

### Required Endpoints

Your backend needs these endpoints (or mock them):

```typescript
// 1. Image Analysis
POST /api/bills/analyze-image
Input: FormData with image
Output: { quality, score, hash }

// 2. OCR Extraction
POST /api/bills/extract-data
Input: FormData with image
Output: { merchantName, amount, date, confidence }

// 3. Merchant Matching
POST /api/bills/match-merchant
Input: { merchantName }
Output: { matches: [{ merchantId, name, cashbackRate }] }

// 4. Cashback Calculation
POST /api/bills/calculate-cashback
Input: { merchantId, amount }
Output: { baseCashback, bonuses, finalCashback }

// 5. Final Upload
POST /api/bills/upload
Input: FormData + verification metadata
Output: { billId, status, cashbackAmount }
```

### Mock Backend (For Testing)

Create `services/mockBillApi.ts`:

```typescript
export const mockBillApi = {
  analyzeImage: async () => ({
    quality: 'good',
    qualityScore: 85,
    hash: 'abc123'
  }),

  extractData: async () => ({
    merchantName: 'Test Store',
    amount: 1234.56,
    date: '2025-01-15',
    confidence: 88
  }),

  matchMerchant: async () => ({
    matches: [{
      merchantId: 'store1',
      merchantName: 'Test Store',
      cashbackPercentage: 5,
      matchScore: 95
    }]
  }),

  calculateCashback: async () => ({
    baseAmount: 1234.56,
    baseCashbackRate: 5,
    baseCashback: 61.73,
    finalCashback: 61.73
  })
};
```

---

## 🎨 UI Components

### Use Pre-built Components

```typescript
// 1. Verification Status
import BillVerificationStatus from '@/components/bills/BillVerificationStatus';

<BillVerificationStatus state={workflow.currentState} />
```

```typescript
// 2. Preview Modal
import BillPreviewModal from '@/components/bills/BillPreviewModal';

<BillPreviewModal
  visible={showPreview}
  imageUri={imageUri}
  ocrData={workflow.ocrData}
  onConfirm={handleConfirm}
/>
```

```typescript
// 3. Cashback Display
import CashbackCalculator from '@/components/bills/CashbackCalculator';

<CashbackCalculator calculation={workflow.cashbackCalculation} />
```

```typescript
// 4. Requirements Guide
import BillRequirements from '@/components/bills/BillRequirements';

<BillRequirements />
```

---

## ⚙️ Configuration

### Customize Rules

Edit `services/billVerificationService.ts`:

```typescript
// Change bill age limit
maxBillAge: 30, // days

// Change amount limits
minAmount: 50,   // ₹50
maxAmount: 100000, // ₹1,00,000

// Change image requirements
maxFileSize: 10 * 1024 * 1024, // 10MB
minResolution: { width: 800, height: 600 }
```

### Customize Cashback

```typescript
// In your backend or config
const cashbackRules = [
  {
    category: 'groceries',
    rate: 2,
    dailyLimit: 500
  },
  {
    category: 'electronics',
    rate: 5,
    dailyLimit: 1000
  }
];
```

---

## 🐛 Error Handling

### Automatic Error Recovery

The system handles errors automatically:

```typescript
// Low OCR confidence → Manual correction form
// No merchant match → User can select manually
// Fraud detected → Clear message with reason
// Network error → Retry option
```

### Custom Error Handling

```typescript
const { error } = useBillVerification();

if (error) {
  Alert.alert('Error', error);
}
```

---

## 📊 Monitoring

### Track Metrics

```typescript
const {
  workflow,
  progressPercentage,
  hasErrors,
  requiresUserInput
} = useBillVerification();

// Log metrics
console.log('Progress:', progressPercentage);
console.log('Errors:', hasErrors);
console.log('Needs input:', requiresUserInput);
```

---

## 🧪 Testing

### Test with Sample Bills

```typescript
// Test image URLs
const testBills = [
  'https://example.com/clear-bill.jpg',    // Good quality
  'https://example.com/blurry-bill.jpg',   // Poor quality
  'https://example.com/handwritten.jpg'    // Handwritten
];

// Test each
for (const bill of testBills) {
  await startVerification(bill);
}
```

### Mock Scenarios

```typescript
// Mock OCR failure
mockOCRService.setConfidence(30); // Low confidence

// Mock fraud detection
mockFraudService.simulateDuplicate();

// Mock network error
mockApiClient.simulateError();
```

---

## 🎯 Common Scenarios

### Scenario 1: Perfect Bill
```
User uploads → OCR 95% confident → Auto-matched merchant
→ No fraud flags → Cashback calculated → User confirms → Done!
Time: ~10 seconds
```

### Scenario 2: Low Confidence OCR
```
User uploads → OCR 65% confident → Shows extracted data
→ User confirms/edits → Re-verification → Done!
Time: ~30 seconds
```

### Scenario 3: Multiple Merchant Matches
```
User uploads → OCR good → 3 merchants found
→ User selects correct one → Verification continues → Done!
Time: ~20 seconds
```

### Scenario 4: Fraud Detection
```
User uploads → Duplicate detected → Clear error message
→ "This bill was already uploaded" → Upload blocked
Time: ~5 seconds
```

---

## 💡 Pro Tips

1. **Always show progress**
   ```typescript
   <BillVerificationStatus state={workflow.currentState} />
   ```

2. **Preview before submit**
   ```typescript
   <BillPreviewModal ... />
   ```

3. **Show cashback early**
   ```typescript
   if (estimatedCashback > 0) {
     alert(`You'll earn ₹${estimatedCashback}!`);
   }
   ```

4. **Handle errors gracefully**
   ```typescript
   if (hasErrors) {
     <ErrorMessage errors={workflow.errors} />
   }
   ```

5. **Guide users**
   ```typescript
   <BillRequirements /> // Show before upload
   ```

---

## 🚦 Status Reference

### Verification States

- `uploading` → Uploading image
- `ocr_processing` → Extracting text
- `merchant_matching` → Finding merchant
- `amount_verification` → Checking amount
- `fraud_check` → Security checks
- `cashback_calculation` → Calculating rewards
- `user_verification` → Needs confirmation
- `approved` → Success!
- `rejected` → Failed (with reason)

---

## 📱 Full Example

```typescript
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { useBillVerification } from '@/hooks/useBillVerification';
import BillVerificationStatus from '@/components/bills/BillVerificationStatus';

export default function QuickBillUpload() {
  const [imageUri, setImageUri] = useState(null);
  const {
    workflow,
    startVerification,
    submitBill,
    estimatedCashback,
    canProceed
  } = useBillVerification();

  const handleUpload = async () => {
    // 1. Get image (camera/gallery)
    const uri = await pickImage();
    setImageUri(uri);

    // 2. Start verification (automatic!)
    await startVerification(uri);

    // 3. Wait for completion
    // System handles: OCR, matching, verification, fraud check, cashback
  };

  const handleSubmit = async () => {
    // 4. Submit when ready
    const success = await submitBill();

    if (success) {
      alert(`Success! Earn ₹${estimatedCashback.toFixed(2)}`);
    }
  };

  return (
    <View>
      {!imageUri ? (
        <Button title="Upload Bill" onPress={handleUpload} />
      ) : (
        <>
          {/* Show progress */}
          {workflow && (
            <BillVerificationStatus state={workflow.currentState} />
          )}

          {/* Show cashback */}
          {estimatedCashback > 0 && (
            <Text>You'll earn: ₹{estimatedCashback}</Text>
          )}

          {/* Submit when ready */}
          <Button
            title="Submit"
            onPress={handleSubmit}
            disabled={!canProceed}
          />
        </>
      )}
    </View>
  );
}
```

**That's it! 🎉**

---

## 🆘 Troubleshooting

### Issue: OCR not working
**Solution:** Check backend endpoint `/api/bills/extract-data`

### Issue: Cashback always 0
**Solution:** Configure cashback rules in backend

### Issue: All bills rejected
**Solution:** Check fraud detection thresholds

### Issue: Slow verification
**Solution:** Optimize image size, check network

---

## 📚 Resources

- Full docs: `BILL_VERIFICATION_SYSTEM.md`
- Types: `types/billVerification.types.ts`
- Service: `services/billVerificationService.ts`
- Hook: `hooks/useBillVerification.ts`
- Components: `components/bills/`

---

**Need help? Check the full documentation or contact the team!** 🚀
