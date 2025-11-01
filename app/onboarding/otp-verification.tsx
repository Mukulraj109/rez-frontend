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
import * as Location from 'expo-location';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { state, actions } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Start countdown timer
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

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
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

      // DEV MODE: Accept any 6-digit code for testing

      // For development: any 6-digit code works
      if (otpString.length === 6 && /^\d{6}$/.test(otpString)) {
        await actions.verifyOTP(phoneNumber, otpString);
      } else {
        Alert.alert('Error', 'Please enter a valid 6-digit code');
        return;
      }

      // TODO: FOR PRODUCTION - Use actual OTP verification:
      // await actions.verifyOTP(phoneNumber, otpString);

      // Add a small delay to ensure user state is properly updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Handle location permission based on platform

      if (Platform.OS === 'web') {
        // Web platform: Skip location permission for now, go directly based on onboarding status

        if (state.user?.isOnboarded) {

          router.replace('/(tabs)');
        } else {

          router.push('/onboarding/loading');
        }
      } else {
        // Mobile platform: Check location permission

        try {
          // Check location permission status
          const { status } = await Location.getForegroundPermissionsAsync();

          if (status === 'granted') {
            // Location is already granted
            if (state.user?.isOnboarded) {

              router.replace('/(tabs)');
            } else {

              router.push('/onboarding/loading');
            }
          } else {
            // Location permission needed

            router.push('/onboarding/location-permission');
          }
        } catch (locationError) {
          console.error('[OTP Verification] Error checking location permission:', locationError);
          // If location check fails, redirect to location permission screen

          router.push('/onboarding/location-permission');
        }
      }
    } catch (error: any) {
      console.error('[OTP Verification] OTP verification failed:', error);

      // Get error message
      const errorMessage = error?.message || state.error || 'Invalid OTP. Please check and try again.';

      Alert.alert('Invalid OTP', errorMessage);

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      actions.clearError();

      // Don't navigate - stay on OTP screen for retry
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phoneNumber) return;

    try {
      // phoneNumber already includes +91 prefix from registration
      await actions.sendOTP(phoneNumber);

      // Reset timer
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
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Please enter your{'\n'}otp</Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn&apos;t receive the code?{' '}
            <TouchableOpacity 
              onPress={handleResendOTP} 
              disabled={!canResend || state.isLoading}
            >
              <Text style={[
                styles.resendButton,
                (!canResend || state.isLoading) && styles.resendButtonDisabled
              ]}>
                {canResend ? 'Resend' : `Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            state.isLoading && styles.submitButtonDisabled
          ]}
          onPress={() => handleSubmit()}
          disabled={state.isLoading || !otp.every(digit => digit.length === 1)}
        >
          <Text style={styles.submitButtonText}>
            {state.isLoading ? 'Verifying...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 32,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 40,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendButton: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#9CA3AF',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});