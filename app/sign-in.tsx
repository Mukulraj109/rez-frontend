import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/onboarding/FormInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SignInScreen() {
  const router = useRouter();
  const { state, actions } = useAuth();
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
  });
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [errors, setErrors] = useState({
    phoneNumber: '',
    otp: '',
  });
  
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(false);

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Navigate to homepage on successful login
  useEffect(() => {
    console.log('[SignIn] Auth state changed:', { isAuthenticated: state.isAuthenticated, user: state.user?.id });
    if (state.isAuthenticated && state.user) {
      console.log('[SignIn] User authenticated, checking onboarding status...');
      if (state.user.isOnboarded) {
        console.log('[SignIn] User is onboarded, navigating to homepage...');
        router.replace('/(tabs)/');
      } else {
        console.log('[SignIn] User is not onboarded, continuing onboarding...');
        router.replace('/onboarding/location-permission');
      }
    }
  }, [state.isAuthenticated, state.user]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateOTP = (otp: string): boolean => {
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRequestOTP = async () => {
    if (!formData.phoneNumber.trim()) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number' }));
      return;
    }

    try {
      // Format phone number for backend - add +91 prefix
      const formattedPhone = `+91${formData.phoneNumber}`;

      await actions.sendOTP(formattedPhone);

      // Only proceed to next step if sendOTP was successful (no error thrown)
      setStep('otp');
      setOtpTimer(60); // 60 seconds timer
      setCanResendOTP(false);

      Alert.alert(
        'OTP Sent',
        `Verification code sent to +91${formData.phoneNumber}\n\nFor demo, use: 123456`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[SignIn] Send OTP failed:', error);

      // Get the error message
      const errorMessage = error?.message || state.error || 'Failed to send OTP. Please try again.';

      console.log('[SignIn] Error message to check:', errorMessage);

      // Check if it's a user not found error - be more specific with the detection
      if (errorMessage.toLowerCase().includes('user not found') ||
          errorMessage.toLowerCase().includes('user does not exist') ||
          errorMessage.toLowerCase().includes("user doesn't exist") ||
          errorMessage.toLowerCase().includes('please sign up')) {

        // Show error in the phone input field
        setErrors(prev => ({
          ...prev,
          phoneNumber: 'This phone number is not registered. Please sign up first.'
        }));

        // Also show Alert
        Alert.alert(
          'User Not Found',
          'This phone number is not registered. Please sign up first.',
          [
            { text: 'Sign Up', onPress: () => router.push('/onboarding/splash') },
            { text: 'Try Again', style: 'cancel' }
          ]
        );
      } else {
        // Show generic error in the phone input field
        setErrors(prev => ({
          ...prev,
          phoneNumber: errorMessage
        }));

        Alert.alert('Error', errorMessage);
      }

      // Clear errors to reset state
      actions.clearError();
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return;
    }

    if (!validateOTP(formData.otp)) {
      setErrors(prev => ({ ...prev, otp: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    try {
      // Format phone number for backend - add +91 prefix
      const formattedPhone = `+91${formData.phoneNumber}`;

      console.log('[SignIn] Verifying OTP:', { phone: formattedPhone, otp: formData.otp });
      await actions.login(formattedPhone, formData.otp);
      console.log('[SignIn] Login successful, isAuthenticated:', state.isAuthenticated);

      // Navigation handled by useEffect only if login was successful
    } catch (error: any) {
      console.error('[SignIn] Login error:', error);

      // Get the error message
      const errorMessage = error?.message || state.error || 'Invalid OTP. Please try again.';

      // Set the error to show in the OTP field
      setErrors(prev => ({
        ...prev,
        otp: errorMessage
      }));

      // Clear errors from context to reset state
      actions.clearError();

      // Don't navigate - stay on the OTP screen to let user try again
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) return;

    try {
      // Format phone number for backend - add +91 prefix
      const formattedPhone = `+91${formData.phoneNumber}`;

      await actions.sendOTP(formattedPhone);
      setOtpTimer(60);
      setCanResendOTP(false);
      Alert.alert('OTP Resent', 'New verification code sent to your phone');
    } catch (error: any) {
      console.error('[SignIn] Resend OTP failed:', error);
      const errorMessage = error?.message || state.error || 'Failed to resend OTP. Please try again.';
      Alert.alert('Error', errorMessage);
      actions.clearError();
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setFormData(prev => ({ ...prev, otp: '' }));
    setErrors(prev => ({ ...prev, otp: '' }));
    setOtpTimer(0);
    setCanResendOTP(false);
  };

  const handleGoToSignUp = () => {
    router.push('/onboarding/splash');
  };

  const renderPhoneStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.form}>
        <FormInput
          placeholder="Enter your mobile number"
          value={formData.phoneNumber}
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
          keyboardType="phone-pad"
          error={errors.phoneNumber}
          containerStyle={styles.inputContainer}
          prefix="+91"
          leftIcon={
            <Ionicons name="call-outline" size={20} color="#8B5CF6" />
          }
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            state.isLoading && styles.primaryButtonDisabled
          ]}
          onPress={handleRequestOTP}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <LoadingSpinner size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOTPStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToPhone}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a verification code to{'\n'}
          <Text style={styles.phoneNumber}>+91{formData.phoneNumber}</Text>
        </Text>
        <View style={styles.underline} />
      </View>

      <View style={styles.form}>
        <FormInput
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChangeText={(value) => handleInputChange('otp', value)}
          keyboardType="number-pad"
          maxLength={6}
          error={errors.otp}
          containerStyle={styles.inputContainer}
          leftIcon={
            <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" />
          }
        />

        <View style={styles.otpActions}>
          {otpTimer > 0 ? (
            <Text style={styles.timerText}>
              Resend OTP in {otpTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP} disabled={!canResendOTP}>
              <Text style={[
                styles.resendText,
                !canResendOTP && styles.resendTextDisabled
              ]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            state.isLoading && styles.primaryButtonDisabled
          ]}
          onPress={handleVerifyOTP}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <LoadingSpinner size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#8B5CF6', '#A855F7', '#C084FC']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {step === 'phone' ? renderPhoneStep() : renderOTPStep()}

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoToSignUp}
              >
                <Text style={styles.secondaryButtonText}>
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  stepContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  otpActions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#D1D5DB',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});