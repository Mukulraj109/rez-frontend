import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function Section6() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.mainTitle}>
            10 Vouchers for store visit
          </ThemedText>
          <View style={styles.percentContainer}>
            <ThemedText style={styles.percentIcon}>%</ThemedText>
          </View>
        </View>

        {/* Bottom Action */}
        <TouchableOpacity activeOpacity={0.85} style={styles.expandButton}>
          <ThemedText style={styles.expandText}>View all outlet</ThemedText>
          <Ionicons name="chevron-forward" size={18} color="#6c63ff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    paddingRight: 10,
  },
  percentContainer: {
    backgroundColor: '#fff3cd',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe58f',
  },
  percentIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
  },
  expandText: {
    fontSize: 14,
    color: '#6c63ff',
    marginRight: 4,
    fontWeight: '500',
  },
});
