import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CartHeaderProps } from '@/types/cart';

export default function CartHeader({ onBack, title = 'Cart' }: CartHeaderProps) {
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const statusBarHeight =
    Platform.OS === 'ios'
      ? height > 800
        ? 44
        : 20
      : StatusBar.currentHeight || 24;

  return (
    <LinearGradient
      colors={['#8B5CF6', '#6D28D9']}
      style={[styles.container, { paddingTop: statusBarHeight + 10 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.85}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <ThemedText
          style={[
            styles.title,
            { fontSize: isSmallScreen ? 18 : 20 },
          ]}
        >
          {title}
        </ThemedText>

        {/* Spacer */}
        <View style={styles.spacer} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.8,
  },
  spacer: {
    width: 44,
  },
});
