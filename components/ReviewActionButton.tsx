import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface ReviewActionButtonProps {
  onPress ? : () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ReviewActionButton: React.FC<ReviewActionButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#D1D5DB', '#9CA3AF'] : ['#7C3AED', '#8B5CF6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <Ionicons
            name="star"
            size={20}
            color={disabled ? '#6B7280' : '#FFFFFF'}
            style={styles.icon}
          />
          <ThemedText style={[styles.text, disabled && styles.disabledText]}>
            {loading ? 'Loading...' : 'Write a review & earn'}
          </ThemedText>
          <Ionicons
            name="gift-outline"
            size={18}
            color={disabled ? '#6B7280' : '#FFFFFF'}
            style={styles.giftIcon}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 16,
  },
  disabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.3,
  },
  disabledText: {
    color: '#6B7280',
  },
  giftIcon: {
    marginLeft: 4,
  },
});

export default ReviewActionButton;