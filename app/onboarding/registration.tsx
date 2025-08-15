import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import FormInput from '@/components/onboarding/FormInput';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function RegistrationScreen() {
  const router = useRouter();
  const { state, updateUserData, validatePhoneNumber, validateEmail, setLoading, setError } = useOnboarding();
  
  const [formData, setFormData] = useState({
    phoneNumber: state.userData.phoneNumber || '',
    email: state.userData.email || '',
    referralCode: state.userData.referralCode || '',
  });
  
  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: '',
  });

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
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !newErrors.phoneNumber && !newErrors.email;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user data
      updateUserData(formData);
      
      // Navigate to OTP verification
      router.push('/onboarding/otp-verification');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
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
});