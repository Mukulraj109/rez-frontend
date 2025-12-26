import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchTipCard() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="bulb-outline" size={20} color="#6366F1" />
      </View>
      <View style={styles.content}>
        <Text style={styles.tipText}>
          <Text style={styles.bold}>Tip:</Text> Try searching "Halal biryani under ₹500 near BTM"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A78BFA',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#1F2937',
  },
});














