// Group Buy Page
// Feature for group buying to get bulk discounts

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

const GroupBuyPage = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Group Buy</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Coming Soon Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.comingSoonCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={64} color="#8B5CF6" />
          </View>
          <ThemedText style={styles.comingSoonTitle}>Coming Soon!</ThemedText>
          <ThemedText style={styles.comingSoonMessage}>
            Group buying feature is under development. Soon you'll be able to team up with other
            shoppers to unlock amazing bulk discounts!
          </ThemedText>

          <View style={styles.featuresContainer}>
            <ThemedText style={styles.featuresTitle}>What's Coming:</ThemedText>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Team Up & Save</Text>
                <Text style={styles.featureDescription}>
                  Join groups to unlock bulk discounts up to 50%
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Share with Friends</Text>
                <Text style={styles.featureDescription}>
                  Invite friends to reach minimum order quantities faster
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Exclusive Deals</Text>
                <Text style={styles.featureDescription}>
                  Access special group-only products and offers
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureLabel}>Flexible Delivery</Text>
                <Text style={styles.featureDescription}>
                  Choose individual or consolidated delivery options
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notifyButton}
            onPress={() => {
              // TODO: Implement notify functionality
              alert('You will be notified when Group Buy launches!');
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  comingSoonMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default GroupBuyPage;
