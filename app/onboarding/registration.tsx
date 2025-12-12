import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '@/components/onboarding/FormInput';
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

export default function RegistrationScreen() {
  const router = useRouter();
  const { state, actions } = useAuth();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    referralCode: '',
  });

  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: '',
  });

  const [showExistingUserMessage, setShowExistingUserMessage] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      phoneNumber: '',
      email: '',
    };

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Indian phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !newErrors.phoneNumber && !newErrors.email;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formattedPhone = `+91${formData.phoneNumber}`;
      await actions.sendOTP(formattedPhone, formData.email, formData.referralCode || undefined);

      router.push({
        pathname: '/onboarding/otp-verification',
        params: { phoneNumber: formattedPhone }
      });
    } catch (error: any) {
      console.error('[Registration] Send OTP failed:', error);
      const errorMessage = error?.message || state.error || 'Failed to send OTP. Please try again.';

      if (errorMessage.toLowerCase().includes('already') &&
          (errorMessage.toLowerCase().includes('registered') ||
           errorMessage.toLowerCase().includes('exists'))) {
        setShowExistingUserMessage(true);
      } else {
        Alert.alert('Error', errorMessage);
      }
      actions.clearError();
    }
  };

  const handleGoToSignIn = () => {
    router.push('/sign-in');
  };

  const handleTryAgain = () => {
    setShowExistingUserMessage(false);
    setFormData({ phoneNumber: '', email: '', referralCode: '' });
    setErrors({ phoneNumber: '', email: '' });
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
        {showExistingUserMessage ? (
          // Existing User Message
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
              style={styles.glassShine}
            />

            <View style={styles.existingUserContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.deepTeal]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="person-circle" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <Text style={styles.existingUserTitle}>Account Already Exists</Text>
              <Text style={styles.existingUserMessage}>
                This phone number is already registered.{'\n'}
                Please use Sign In to access your account.
              </Text>

              <TouchableOpacity
                style={styles.primaryButtonWrapper}
                onPress={handleGoToSignIn}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.deepTeal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Go to Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleTryAgain}>
                <Text style={styles.secondaryButtonText}>Try Different Number</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Registration Form
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
              style={styles.glassShine}
            />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>Step 1 of 3</Text>
              </View>

              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Enter your details to get started</Text>

              <View style={styles.underlineContainer}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
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
                leftIcon={<Ionicons name="call-outline" size={20} color={COLORS.primary} />}
              />

              <FormInput
                placeholder="Email Id"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                containerStyle={styles.inputContainer}
                leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.primary} />}
              />

              <FormInput
                placeholder="Referral code (Optional)"
                value={formData.referralCode}
                onChangeText={(value) => handleInputChange('referralCode', value)}
                autoCapitalize="characters"
                containerStyle={styles.inputContainer}
                leftIcon={<Ionicons name="gift-outline" size={20} color={COLORS.gold} />}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.primaryButtonWrapper}
              onPress={handleSubmit}
              disabled={state.isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={state.isLoading ? ['#D1D5DB', '#D1D5DB'] : [COLORS.primary, COLORS.deepTeal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {state.isLoading ? 'Submitting...' : 'Continue'}
                </Text>
                {!state.isLoading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity style={styles.signInLink} onPress={handleGoToSignIn}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
                <Text style={styles.signInHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 16,
  },
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },

  // Form
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },

  // Buttons
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
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  signInLink: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  signInHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Existing User
  existingUserContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingUserTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  existingUserMessage: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
});
