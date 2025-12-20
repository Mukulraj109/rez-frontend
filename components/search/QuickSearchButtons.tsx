import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickSearchButtonsProps {
  onPress: (query: string) => void;
}

export default function QuickSearchButtons({ onPress }: QuickSearchButtonsProps) {
  const buttons = [
    {
      id: 'food-near-me',
      label: 'Food near me',
      query: 'food near me',
      icon: 'restaurant' as const,
    },
    {
      id: 'grocery-60min',
      label: 'Grocery in 60 min',
      query: 'grocery',
      icon: 'basket' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button.id}
          style={styles.button}
          onPress={() => onPress(button.query)}
          activeOpacity={0.7}
        >
          <Ionicons name={button.icon} size={20} color="#00C06A" style={styles.icon} />
          <Text style={styles.buttonText}>{button.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#00C06A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});








