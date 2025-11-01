// Enhanced Bill Upload Page
// Users can upload bills with OCR verification and cashback calculation

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import * as ExpoCamera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { billUploadService } from '@/services/billUploadService';
import { useBillVerification } from '@/hooks/useBillVerification';
import BillVerificationStatus from '@/components/bills/BillVerificationStatus';
import BillPreviewModal from '@/components/bills/BillPreviewModal';
import CashbackCalculator from '@/components/bills/CashbackCalculator';
import BillRequirements from '@/components/bills/BillRequirements';
import ManualCorrectionForm from '@/components/bills/ManualCorrectionForm';

const CameraType = {
  back: 'back' as const,
  front: 'front' as const
};

type CameraTypeValue = typeof CameraType[keyof typeof CameraType];

export default function EnhancedBillUploadPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    workflow,
    isProcessing,
    error,
    startVerification,
    applyManualCorrections,
    selectMerchant,
    submitBill,
    reset,
    canProceed,
    estimatedCashback,
    hasErrors,
    requiresUserInput,
  } = useBillVerification();

  // Hide the default navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Camera states
  const [permission, requestPermission] = ExpoCamera.useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraTypeValue>(CameraType.back);
  const cameraRef = useRef<any>(null);

  // UI states
  const [billImage, setBillImage] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Safe navigation function
  const handleGoBack = () => {
    try {
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (router && router.push) {
        router.push('/');
      } else {
        router.replace('/');
      }
    } catch (error) {

      if (router) {
        router.replace('/');
      }
    }
  };

  // Open camera
  const openCamera = async () => {
    if (!permission) {
      // Permission not loaded yet
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to upload bills.');
        return;
      }
    }

    setShowCamera(true);
  };

  // Take photo and start verification
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setBillImage(photo.uri);
        setShowCamera(false);

        // Start verification process
        await startVerification(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  // Pick image from gallery and start verification
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

        // Start verification process
        await startVerification(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle preview confirmation
  const handlePreviewConfirm = async (corrections?: any) => {
    if (corrections) {
      await applyManualCorrections(corrections);
    }
    setShowPreview(false);
  };

  // Submit verified bill
  const handleSubmit = async () => {
    if (!workflow || !canProceed) {
      Alert.alert('Cannot Submit', 'Please complete verification first.');
      return;
    }

    setIsUploading(true);

    try {
      const success = await submitBill();

      if (success) {
        Alert.alert(
          'Success!',
          `Your bill has been uploaded successfully. You'll earn ₹${estimatedCashback.toFixed(2)} cashback once approved!`,
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
        Alert.alert('Upload Failed', error || 'Failed to upload bill. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting bill:', err);
      Alert.alert('Error', 'An error occurred while uploading the bill. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setBillImage(null);
    reset();
  };

  // Render camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <ExpoCamera.CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType as any}
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
              <Text style={styles.cameraGuidelinesSubtext}>
                Ensure all text is visible and clear
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Bill</Text>
          <TouchableOpacity onPress={() => setShowRequirements(true)}>
            <Ionicons name="information-circle-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="gift" size={24} color="#4CAF50" />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Earn Cashback on Bills!</Text>
            <Text style={styles.infoBannerText}>
              Upload your bills and earn up to 20% cashback instantly
            </Text>
          </View>
        </View>

        {/* Bill Image Section */}
        {!billImage ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Your Bill</Text>
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
                <Text style={styles.uploadOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Ensure the bill is clear and all details are visible
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: billImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={resetForm}
              >
                <Ionicons name="close-circle" size={32} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Verification Status */}
        {workflow && workflow.currentState && (
          <View style={styles.section}>
            <BillVerificationStatus state={workflow.currentState} />
          </View>
        )}

        {/* Errors */}
        {hasErrors && workflow && (
          <View style={styles.errorSection}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={20} color="#F44336" />
              <Text style={styles.errorTitle}>Verification Issues</Text>
            </View>
            {workflow.errors.map((err, index) => (
              <Text key={index} style={styles.errorText}>• {err}</Text>
            ))}
            <TouchableOpacity
              style={styles.correctionButton}
              onPress={() => setShowCorrectionForm(true)}
            >
              <Text style={styles.correctionButtonText}>Correct Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cashback Preview */}
        {workflow?.cashbackCalculation && (
          <View style={styles.section}>
            <CashbackCalculator calculation={workflow.cashbackCalculation} />
          </View>
        )}

        {/* Action Buttons */}
        {workflow && requiresUserInput && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => setShowPreview(true)}
            >
              <Ionicons name="eye" size={20} color="#2196F3" />
              <Text style={styles.previewButtonText}>Review Details</Text>
            </TouchableOpacity>

            {!canProceed && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowCorrectionForm(true)}
              >
                <Ionicons name="create" size={20} color="#FF9800" />
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Submit Button */}
        {billImage && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!canProceed || isUploading || isProcessing) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!canProceed || isUploading || isProcessing}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {canProceed ? 'Submit Bill' : 'Verifying...'}
                </Text>
                {estimatedCashback > 0 && (
                  <Text style={styles.submitButtonSubtext}>
                    Earn ₹{estimatedCashback.toFixed(2)} cashback
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Requirements Modal */}
      <Modal
        visible={showRequirements}
        animationType="slide"
        onRequestClose={() => setShowRequirements(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowRequirements(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Requirements</Text>
          <View style={{ width: 24 }} />
        </View>
        <BillRequirements />
      </Modal>

      {/* Preview Modal */}
      {workflow && workflow.ocrData && (
        <BillPreviewModal
          visible={showPreview}
          onClose={() => setShowPreview(false)}
          imageUri={workflow.imageUri}
          ocrData={workflow.ocrData}
          selectedMerchant={workflow.selectedMerchant}
          onConfirm={handlePreviewConfirm}
          onEdit={() => {
            setShowPreview(false);
            setShowCorrectionForm(true);
          }}
        />
      )}

      {/* Correction Form Modal */}
      {workflow && workflow.ocrData && (
        <ManualCorrectionForm
          visible={showCorrectionForm}
          onClose={() => setShowCorrectionForm(false)}
          ocrData={workflow.ocrData}
          onSubmit={async (corrections) => {
            await applyManualCorrections(corrections);
            setShowCorrectionForm(false);
          }}
        />
      )}
    </View>
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
    backgroundColor: '#E8F5E9',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
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
    textAlign: 'center',
  },
  errorSection: {
    backgroundColor: '#FFEBEE',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  errorText: {
    fontSize: 13,
    color: '#F44336',
    marginBottom: 6,
    lineHeight: 18,
  },
  correctionButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  correctionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  previewButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E5',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
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
  submitButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 4,
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
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cameraGuidelinesSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});
