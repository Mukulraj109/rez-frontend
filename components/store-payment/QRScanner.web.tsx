/**
 * QR Scanner Component - Web
 *
 * Premium QR scanner UI for web with:
 * - Live camera feed with QR detection
 * - Dark themed camera-style background
 * - Promo banner showing rewards
 * - Animated scan frame
 * - Manual code entry fallback
 * - Security badges
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QRCodeData } from '@/types/storePayment.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = Math.min(SCREEN_WIDTH * 0.7, 280);

// ReZ Brand Colors
const REZ_COLORS = {
  primary: '#00C06A',
  primaryGlow: 'rgba(0, 192, 106, 0.5)',
  orange: '#F97316',
  navy: '#0B2240',
  background: '#18181B',
  surface: '#27272A',
  border: 'rgba(255, 255, 255, 0.1)',
};

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onClose: () => void;
  onManualEntry?: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasWebcam, setHasWebcam] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasScannedRef = useRef(false);

  // Check webcam availability and auto-start camera
  useEffect(() => {
    checkWebcamAndStart();

    // Animate scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      stopScanning();
    };
  }, []);

  const checkWebcamAndStart = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setShowManualEntry(true);
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((d) => d.kind === 'videoinput');
      setHasWebcam(hasCamera);

      if (hasCamera) {
        // Auto-start camera
        startScanning();
      } else {
        setShowManualEntry(true);
      }
    } catch {
      setHasWebcam(false);
      setShowManualEntry(true);
    }
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCANNER_SIZE - 4],
  });

  const opacity = scanLineAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  const startScanning = async () => {
    if (isScanning) return;

    try {
      setIsScanning(true);
      setError(null);
      hasScannedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().then(() => {
            setCameraReady(true);
            startQRDetection();
          }).catch((err) => {
            console.error('Video play error:', err);
            setError('Failed to start camera');
            setShowManualEntry(true);
          });
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please use manual entry.');
      setIsScanning(false);
      setShowManualEntry(true);
    }
  };

  const startQRDetection = () => {
    // Use BarcodeDetector if available (Chrome, Edge)
    if ('BarcodeDetector' in window) {
      console.log('🔍 BarcodeDetector available, starting QR detection');
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code'],
      });

      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && !hasScannedRef.current && videoRef.current.readyState === 4) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              console.log('📱 QR Code detected:', barcodes[0].rawValue);
              handleQRCodeDetected(barcodes[0].rawValue);
            }
          } catch (err) {
            // Ignore detection errors
          }
        }
      }, 200);
    } else {
      // Fallback: Show message that QR scanning not supported
      console.log('⚠️ BarcodeDetector NOT available in this browser, please use manual entry');
      setError('QR scanning not supported in this browser. Please enter code manually.');
      setShowManualEntry(true);
      // Keep camera running but show manual entry option prominently
    }
  };

  const handleQRCodeDetected = (data: string) => {
    console.log('🎯 handleQRCodeDetected called with:', data);

    if (hasScannedRef.current) {
      console.log('⏭️ Already scanned, skipping');
      return;
    }
    hasScannedRef.current = true;

    try {
      // Try parsing as JSON first
      console.log('🔄 Trying to parse as JSON...');
      const qrData: QRCodeData = JSON.parse(data);
      console.log('✅ Parsed JSON:', qrData);
      if (qrData.type === 'REZ_STORE_PAYMENT' && qrData.code) {
        console.log('✅ Valid REZ QR code, calling onScan with:', qrData.code);
        stopScanning();
        onScan(qrData.code);
        return;
      }
    } catch (e) {
      console.log('⚠️ Not JSON, trying as plain text');
    }

    // Try as plain text
    if (data.startsWith('REZ-STORE-') || data.length >= 6) {
      console.log('✅ Valid plain text code, calling onScan with:', data);
      stopScanning();
      onScan(data);
    } else {
      console.log('❌ Invalid QR code format');
      hasScannedRef.current = false;
      setError('Invalid QR code. Please scan a ReZ store QR.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setCameraReady(false);
  };

  const validateAndSubmit = () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a store code');
      return;
    }

    try {
      const qrData: QRCodeData = JSON.parse(code);
      if (qrData.type === 'REZ_STORE_PAYMENT' && qrData.code) {
        stopScanning();
        onScan(qrData.code);
        return;
      }
    } catch {}

    if (code.startsWith('REZ-STORE-') || code.length >= 6) {
      stopScanning();
      onScan(code);
    } else {
      setError('Invalid store code format');
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', REZ_COLORS.background, REZ_COLORS.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan & Pay</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setShowManualEntry(!showManualEntry)}
        >
          <Ionicons name={showManualEntry ? "camera" : "keypad"} size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <View style={styles.promoPill}>
          <View style={styles.promoIcon}>
            <Text style={styles.promoIconText}>R</Text>
          </View>
          <Text style={styles.promoText}>5% ReZ Coins on every payment</Text>
        </View>
        <Text style={styles.promoSubtext}>On payments of ₹25 and above</Text>
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          {/* Video Element for Camera */}
          {isScanning && Platform.OS === 'web' && (
            <video
              ref={videoRef as any}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 24,
                transform: 'scaleX(-1)', // Mirror for front camera
              }}
              playsInline
              muted
              autoPlay
            />
          )}

          {/* Corner Markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Animated Scan Line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY }], opacity },
            ]}
          />

          {/* Center Content when not scanning */}
          {!cameraReady && (
            <View style={styles.frameContent}>
              {isScanning ? (
                <>
                  <ActivityIndicator size="large" color={REZ_COLORS.primary} />
                  <Text style={styles.scanningText}>Starting camera...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="qr-code" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.frameHint}>
                    {hasWebcam ? 'Tap to start camera' : 'Enter code below'}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Scanning indicator */}
        {cameraReady && (
          <Text style={styles.scanHint}>Point camera at QR code</Text>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Manual Entry Section */}
      {(showManualEntry || !hasWebcam) && (
        <View style={styles.entrySection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter store code (e.g., REZ-STORE-ABC123)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={manualCode}
              onChangeText={(t) => {
                setManualCode(t.toUpperCase());
                setError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={validateAndSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !manualCode && styles.submitBtnDisabled]}
            onPress={validateAndSubmit}
            disabled={!manualCode}
          >
            <Text style={styles.submitBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Camera Controls when scanning */}
      {isScanning && cameraReady && !showManualEntry && (
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowManualEntry(true)}>
            <Ionicons name="keypad" size={24} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>Enter Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Start Camera Button when not scanning */}
      {!isScanning && hasWebcam && !showManualEntry && (
        <View style={styles.startCameraSection}>
          <TouchableOpacity style={styles.startCameraBtn} onPress={startScanning}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.startCameraBtnText}>Start Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>Pay securely at any ReZ store</Text>
          <View style={styles.infoDivider} />
          <View style={styles.infoIcons}>
            <View style={[styles.paymentIcon, { backgroundColor: REZ_COLORS.primary }]}>
              <Text style={styles.paymentIconText}>R</Text>
            </View>
            <Text style={styles.infoSubtext}>ReZ Pay</Text>
          </View>
        </View>

        <View style={styles.securityRow}>
          <View style={styles.rezLogo}>
            <Text style={styles.rezLogoText}>ReZ</Text>
          </View>

          <View style={styles.securityBadges}>
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={14} color={REZ_COLORS.primary} />
              <View>
                <Text style={styles.badgeTitle}>PCI DSS</Text>
                <Text style={styles.badgeSubtitle}>COMPLIANT</Text>
              </View>
            </View>
            <View style={styles.securityBadge}>
              <Ionicons name="lock-closed" size={14} color={REZ_COLORS.primary} />
              <View>
                <Text style={styles.badgeTitle}>256-BIT</Text>
                <Text style={styles.badgeSubtitle}>ENCRYPTED</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: REZ_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoBanner: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  promoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: REZ_COLORS.border,
    gap: 10,
  },
  promoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: REZ_COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  promoSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 6,
  },
  scannerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scannerFrame: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: REZ_COLORS.primary,
    borderWidth: 4,
    zIndex: 10,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: REZ_COLORS.primary,
    borderRadius: 2,
    zIndex: 10,
    shadowColor: REZ_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  frameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  frameHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
  scanningText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 12,
  },
  scanHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  entrySection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: REZ_COLORS.surface,
    borderWidth: 1,
    borderColor: REZ_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: REZ_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startCameraSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  startCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REZ_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  startCameraBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: REZ_COLORS.border,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  infoDivider: {
    width: 1,
    height: 14,
    backgroundColor: REZ_COLORS.border,
  },
  infoIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rezLogo: {
    backgroundColor: REZ_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rezLogoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  securityBadges: {
    flexDirection: 'row',
    gap: 14,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgeSubtitle: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },
});
