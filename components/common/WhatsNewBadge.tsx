import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  View,
  Text,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface WhatsNewBadgeProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const WhatsNewBadge: React.FC<WhatsNewBadgeProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.badge, style]}
      accessibilityRole="button"
      accessibilityLabel="What's New"
    >
      <View style={styles.content}>
        <Text style={styles.star}>✦</Text>
        <ThemedText style={styles.text}>What's New</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#059669',
  },
  content: {
    position: 'relative',
  },
  star: {
    position: 'absolute',
    top: 7,
    right: 0,
    fontSize: 4,
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '600',
  },
});

export default WhatsNewBadge;
