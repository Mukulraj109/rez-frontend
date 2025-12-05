import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { state, actions } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit.length === 1)) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpValue?: string) => {
    const otpString = otpValue || otp.join('');

    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    try {
      if (otpString.length === 6 && /^\d{6}$/.test(otpString)) {
        await actions.verifyOTP(phoneNumber, otpString);
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit code');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (Platform.OS === 'web') {
        if (state.user?.isOnboarded) {
          router.replace('/(tabs)');
        } else {
          router.push('/onboarding/loading');
        }
      } else {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();

          if (status === 'granted') {
            if (state.user?.isOnboarded) {
              router.replace('/(tabs)');
            } else {
              router.push('/onboarding/loading');
            }
          } else {
            router.push('/onboarding/location-permission');
          }
        } catch (locationError) {
          console.error('[OTP Verification] Error checking location permission:', locationError);
          router.push('/onboarding/location-permission');
        }
      }
    } catch (error: any) {
      console.error('[OTP Verification] OTP verification failed:', error);
      const errorMessage = error?.message || state.error || 'Invalid OTP. Please check and try again.';
      Alert.alert('Invalid OTP', errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      actions.clearError();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phoneNumber) return;

    try {
      await actions.sendOTP(phoneNumber);
      setTimer(30);
      setCanResend(false);
      Alert.alert('Success', 'OTP has been resent to your phone number');
    } catch (error: any) {
      console.error('[OTP Verification] Resend OTP failed:', error);
      const errorMessage = error?.message || state.error || 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
      actions.clearError();
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.surface, '#EDF2F7', COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circleGreen]} />
        <View style={[styles.circle, styles.circleGold]} />
      </View>

      <View style={styles.content}>
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.glassShine}
          />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step 2 of 3</Text>
            </View>

            {/* Shield Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.deepTeal]}
                style={styles.iconGradient}
              >
                <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </Text>

            <View style={styles.underlineContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />
            </View>
          </View>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.otpInputWrapper,
                  focusedIndex === index && styles.otpInputWrapperFocused,
                  digit && styles.otpInputWrapperFilled,
                ]}
              >
                <TextInput
                  ref={ref => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  accessibilityLabel={`OTP digit ${index + 1} of 6`}
                />
              </View>
            ))}
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <View style={styles.timerPill}>
                <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResend || state.isLoading}
                style={styles.resendButton}
              >
                <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={() => handleSubmit()}
            disabled={state.isLoading || !otp.every(digit => digit.length === 1)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                state.isLoading || !otp.every(digit => digit.length === 1)
                  ? ['#D1D5DB', '#D1D5DB']
                  : [COLORS.primary, COLORS.deepTeal]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {state.isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Text>
              {!state.isLoading && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Decorative
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGreen: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  circleGold: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(30px)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  stepBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  iconContainer: {
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  phoneText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },

  // OTP Inputs
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  otpInputWrapper: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  otpInputWrapperFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputWrapperFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 192, 106, 0.05)',
  },
  otpInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  otpInputFilled: {
    color: COLORS.primary,
  },

  // Resend
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(154, 167, 178, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
