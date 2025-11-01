// Bill Upload Page
// Users can upload bills from offline purchases to earn cashback

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import * as ExpoCamera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { billUploadService } from '@/services/billUploadService';
import storesApi from '@/services/storesApi';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { HeaderBackButton } from '@/components/navigation';

// Define CameraType enum if not available
const CameraType = {
  back: 'back' as const,
  front: 'front' as const
};

type CameraTypeValue = typeof CameraType[keyof typeof CameraType];

interface BillFormData {
  merchantId: string;
  merchantName: string;
  amount: string;
  billDate: string;
  billNumber: string;
  notes: string;
}

interface Store {
  _id: string;
  name: string;
  logo?: string;
  cashbackPercentage?: number;
}

export default function BillUploadPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { goBack } = useSafeNavigation();

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Safe navigation function
  const handleGoBack = () => {
    goBack('/' as any);
  };

  // Camera states
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraTypeValue>(CameraType.back);
  const cameraRef = useRef<ExpoCamera.CameraView>(null);

  // Bill image state
  const [billImage, setBillImage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<BillFormData>({
    merchantId: '',
    merchantName: '',
    amount: '',
    billDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    notes: '',
  });

  // Merchant selection
  const [merchants, setMerchants] = useState<Store[]>([]);
  const [showMerchantSelector, setShowMerchantSelector] = useState(false);
  const [merchantSearchQuery, setMerchantSearchQuery] = useState('');

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Load merchants for selection
  const loadMerchants = async () => {
    setIsLoadingMerchants(true);
    try {
      const response = await storesApi.getStores({ limit: 50 });
      if (response.success && response.data && response.data.stores) {
        const mappedStores = response.data.stores.map((store: any) => ({
          _id: store.id,
          name: store.name,
          logo: store.logo,
          cashbackPercentage: store.cashbackPercentage,
        }));
        setMerchants(mappedStores);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
    } finally {
      setIsLoadingMerchants(false);
    }
  };

  // Open camera
  const openCamera = async () => {
    if (hasPermission === null) {
      const { status } = await ExpoCamera.Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to upload bills.');
        return;
      }
    }

    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required. Please enable it in settings.');
      return;
    }

    setShowCamera(true);
  };

  // Take photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo && photo.uri) {
          setBillImage(photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBillImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Select merchant
  const selectMerchant = (merchant: Store) => {
    setFormData({
      ...formData,
      merchantId: merchant._id,
      merchantName: merchant.name,
    });
    setShowMerchantSelector(false);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!billImage) {
      Alert.alert('Error', 'Please upload a bill image');
      return false;
    }

    if (!formData.merchantId) {
      Alert.alert('Error', 'Please select a merchant');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bill amount');
      return false;
    }

    if (!formData.billDate) {
      Alert.alert('Error', 'Please enter the bill date');
      return false;
    }

    return true;
  };

  // Submit bill
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setIsProcessing(true);

    try {
      const response = await billUploadService.uploadBill({
        billImage: billImage!,
        merchantId: formData.merchantId,
        amount: parseFloat(formData.amount),
        billDate: new Date(formData.billDate),
        billNumber: formData.billNumber,
        notes: formData.notes,
      });

      setIsProcessing(false);

      if (response.success) {
        Alert.alert(
          'Success!',
          'Your bill has been uploaded successfully and is being verified. You will receive cashback once approved.',
          [
            {
              text: 'View History',
              onPress: () => router?.push ? router.push('/bill-history') : console.warn('Router not available'),
            },
            {
              text: 'Upload Another',
              onPress: resetForm,
            },
          ]
        );
      } else {
        Alert.alert('Upload Failed', response.error || 'Failed to upload bill. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading bill:', error);
      Alert.alert('Error', 'An error occurred while uploading the bill. Please try again.');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setBillImage(null);
    setFormData({
      merchantId: '',
      merchantName: '',
      amount: '',
      billDate: new Date().toISOString().split('T')[0],
      billNumber: '',
      notes: '',
    });
  };

  // Render camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <ExpoCamera.CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraCloseButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.cameraGuidelines}>
              <Text style={styles.cameraGuidelinesText}>
                Position the bill within the frame
              </Text>
              <View style={styles.cameraFrame} />
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraFlipButton}
                onPress={() => {
                  setCameraType(
                    cameraType === CameraType.back
                      ? CameraType.front
                      : CameraType.back
                  );
                }}
              >
                <Ionicons name="camera-reverse" size={32} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraCaptureButton}
                onPress={takePicture}
              >
                <View style={styles.cameraCaptureButtonInner} />
              </TouchableOpacity>

              <View style={{ width: 60 }} />
            </View>
          </View>
        </ExpoCamera.CameraView>
      </View>
    );
  }

  // Render merchant selector modal
  const renderMerchantSelector = () => (
    <Modal
      visible={showMerchantSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMerchantSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Merchant</Text>
            <TouchableOpacity onPress={() => setShowMerchantSelector(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search merchants..."
              value={merchantSearchQuery}
              onChangeText={setMerchantSearchQuery}
            />
          </View>

          <ScrollView style={styles.merchantList}>
            {isLoadingMerchants ? (
              <ActivityIndicator size="large" color="#FF6B35" />
            ) : (
              merchants
                .filter(m =>
                  m.name.toLowerCase().includes(merchantSearchQuery.toLowerCase())
                )
                .map((merchant) => (
                  <TouchableOpacity
                    key={merchant._id}
                    style={styles.merchantItem}
                    onPress={() => selectMerchant(merchant)}
                  >
                    {merchant.logo && (
                      <Image source={{ uri: merchant.logo }} style={styles.merchantLogo} />
                    )}
                    <View style={styles.merchantInfo}>
                      <Text style={styles.merchantName}>{merchant.name}</Text>
                      {merchant.cashbackPercentage && (
                        <Text style={styles.merchantCashback}>
                          {merchant.cashbackPercentage}% cashback
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <HeaderBackButton onPress={handleGoBack} iconColor="#333" />
          <Text style={styles.headerTitle}>Upload Bill</Text>
          <TouchableOpacity onPress={() => router?.push ? router.push('/bill-history') : console.warn('Router not available')}>
            <Ionicons name="time-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#FF6B35" />
          <Text style={styles.infoBannerText}>
            Upload your bill and earn up to 20% cashback on offline purchases!
          </Text>
        </View>

        {/* Bill Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Photo *</Text>
          {billImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: billImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setBillImage(null)}
              >
                <Ionicons name="close-circle" size={32} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptionsContainer}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={openCamera}
              >
                <Ionicons name="camera" size={40} color="#FF6B35" />
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={pickImageFromGallery}
              >
                <Ionicons name="images" size={40} color="#FF6B35" />
                <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.helperText}>
            Ensure the bill is clear and all details are visible
          </Text>
        </View>

        {/* Merchant Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merchant *</Text>
          <TouchableOpacity
            style={styles.merchantSelector}
            onPress={() => {
              loadMerchants();
              setShowMerchantSelector(true);
            }}
          >
            <Text style={formData.merchantName ? styles.selectedMerchant : styles.placeholderText}>
              {formData.merchantName || 'Select Merchant'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Bill Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Amount (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter bill amount"
            keyboardType="decimal-pad"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
          />
        </View>

        {/* Bill Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.billDate}
            onChangeText={(text) => setFormData({ ...formData, billDate: text })}
          />
          <Text style={styles.helperText}>Bills older than 30 days may be rejected</Text>
        </View>

        {/* Bill Number (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter bill number"
            value={formData.billNumber}
            onChangeText={(text) => setFormData({ ...formData, billNumber: text })}
          />
        </View>

        {/* Notes (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes..."
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (isUploading || !billImage) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUploading || !billImage}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Bill</Text>
          )}
        </TouchableOpacity>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.processingText}>Processing bill...</Text>
          </View>
        )}
      </ScrollView>

      {/* Merchant Selector Modal */}
      {renderMerchantSelector()}
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4ED',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B35',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  uploadOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  uploadOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  merchantSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedMerchant: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  cameraGuidelines: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuidelinesText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraFrame: {
    width: 300,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
  },
  cameraFlipButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  merchantList: {
    flex: 1,
  },
  merchantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 12,
  },
  merchantLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  merchantCashback: {
    fontSize: 12,
    color: '#FF6B35',
    marginTop: 2,
  },
});
