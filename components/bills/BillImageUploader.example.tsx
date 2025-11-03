/**
 * BillImageUploader Example Usage
 * Demonstrates how to use the BillImageUploader component
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import BillImageUploader from './BillImageUploader';
import { UploadProgress } from '@/types/upload.types';
import { FILE_SIZE_LIMITS } from '@/utils/fileUploadConstants';

/**
 * Example 1: Basic Usage
 */
export const BasicExample = () => {
  const [imageUri, setImageUri] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basic Usage</Text>
      <BillImageUploader
        onImageSelected={(uri) => {
          console.log('Image selected:', uri);
          setImageUri(uri);
        }}
        onImageRemoved={() => {
          console.log('Image removed');
          setImageUri('');
        }}
      />
      {imageUri && (
        <Text style={styles.info}>Selected: {imageUri.split('/').pop()}</Text>
      )}
    </View>
  );
};

/**
 * Example 2: With Custom Max Size
 */
export const CustomMaxSizeExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Max Size (2MB)</Text>
      <BillImageUploader
        maxSize={2 * 1024 * 1024} // 2MB
        onImageSelected={(uri) => console.log('Image selected:', uri)}
        onImageRemoved={() => console.log('Image removed')}
      />
    </View>
  );
};

/**
 * Example 3: With Upload Progress Tracking
 */
export const UploadProgressExample = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    console.log(`Upload progress: ${progress.percentage}%`);
  };

  const handleUploadComplete = (uri: string) => {
    console.log('Upload complete:', uri);
    Alert.alert('Success', 'Bill uploaded successfully!');
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    Alert.alert('Error', `Upload failed: ${error.message}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>With Upload Progress</Text>
      <BillImageUploader
        onImageSelected={(uri) => console.log('Image selected:', uri)}
        onUploadStart={() => console.log('Upload started')}
        onUploadProgress={handleUploadProgress}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
      />
      {uploadProgress && (
        <View style={styles.progressInfo}>
          <Text>Progress: {uploadProgress.percentage}%</Text>
          <Text>Speed: {(uploadProgress.speed / 1024).toFixed(2)} KB/s</Text>
          <Text>Time remaining: {uploadProgress.timeRemaining}s</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Example 4: With Initial Image
 */
export const WithInitialImageExample = () => {
  const initialUri = 'https://example.com/sample-bill.jpg';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>With Initial Image</Text>
      <BillImageUploader
        initialImageUri={initialUri}
        onImageSelected={(uri) => console.log('Image selected:', uri)}
        onImageRemoved={() => console.log('Image removed')}
      />
    </View>
  );
};

/**
 * Example 5: Complete Form Integration
 */
export const FormIntegrationExample = () => {
  const [formData, setFormData] = useState({
    billImage: '',
    merchantName: '',
    amount: '',
    date: '',
  });

  const handleImageSelected = (uri: string) => {
    setFormData((prev) => ({ ...prev, billImage: uri }));
    console.log('Form updated with image:', uri);
  };

  const handleImageRemoved = () => {
    setFormData((prev) => ({ ...prev, billImage: '' }));
    console.log('Image removed from form');
  };

  const handleSubmit = () => {
    if (!formData.billImage) {
      Alert.alert('Error', 'Please upload a bill image');
      return;
    }
    console.log('Submitting form:', formData);
    Alert.alert('Success', 'Bill submitted successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Form Integration</Text>

      <BillImageUploader
        onImageSelected={handleImageSelected}
        onImageRemoved={handleImageRemoved}
        maxSize={FILE_SIZE_LIMITS.MAX_IMAGE_SIZE}
      />

      {/* Other form fields would go here */}
      <View style={styles.formInfo}>
        <Text style={styles.formInfoTitle}>Form Data:</Text>
        <Text>Bill Image: {formData.billImage ? 'Selected' : 'Not selected'}</Text>
      </View>
    </ScrollView>
  );
};

/**
 * Example 6: Error Handling
 */
export const ErrorHandlingExample = () => {
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error.message);

    // Custom error handling based on error type
    if (error.message.includes('network')) {
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } else if (error.message.includes('size')) {
      Alert.alert(
        'File Too Large',
        'Please select an image smaller than 5MB.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', error.message, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Handling</Text>
      <BillImageUploader
        onImageSelected={(uri) => console.log('Image selected:', uri)}
        onUploadError={handleUploadError}
        maxSize={1 * 1024 * 1024} // 1MB to trigger errors easily
      />
    </View>
  );
};

/**
 * Example 7: Custom Accepted Formats
 */
export const CustomFormatsExample = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Accepted Formats</Text>
      <BillImageUploader
        acceptedFormats={['image/jpeg', 'image/png']} // Only JPEG and PNG
        onImageSelected={(uri) => console.log('Image selected:', uri)}
      />
      <Text style={styles.hint}>Only JPEG and PNG formats accepted</Text>
    </View>
  );
};

/**
 * Complete Demo Screen
 */
export const BillImageUploaderDemo = () => {
  return (
    <ScrollView style={styles.demoContainer}>
      <Text style={styles.demoTitle}>BillImageUploader Examples</Text>

      <BasicExample />
      <View style={styles.divider} />

      <CustomMaxSizeExample />
      <View style={styles.divider} />

      <UploadProgressExample />
      <View style={styles.divider} />

      <WithInitialImageExample />
      <View style={styles.divider} />

      <ErrorHandlingExample />
      <View style={styles.divider} />

      <CustomFormatsExample />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  demoContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  info: {
    marginTop: 12,
    fontSize: 13,
    color: '#6b7280',
  },
  progressInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  formInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  formInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
});

export default BillImageUploaderDemo;
