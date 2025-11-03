/**
 * Bill Upload Component with Complete Analytics Integration
 *
 * This example demonstrates how to integrate all three analytics services:
 * - billUploadAnalytics: Track upload metrics and conversion funnel
 * - errorReporter: Capture and report errors with context
 * - telemetryService: Send batched events to backend
 *
 * @example Complete implementation with analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { billUploadAnalytics } from '@/services/billUploadAnalytics';
import { errorReporter } from '@/utils/errorReporter';
import { telemetryService } from '@/services/telemetryService';
import { uploadBill, validateBillData } from '@/services/billUploadService';

// ============================================================================
// Types
// ============================================================================

interface BillData {
  merchantId: string;
  merchantName: string;
  amount: number;
  date: string;
  imageUri: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'verifying';
}

// ============================================================================
// Component
// ============================================================================

export const BillUploadWithAnalytics: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [billData, setBillData] = useState<Partial<BillData>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ==========================================================================
  // Lifecycle - Track Page View
  // ==========================================================================

  useEffect(() => {
    // Initialize session
    const sessionId = `session_${Date.now()}`;
    errorReporter.setSessionId(sessionId);

    // Track page view
    billUploadAnalytics.trackPageView('bill_upload');
    billUploadAnalytics.trackFunnelPageLoad();

    // Add breadcrumb
    errorReporter.addBreadcrumb({
      type: 'navigation',
      message: 'User entered bill upload page',
      category: 'navigation',
    });

    // Cleanup on unmount
    return () => {
      // Flush any pending events
      billUploadAnalytics.flushEvents();
      telemetryService.flush();

      // Log session end
      errorReporter.addBreadcrumb({
        type: 'navigation',
        message: 'User left bill upload page',
        category: 'navigation',
      });
    };
  }, []);

  // ==========================================================================
  // Image Selection
  // ==========================================================================

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    try {
      // Add breadcrumb
      errorReporter.addBreadcrumb({
        type: 'user_action',
        message: `User clicked ${source} button`,
        category: 'ui',
        data: { source },
      });

      // Request permissions
      let permissionResult;
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        errorReporter.captureMessage(
          `${source} permission denied`,
          'warning',
          { context: 'Image selection' }
        );

        Alert.alert(
          'Permission Required',
          `Please grant ${source} permission to upload bills.`
        );
        return;
      }

      // Launch picker
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      if (result.canceled) {
        billUploadAnalytics.trackUserAction('image_selection_cancelled', { source });
        return;
      }

      const asset = result.assets[0];
      const fileSize = asset.fileSize || 0;

      // Check image quality
      if (asset.width < 800 || asset.height < 600) {
        billUploadAnalytics.trackImageQualityWarning('low_resolution');

        Alert.alert(
          'Low Image Quality',
          'This image has low resolution. For better results, use a higher quality image.',
          [
            { text: 'Use Anyway', onPress: () => proceedWithImage(asset.uri, fileSize, source) },
            { text: 'Choose Another', style: 'cancel' },
          ]
        );
        return;
      }

      proceedWithImage(asset.uri, fileSize, source);

    } catch (error) {
      errorReporter.captureError(error as Error, {
        context: 'Image selection',
        component: 'BillUpload',
        action: 'handlePickImage',
        metadata: { source },
      }, 'error');

      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const proceedWithImage = (uri: string, fileSize: number, source: 'camera' | 'gallery') => {
    setImageUri(uri);
    setBillData({ ...billData, imageUri: uri });

    // Track image selection
    billUploadAnalytics.trackImageSelected(source, fileSize);
    billUploadAnalytics.trackFunnelImageSelected();

    // Track custom event
    telemetryService.trackEvent(
      'image_selected',
      'bill_upload',
      { source, fileSize, timestamp: Date.now() }
    );

    // Add breadcrumb
    errorReporter.addBreadcrumb({
      type: 'user_action',
      message: 'Image selected successfully',
      category: 'upload',
      data: { source, fileSize },
    });
  };

  // ==========================================================================
  // Form Validation
  // ==========================================================================

  const validateForm = (): boolean => {
    errorReporter.addBreadcrumb({
      type: 'state_change',
      message: 'Validating form data',
      category: 'validation',
    });

    let isValid = true;

    // Validate merchant
    if (!billData.merchantId || !billData.merchantName) {
      billUploadAnalytics.trackValidationError(
        'merchant',
        'REQUIRED_FIELD',
        'Merchant is required'
      );
      isValid = false;
    }

    // Validate amount
    if (!billData.amount || billData.amount <= 0) {
      billUploadAnalytics.trackValidationError(
        'amount',
        'INVALID_AMOUNT',
        'Amount must be greater than 0'
      );
      isValid = false;
    } else {
      billUploadAnalytics.trackAmountValidated(billData.amount, true);
    }

    // Validate date
    if (!billData.date) {
      billUploadAnalytics.trackValidationError(
        'date',
        'REQUIRED_FIELD',
        'Date is required'
      );
      isValid = false;
    } else {
      const billDate = new Date(billData.date);
      const today = new Date();

      if (billDate > today) {
        billUploadAnalytics.trackValidationError(
          'date',
          'FUTURE_DATE',
          'Date cannot be in the future'
        );
        billUploadAnalytics.trackDateValidated(billData.date, false);
        isValid = false;
      } else {
        billUploadAnalytics.trackDateValidated(billData.date, true);
      }
    }

    // Validate image
    if (!billData.imageUri) {
      billUploadAnalytics.trackValidationError(
        'image',
        'REQUIRED_FIELD',
        'Image is required'
      );
      isValid = false;
    }

    if (isValid) {
      billUploadAnalytics.trackFunnelFormFilled();
    }

    return isValid;
  };

  // ==========================================================================
  // Upload Bill
  // ==========================================================================

  const handleUploadBill = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const billId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentBillId(billId);
    setIsUploading(true);

    try {
      // Add breadcrumb
      errorReporter.addBreadcrumb({
        type: 'user_action',
        message: 'User clicked upload button',
        category: 'upload',
        data: { billId },
      });

      // Track form submission
      billUploadAnalytics.trackFormSubmitted(billId);

      // Get file size
      const fileSize = await getFileSize(billData.imageUri!);

      // Track upload start
      billUploadAnalytics.trackUploadStart(billId, fileSize);

      // Upload bill with progress tracking
      const result = await uploadBill(
        billData as BillData,
        {
          onProgress: (progress: UploadProgress) => {
            setUploadProgress(progress);

            // Track significant progress milestones
            if (progress.percentage === 25 ||
                progress.percentage === 50 ||
                progress.percentage === 75 ||
                progress.percentage === 100) {
              billUploadAnalytics.trackUploadProgress(billId, progress);
            }

            // Add breadcrumb for stage changes
            errorReporter.addBreadcrumb({
              type: 'state_change',
              message: `Upload stage: ${progress.stage}`,
              category: 'upload',
              data: { percentage: progress.percentage, stage: progress.stage },
            });
          },
        }
      );

      // Upload successful
      billUploadAnalytics.trackUploadComplete(billId, {
        fileSize,
        ocrSuccess: result.ocrData?.success,
        autoVerified: result.autoVerified,
      });

      billUploadAnalytics.trackFunnelBillSubmitted();

      // Track OCR results
      if (result.ocrData) {
        billUploadAnalytics.trackOCRResult(
          billId,
          result.ocrData.success,
          result.ocrData.confidence,
          Object.keys(result.ocrData.fields || {})
        );

        errorReporter.addBreadcrumb({
          type: 'state_change',
          message: 'OCR processing completed',
          category: 'processing',
          data: {
            success: result.ocrData.success,
            confidence: result.ocrData.confidence,
          },
        });
      }

      // If auto-approved, track funnel completion
      if (result.status === 'approved') {
        billUploadAnalytics.trackFunnelBillApproved();
      }

      // High priority success event
      telemetryService.trackHighPriorityEvent(
        'bill_upload_success',
        'bill_upload',
        {
          billId,
          fileSize,
          ocrSuccess: result.ocrData?.success,
          autoVerified: result.autoVerified,
          status: result.status,
        }
      );

      // Success UI
      Alert.alert(
        'Success!',
        'Your bill has been uploaded successfully.',
        [{ text: 'OK', onPress: resetForm }]
      );

    } catch (error) {
      // Track upload failure
      billUploadAnalytics.trackUploadFailed(billId, error as Error, retryCount);

      // Capture error with full context
      errorReporter.captureError(error as Error, {
        context: 'Bill upload',
        component: 'BillUpload',
        action: 'handleUploadBill',
        metadata: {
          billId,
          retryCount,
          billData: {
            merchantId: billData.merchantId,
            amount: billData.amount,
            date: billData.date,
          },
        },
      }, 'error');

      // High priority error event
      telemetryService.trackHighPriorityEvent(
        'bill_upload_error',
        'bill_upload',
        {
          billId,
          error: (error as Error).message,
          retryCount,
        }
      );

      // Show retry option
      Alert.alert(
        'Upload Failed',
        'Failed to upload bill. Would you like to retry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleRetry },
        ]
      );

    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // ==========================================================================
  // Retry Logic
  // ==========================================================================

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    // Track retry
    if (currentBillId) {
      billUploadAnalytics.trackRetryAttempt(
        currentBillId,
        newRetryCount,
        'user_initiated'
      );
    }

    errorReporter.addBreadcrumb({
      type: 'user_action',
      message: 'User initiated retry',
      category: 'upload',
      data: { retryCount: newRetryCount },
    });

    // Retry upload
    handleUploadBill();
  };

  // ==========================================================================
  // Merchant Selection
  // ==========================================================================

  const handleMerchantSelect = (merchantId: string, merchantName: string) => {
    setBillData({ ...billData, merchantId, merchantName });

    // Track merchant selection
    billUploadAnalytics.trackMerchantSelected(merchantId, merchantName);

    errorReporter.addBreadcrumb({
      type: 'user_action',
      message: 'Merchant selected',
      category: 'form',
      data: { merchantId, merchantName },
    });
  };

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  const getFileSize = async (uri: string): Promise<number> => {
    // Implementation to get file size
    // This is a placeholder
    return 1024000;
  };

  const resetForm = () => {
    setImageUri(null);
    setBillData({});
    setRetryCount(0);
    setCurrentBillId(null);

    errorReporter.addBreadcrumb({
      type: 'state_change',
      message: 'Form reset',
      category: 'form',
    });
  };

  // ==========================================================================
  // View Analytics (Debug)
  // ==========================================================================

  const viewAnalytics = async () => {
    try {
      const metrics = await billUploadAnalytics.getMetrics();
      const funnel = await billUploadAnalytics.trackConversionFunnel();
      const errorStats = errorReporter.getErrorStats();
      const telemetryStats = telemetryService.getStats();
      const queueStatus = telemetryService.getQueueStatus();

      console.log('=== ANALYTICS DASHBOARD ===');
      console.log('\nUpload Metrics:');
      console.log(`- Success Rate: ${metrics.upload.successRate.toFixed(2)}%`);
      console.log(`- Total Attempts: ${metrics.upload.totalAttempts}`);
      console.log(`- Average Upload Time: ${metrics.upload.averageUploadTime}ms`);
      console.log(`- Retry Rate: ${metrics.upload.retryRate.toFixed(2)}%`);

      console.log('\nConversion Funnel:');
      console.log(`- Page Loads: ${funnel.initialLoad}`);
      console.log(`- Images Selected: ${funnel.imageSelected}`);
      console.log(`- Forms Filled: ${funnel.formFilled}`);
      console.log(`- Bills Submitted: ${funnel.billSubmitted}`);
      console.log(`- Bills Approved: ${funnel.billApproved}`);
      console.log(`- Conversion Rate: ${funnel.conversionRate.toFixed(2)}%`);

      console.log('\nOCR Metrics:');
      console.log(`- Accuracy: ${metrics.ocr.accuracy.toFixed(2)}%`);
      console.log(`- Average Confidence: ${metrics.ocr.averageConfidence.toFixed(2)}%`);

      console.log('\nError Metrics:');
      console.log(`- Total Errors: ${errorStats.totalErrors}`);
      console.log(`- Unique Errors: ${errorStats.uniqueErrors}`);
      console.log(`- Critical Errors: ${metrics.errors.criticalErrors}`);

      console.log('\nTelemetry:');
      console.log(`- Success Rate: ${telemetryStats.successRate.toFixed(2)}%`);
      console.log(`- Pending Events: ${telemetryStats.pendingEvents}`);
      console.log(`- Queue Size: ${queueStatus.events} events in ${queueStatus.batches} batches`);

      Alert.alert('Analytics', 'Check console for detailed analytics');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Bill</Text>

      {/* Image Preview */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {/* Image Selection Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePickImage('camera')}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePickImage('gallery')}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields (simplified) */}
      {/* Add your form inputs here */}

      {/* Upload Progress */}
      {uploadProgress && (
        <View style={styles.progressContainer}>
          <Text>Uploading: {uploadProgress.percentage}%</Text>
          <Text>Stage: {uploadProgress.stage}</Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
        onPress={handleUploadBill}
        disabled={isUploading || !imageUri}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload Bill</Text>
        )}
      </TouchableOpacity>

      {/* Debug: View Analytics */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugButton}
          onPress={viewAnalytics}
        >
          <Text style={styles.debugButtonText}>View Analytics (Debug)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 8,
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  debugButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default BillUploadWithAnalytics;
