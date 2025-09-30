import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps
} from 'react-native';

// Import CSS for web-specific styling
if (typeof window !== 'undefined') {
  require('./FormInput.css');
}

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  leftIcon?: React.ReactNode;
  prefix?: string;
}

export default function FormInput({
  label,
  error,
  containerStyle,
  style,
  leftIcon,
  prefix,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            (leftIcon || prefix) && styles.inputWithIcon,
            style
          ]}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 48,
    transition: 'all 0.2s ease-in-out',
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    paddingLeft: 16,
    paddingRight: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: 'transparent',
    borderWidth: 0,
    outline: 'none', // Remove browser focus outline
    // Web-specific styles to override browser defaults
    ...(typeof window !== 'undefined' ? {
      boxShadow: 'none !important',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      WebkitBoxShadow: 'none !important',
      MozBoxShadow: 'none !important',
      WebkitTextFillColor: '#374151 !important',
      WebkitBackgroundClip: 'text !important',
    } : {}),
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  inputFocused: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});