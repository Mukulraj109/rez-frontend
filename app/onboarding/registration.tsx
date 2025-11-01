import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import FormInput from '@/components/onboarding/FormInput';
import { useAuth } from '@/contexts/AuthContext';

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
    
    // Clear error when user starts typing
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
    if (!validateForm()) {
      return;
    }

    try {
      // Format phone number for backend - add +91 prefix
      const formattedPhone = `+91${formData.phoneNumber}`;

      // Send OTP to phone number with email and referral code
      await actions.sendOTP(formattedPhone, formData.email, formData.referralCode || undefined);

      // Only navigate if OTP was sent successfully (no error thrown)
      router.push({
        pathname: '/onboarding/otp-verification',
        params: { phoneNumber: formattedPhone }
      });
    } catch (error: any) {
      console.error('[Registration] Send OTP failed:', error);

      // Get the error message
      const errorMessage = error?.message || state.error || 'Failed to send OTP. Please try again.';

      // Check if it's an existing user error
      if (errorMessage.toLowerCase().includes('already') &&
          (errorMessage.toLowerCase().includes('registered') ||
           errorMessage.toLowerCase().includes('exists'))) {
        setShowExistingUserMessage(true);
      } else {
        Alert.alert('Error', errorMessage);
      }

      // Clear errors to reset state
      actions.clearError();
    }
  };

  const handleGoToSignIn = () => {
    router.push('/sign-in');
  };

  const handleTryAgain = () => {
    setShowExistingUserMessage(false);
    setFormData({
      phoneNumber: '',
      email: '',
      referralCode: '',
    });
    setErrors({
      phoneNumber: '',
      email: '',
    });
  };

  return (
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        {showExistingUserMessage ? (
          // Existing User Message
          <View style={styles.existingUserContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={80} color="#8B5CF6" />
            </View>
            <Text style={styles.existingUserTitle}>Account Already Exists</Text>
            <Text style={styles.existingUserMessage}>
              This phone number is already registered.{'\n'}
              Please use Sign In to access your account.
            </Text>
            
            <TouchableOpacity style={styles.signInButton} onPress={handleGoToSignIn}>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.tryAgainButton} onPress={handleTryAgain}>
              <Text style={styles.tryAgainText}>Try Different Number</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Normal Registration Form
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Please enter your{'\n'}mobile number</Text>
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
              />

              <FormInput
                placeholder="Email Id"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                containerStyle={styles.inputContainer}
              />

              <FormInput
                placeholder="Referral code (Optional)"
                value={formData.referralCode}
                onChangeText={(value) => handleInputChange('referralCode', value)}
                autoCapitalize="characters"
                containerStyle={styles.inputContainer}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                state.isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={state.isLoading}
            >
              <Text style={styles.submitButtonText}>
                {state.isLoading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.alreadyHaveAccountButton} onPress={handleGoToSignIn}>
              <Text style={styles.alreadyHaveAccountText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </>
        )}
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
  form: {
    flex: 1,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  alreadyHaveAccountButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alreadyHaveAccountText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  // Existing User Message Styles
  existingUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  existingUserTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  existingUserMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 200,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  tryAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tryAgainText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});