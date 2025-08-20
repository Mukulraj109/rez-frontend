import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ProjectStatusCardProps } from '@/types/earnPage.types';
import { PROJECT_STATUS_COLORS } from '@/constants/EarnPageColors';

export default function ProjectStatusCard({ 
  label, 
  count, 
  color, 
  onPress 
}: ProjectStatusCardProps) {
  const statusKey = label.toLowerCase().replace(' ', '-') as keyof typeof PROJECT_STATUS_COLORS;
  const statusColors = PROJECT_STATUS_COLORS[statusKey] || {
    background: color,
    text: '#FFFFFF',
    count: '#FFFFFF',
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[statusColors.background, `${statusColors.background}AA`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        <ThemedText style={[styles.count, { color: statusColors.count }]}>
          {count.toString().padStart(2, '0')}
        </ThemedText>
        
        <ThemedText style={[styles.label, { color: statusColors.text }]}>
          {label}
        </ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,   // ⬆️ Increased vertical padding
    paddingHorizontal: 20, // ⬆️ Increased horizontal padding
    minHeight: 120,        // ⬆️ Slightly taller card for breathing space
  },
  count: {
    fontSize: 20,          // bumped up for balance with new spacing
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,       // more breathing room between count & label
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 10,          // slightly bigger so it doesn’t feel too small
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.3,
  },
});

