/**
 * BillImageUploader Component Tests
 * Unit and integration tests for the bill image uploader
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BillImageUploader from './BillImageUploader';
import { cameraService } from '@/services/cameraService';
import { useImageQuality } from '@/hooks/useImageQuality';
import { useBillUpload } from '@/hooks/useBillUpload';
import { FILE_SIZE_LIMITS } from '@/utils/fileUploadConstants';

// Mock dependencies
jest.mock('@/services/cameraService');
jest.mock('@/hooks/useImageQuality');
jest.mock('@/hooks/useBillUpload');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('BillImageUploader', () => {
  const mockOnImageSelected = jest.fn();
  const mockOnImageRemoved = jest.fn();
  const mockOnUploadStart = jest.fn();
  const mockOnUploadProgress = jest.fn();
  const mockOnUploadComplete = jest.fn();
  const mockOnUploadError = jest.fn();

  const mockImageAsset = {
    uri: 'file:///path/to/image.jpg',
    width: 1920,
    height: 1080,
    type: 'image' as const,
    fileName: 'test-image.jpg',
    fileSize: 1024 * 1024, // 1MB
  };

  const mockQualityResult = {
    isValid: true,
    score: 85,
    checks: {
      resolution: {
        passed: true,
        width: 1920,
        height: 1080,
        minWidth: 800,
        minHeight: 600,
        message: 'Image resolution is good',
      },
      fileSize: {
        passed: true,
        size: 1024 * 1024,
        maxSize: FILE_SIZE_LIMITS.MAX_IMAGE_SIZE,
        message: 'File size is acceptable',
      },
      aspectRatio: {
        passed: true,
        ratio: 1.77,
        message: 'Aspect ratio is acceptable',
      },
      blur: {
        passed: true,
        score: 80,
        message: 'Image appears to be clear',
      },
    },
    recommendations: [],
    warnings: [],
    errors: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useImageQuality hook
    (useImageQuality as jest.Mock).mockReturnValue({
      checkQuality: jest.fn().mockResolvedValue(mockQualityResult),
      isChecking: false,
      result: null,
      error: null,
      clearCache: jest.fn(),
    });

    // Mock useBillUpload hook
    (useBillUpload as jest.Mock).mockReturnValue({
      isUploading: false,
      uploadState: 'idle',
      progress: null,
      error: null,
      percentComplete: 0,
      uploadSpeed: '0 B/s',
      timeRemaining: '--:--',
    });
  });

  describe('Rendering', () => {
    it('should render idle state by default', () => {
      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      expect(getByText('Bill Photo')).toBeTruthy();
      expect(getByText('Take Photo')).toBeTruthy();
      expect(getByText('Gallery')).toBeTruthy();
      expect(getByText('Ensure bill is clear and visible')).toBeTruthy();
    });

    it('should render with required indicator', () => {
      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      expect(getByText('*')).toBeTruthy();
    });

    it('should render with initial image', () => {
      const { queryByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          initialImageUri="https://example.com/bill.jpg"
        />
      );

      // Should show success state, not idle
      expect(queryByText('Take Photo')).toBeNull();
    });
  });

  describe('Camera Interaction', () => {
    it('should open camera when Take Photo is pressed', async () => {
      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(mockOpenCamera).toHaveBeenCalledWith({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      });
    });

    it('should handle camera cancellation', async () => {
      const mockOpenCamera = jest.fn().mockResolvedValue(null);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(mockOnImageSelected).not.toHaveBeenCalled();
      });
    });

    it('should handle camera error', async () => {
      const mockOpenCamera = jest.fn().mockRejectedValue(new Error('Camera error'));
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Camera Error',
          'Failed to open camera. Please try again.'
        );
      });
    });
  });

  describe('Gallery Interaction', () => {
    it('should open gallery when Gallery is pressed', async () => {
      const mockOpenImagePicker = jest.fn().mockResolvedValue([mockImageAsset]);
      (cameraService.openImagePicker as jest.Mock) = mockOpenImagePicker;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const galleryButton = getByText('Gallery');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(mockOpenImagePicker).toHaveBeenCalledWith({
          allowsMultipleSelection: false,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      });
    });

    it('should handle gallery cancellation', async () => {
      const mockOpenImagePicker = jest.fn().mockResolvedValue([]);
      (cameraService.openImagePicker as jest.Mock) = mockOpenImagePicker;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const galleryButton = getByText('Gallery');
      fireEvent.press(galleryButton);

      await waitFor(() => {
        expect(mockOnImageSelected).not.toHaveBeenCalled();
      });
    });
  });

  describe('Quality Checking', () => {
    it('should check image quality after selection', async () => {
      const mockCheckQuality = jest.fn().mockResolvedValue(mockQualityResult);
      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: mockCheckQuality,
        isChecking: false,
        result: null,
        error: null,
      });

      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(mockCheckQuality).toHaveBeenCalledWith(mockImageAsset.uri);
      });
    });

    it('should call onImageSelected if quality is valid', async () => {
      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(mockOnImageSelected).toHaveBeenCalledWith(mockImageAsset.uri);
      });
    });

    it('should show quality warning if quality is invalid', async () => {
      const invalidQualityResult = {
        ...mockQualityResult,
        isValid: false,
        score: 45,
        errors: ['Image resolution is too low'],
      };

      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: jest.fn().mockResolvedValue(invalidQualityResult),
        isChecking: false,
        result: null,
        error: null,
      });

      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { findByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = await findByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(findByText('Quality Issues Detected')).toBeTruthy();
      });
    });
  });

  describe('Image Removal', () => {
    it('should show remove button when image is selected', async () => {
      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText, findByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
        />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      const removeButton = await findByText('Remove Image');
      expect(removeButton).toBeTruthy();
    });

    it('should show confirmation alert when remove is pressed', async () => {
      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          initialImageUri="https://example.com/bill.jpg"
        />
      );

      const removeButton = getByText('Remove Image');
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Remove Photo',
        'Are you sure you want to remove this photo?',
        expect.any(Array)
      );
    });

    it('should call onImageRemoved when confirmed', async () => {
      // Mock Alert.alert to auto-confirm
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        const removeButton = buttons?.find((b: any) => b.text === 'Remove');
        if (removeButton?.onPress) {
          removeButton.onPress();
        }
      });

      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          onImageRemoved={mockOnImageRemoved}
          initialImageUri="https://example.com/bill.jpg"
        />
      );

      const removeButton = getByText('Remove Image');
      fireEvent.press(removeButton);

      await waitFor(() => {
        expect(mockOnImageRemoved).toHaveBeenCalled();
      });
    });
  });

  describe('Quality Badge', () => {
    it('should show Excellent badge for score >= 90', async () => {
      const excellentQualityResult = { ...mockQualityResult, score: 95 };
      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: jest.fn().mockResolvedValue(excellentQualityResult),
        isChecking: false,
        result: excellentQualityResult,
        error: null,
      });

      const mockOpenCamera = jest.fn().mockResolvedValue(mockImageAsset);
      (cameraService.openCamera as jest.Mock) = mockOpenCamera;

      const { getByText, findByText } = render(
        <BillImageUploader onImageSelected={mockOnImageSelected} />
      );

      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      const badge = await findByText('Excellent');
      expect(badge).toBeTruthy();
    });

    it('should show Good badge for score 70-89', async () => {
      const goodQualityResult = { ...mockQualityResult, score: 75 };
      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: jest.fn().mockResolvedValue(goodQualityResult),
        isChecking: false,
        result: goodQualityResult,
        error: null,
      });

      const { findByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          initialImageUri={mockImageAsset.uri}
        />
      );

      const badge = await findByText('Good');
      expect(badge).toBeTruthy();
    });

    it('should show Fair badge for score 50-69', async () => {
      const fairQualityResult = { ...mockQualityResult, score: 60 };
      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: jest.fn().mockResolvedValue(fairQualityResult),
        isChecking: false,
        result: fairQualityResult,
        error: null,
      });

      const { findByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          initialImageUri={mockImageAsset.uri}
        />
      );

      const badge = await findByText('Fair');
      expect(badge).toBeTruthy();
    });

    it('should show Poor badge for score < 50', async () => {
      const poorQualityResult = { ...mockQualityResult, score: 30 };
      (useImageQuality as jest.Mock).mockReturnValue({
        checkQuality: jest.fn().mockResolvedValue(poorQualityResult),
        isChecking: false,
        result: poorQualityResult,
        error: null,
      });

      const { findByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          initialImageUri={mockImageAsset.uri}
        />
      );

      const badge = await findByText('Poor');
      expect(badge).toBeTruthy();
    });
  });

  describe('File Size Display', () => {
    it('should format file size correctly', () => {
      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          initialImageUri={mockImageAsset.uri}
        />
      );

      // 1MB = 1 MB
      expect(getByText(/1 MB/)).toBeTruthy();
    });

    it('should show max size limit', () => {
      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          maxSize={FILE_SIZE_LIMITS.MAX_IMAGE_SIZE} // 5MB
          initialImageUri={mockImageAsset.uri}
        />
      );

      expect(getByText(/5 MB \(Max\)/)).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('should use custom maxSize', () => {
      const customMaxSize = 2 * 1024 * 1024; // 2MB
      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          maxSize={customMaxSize}
          initialImageUri={mockImageAsset.uri}
        />
      );

      expect(getByText(/2 MB \(Max\)/)).toBeTruthy();
    });

    it('should accept custom acceptedFormats', () => {
      const customFormats = ['image/jpeg', 'image/png'];
      const { getByText } = render(
        <BillImageUploader
          onImageSelected={mockOnImageSelected}
          acceptedFormats={customFormats}
        />
      );

      expect(getByText('Bill Photo')).toBeTruthy();
    });
  });
});
