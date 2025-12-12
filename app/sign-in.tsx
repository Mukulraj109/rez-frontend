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
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import FormInput from '@/components/onboarding/FormInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ReZ Design System Colors from TASK.md
const COLORS = {
  // Primary
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',

  // Gold (rewards & premium)
  gold: '#FFC857',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  goldGlow: 'rgba(255, 200, 87, 0.3)',

  // Text
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',

  // Glass
  glassWhite: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassHighlight: 'rgba(255, 255, 255, 0.6)',
};

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
    let interval: ReturnType<typeof setInterval>;
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
    if (state.isAuthenticated && state.user) {
      if (state.user.isOnboarded) {
        router.replace('/(tabs)/' as any);
      } else {
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
      const formattedPhone = `+91${formData.phoneNumber}`;
      await actions.sendOTP(formattedPhone);
      setStep('otp');
      setOtpTimer(60);
      setCanResendOTP(false);

      Alert.alert(
        'OTP Sent',
        `Verification code sent to +91${formData.phoneNumber}\n\nFor demo, use: 123456`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('[SignIn] Send OTP failed:', error);
      const errorMessage = error?.message || state.error || 'Failed to send OTP. Please try again.';

      if (errorMessage.toLowerCase().includes('user not found') ||
          errorMessage.toLowerCase().includes('user does not exist') ||
          errorMessage.toLowerCase().includes("user doesn't exist") ||
          errorMessage.toLowerCase().includes('please sign up')) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: 'This phone number is not registered. Please sign up first.'
        }));

        Alert.alert(
          'User Not Found',
          'This phone number is not registered. Please sign up first.',
          [
            { text: 'Sign Up', onPress: () => router.push('/onboarding/splash') },
            { text: 'Try Again', style: 'cancel' }
          ]
        );
      } else {
        setErrors(prev => ({
          ...prev,
          phoneNumber: errorMessage
        }));
        Alert.alert('Error', errorMessage);
      }
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
      const formattedPhone = `+91${formData.phoneNumber}`;
      await actions.login(formattedPhone, formData.otp);
    } catch (error: any) {
      console.error('[SignIn] Login error:', error);
      const errorMessage = error?.message || state.error || 'Invalid OTP. Please try again.';
      setErrors(prev => ({
        ...prev,
        otp: errorMessage
      }));
      actions.clearError();
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) return;

    try {
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
      {/* Glass Card */}
      <View style={styles.glassCard}>
        {/* Glass Shine Effect */}
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassShine}
        />

        {/* Header */}
        <View style={styles.header}>
          {/* Coin Icon */}
          <View style={styles.coinIconContainer}>
            <Image
              source={require('@/assets/images/rez-coin.png')}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Gold Underline */}
          <View style={styles.underlineContainer}>
            <LinearGradient
              colors={[COLORS.gold, '#FF9F1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.underline}
            />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            placeholder="Mobile number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            containerStyle={styles.inputContainer}
            prefix="+91"
            leftIcon={
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            }
          />

          {/* Primary Button with Gradient */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={handleRequestOTP}
            disabled={state.isLoading}
            activeOpacity={0.9}
            accessibilityLabel={state.isLoading ? "Sending OTP" : "Send OTP to phone number"}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={state.isLoading ? ['#D1D5DB', '#D1D5DB'] : [COLORS.primary, COLORS.deepTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              {state.isLoading ? (
                <LoadingSpinner size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOTPStep = () => (
    <View style={styles.stepContainer}>
      {/* Glass Card */}
      <View style={styles.glassCard}>
        {/* Glass Shine Effect */}
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassShine}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToPhone}
            accessibilityLabel="Go back to phone number entry"
            accessibilityRole="button"
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          {/* Shield Icon */}
          <View style={styles.shieldIconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.deepTeal]}
              style={styles.shieldIcon}
            >
              <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{'\n'}
            <Text style={styles.phoneNumber}>+91 {formData.phoneNumber}</Text>
          </Text>

          {/* Gold Underline */}
          <View style={styles.underlineContainer}>
            <LinearGradient
              colors={[COLORS.gold, '#FF9F1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.underline}
            />
          </View>
        </View>

        {/* Form */}
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
              <Ionicons name="keypad-outline" size={20} color={COLORS.primary} />
            }
          />

          <View style={styles.otpActions}>
            {otpTimer > 0 ? (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.timerText}>Resend OTP in {otpTimer}s</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResendOTP}
                style={styles.resendButton}
              >
                <Text style={[
                  styles.resendText,
                  !canResendOTP && styles.resendTextDisabled
                ]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Primary Button with Gradient */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={handleVerifyOTP}
            disabled={state.isLoading}
            activeOpacity={0.9}
            accessibilityLabel={state.isLoading ? "Verifying OTP" : "Verify OTP and sign in"}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={state.isLoading ? ['#D1D5DB', '#D1D5DB'] : [COLORS.primary, COLORS.deepTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              {state.isLoading ? (
                <LoadingSpinner size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero Gradient Background - Green to Gold */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, COLORS.deepTeal]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Floating Circles */}
      <View style={styles.decorativeCircles}>
        {/* Large Gold Circle - Top Right */}
        <View style={[styles.circle, styles.circleGoldLarge]} />
        {/* Medium Green Circle - Bottom Left */}
        <View style={[styles.circle, styles.circleGreenMedium]} />
        {/* Small Gold Circle - Top Left */}
        <View style={[styles.circle, styles.circleGoldSmall]} />
        {/* Tiny Green Circle - Bottom Right */}
        <View style={[styles.circle, styles.circleGreenTiny]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {step === 'phone' ? renderPhoneStep() : renderOTPStep()}

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGoToSignUp}
                accessibilityLabel="Don't have an account? Sign up"
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>
                  Don't have an account?{' '}
                  <Text style={styles.signUpText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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

  // Decorative Circles
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGoldLarge: {
    width: 300,
    height: 300,
    top: -80,
    right: -100,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
  },
  circleGreenMedium: {
    width: 200,
    height: 200,
    bottom: 50,
    left: -80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleGoldSmall: {
    width: 100,
    height: 100,
    top: 150,
    left: 20,
    backgroundColor: 'rgba(255, 200, 87, 0.12)',
  },
  circleGreenTiny: {
    width: 60,
    height: 60,
    bottom: 200,
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Step Container
  stepContainer: {
    marginVertical: 20,
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 32,
    overflow: 'hidden',
    // Glass border
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    // Glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 20,
    // Web blur effect
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  // Coin Icon
  coinIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  coinImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  // Shield Icon (OTP step)
  shieldIconContainer: {
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  shieldIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: -8,
    left: -8,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },

  // Typography
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  phoneNumber: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 16,
  },

  // Gold Underline
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },

  // Form
  form: {
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },

  // OTP Actions
  otpActions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContainer: {
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  resendTextDisabled: {
    color: '#D1D5DB',
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
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
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  signUpText: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});
