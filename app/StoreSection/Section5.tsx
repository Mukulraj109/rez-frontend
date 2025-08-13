import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function Section5() {
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.85} style={styles.button}>
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>🔄</ThemedText>
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Save Deal for Later</ThemedText>
          <ThemedText style={styles.subtitle}>
            Keep this offer saved in your list
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
    color: '#6c63ff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
});
