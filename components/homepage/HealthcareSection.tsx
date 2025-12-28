/**
 * Healthcare Section - Converted from V2
 * Consult Doctors, Online Pharmacy, Lab Tests, etc.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
  blue500: '#3B82F6',
  teal500: '#14B8A6',
};

const HealthcareSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/healthcare' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏥 Healthcare</Text>
          <Text style={styles.headerSubtitle}>Your health, our priority</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Cards Row */}
      <View style={styles.mainRow}>
        {/* Consult Doctors Card */}
        <TouchableOpacity
          style={styles.doctorsCard}
          onPress={() => handlePress('/healthcare/doctors')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doctorsGradient}
          >
            <View style={styles.doctorIconBox}>
              <Text style={styles.doctorIcon}>👨‍⚕️</Text>
            </View>
            <Text style={styles.doctorsTitle}>Consult</Text>
            <Text style={styles.doctorsTitle}>Doctors</Text>
            <Text style={styles.doctorsSubtitle}>Book instant appointments</Text>
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>24/7 Available</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Online Pharmacy Card */}
        <TouchableOpacity
          style={styles.pharmacyCard}
          onPress={() => handlePress('/healthcare/pharmacy')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#14B8A6', '#0D9488', '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pharmacyGradient}
          >
            <View style={styles.pharmacyIconBox}>
              <Text style={styles.pharmacyIcon}>💊</Text>
            </View>
            <Text style={styles.pharmacyTitle}>Online</Text>
            <Text style={styles.pharmacyTitle}>Pharmacy</Text>
            <Text style={styles.pharmacySubtitle}>Order medicines online</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>25% OFF</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Quick Actions */}
      <View style={styles.bottomRow}>
        {/* Lab Tests */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/healthcare/lab')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🔬</Text>
          </View>
          <Text style={styles.bottomTitle}>Lab</Text>
          <Text style={styles.bottomTitle}>Tests</Text>
        </TouchableOpacity>

        {/* Dental Care */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/healthcare/dental')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🦷</Text>
          </View>
          <Text style={styles.bottomTitle}>Dental</Text>
          <Text style={styles.bottomTitle}>Care</Text>
        </TouchableOpacity>

        {/* Emergency 24x7 */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/healthcare/emergency')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🚑</Text>
          </View>
          <Text style={styles.bottomTitle}>Emergency</Text>
          <Text style={styles.bottomTitle}>24x7</Text>
        </TouchableOpacity>

        {/* Health Records */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/healthcare/records')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Text style={styles.bottomIcon}>📋</Text>
          </View>
          <Text style={styles.bottomTitle}>Health</Text>
          <Text style={styles.bottomTitle}>Records</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },

  // Main Row
  mainRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Doctors Card
  doctorsCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  doctorsGradient: {
    padding: 16,
    minHeight: 180,
  },
  doctorIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doctorIcon: {
    fontSize: 28,
  },
  doctorsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 22,
  },
  doctorsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 12,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Pharmacy Card
  pharmacyCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pharmacyGradient: {
    padding: 16,
    minHeight: 180,
  },
  pharmacyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pharmacyIcon: {
    fontSize: 28,
  },
  pharmacyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 22,
  },
  pharmacySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 12,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  bottomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bottomIcon: {
    fontSize: 20,
  },
  bottomTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
  },
});

export default HealthcareSection;
