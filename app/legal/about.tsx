// About ReZ Screen
// Company information and app details

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/rezapp',
  instagram: 'https://instagram.com/rezapp',
  twitter: 'https://twitter.com/rezapp',
  linkedin: 'https://linkedin.com/company/rezapp',
};

export default function AboutPage() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleSocialPress = async (platform: keyof typeof SOCIAL_LINKS) => {
    const url = SOCIAL_LINKS[platform];
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleEmailPress = async () => {
    await Linking.openURL('mailto:support@rezapp.com');
  };

  const handlePhonePress = async () => {
    await Linking.openURL('tel:1800XXXXXXX');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>About ReZ</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.tagline}>Shop Smart. Earn More.</ThemedText>
        </View>

        {/* Mission Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={24} color={Colors.primary[600]} />
            <ThemedText style={styles.cardTitle}>Our Mission</ThemedText>
          </View>
          <ThemedText style={styles.cardDescription}>
            ReZ is revolutionizing the way you shop by rewarding every purchase.
            We believe that every rupee you spend should earn you something back.
            Our mission is to create a seamless shopping experience where rewards,
            savings, and convenience come together.
          </ThemedText>
        </View>

        {/* App Version Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="phone-portrait" size={24} color={Colors.primary[600]} />
            <ThemedText style={styles.cardTitle}>App Version</ThemedText>
          </View>
          <View style={styles.versionInfo}>
            <ThemedText style={styles.versionText}>
              v{appVersion} (Build {buildNumber})
            </ThemedText>
          </View>
        </View>

        {/* Connect With Us */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="share-social" size={24} color={Colors.primary[600]} />
            <ThemedText style={styles.cardTitle}>Connect With Us</ThemedText>
          </View>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('facebook')}
              accessible={true}
              accessibilityLabel="Visit our Facebook page"
              accessibilityRole="link"
            >
              <Ionicons name="logo-facebook" size={28} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('instagram')}
              accessible={true}
              accessibilityLabel="Visit our Instagram page"
              accessibilityRole="link"
            >
              <Ionicons name="logo-instagram" size={28} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('twitter')}
              accessible={true}
              accessibilityLabel="Visit our Twitter page"
              accessibilityRole="link"
            >
              <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('linkedin')}
              accessible={true}
              accessibilityLabel="Visit our LinkedIn page"
              accessibilityRole="link"
            >
              <Ionicons name="logo-linkedin" size={28} color="#0A66C2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call" size={24} color={Colors.primary[600]} />
            <ThemedText style={styles.cardTitle}>Contact</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailPress}
            accessible={true}
            accessibilityLabel="Email support at rezapp dot com"
            accessibilityRole="link"
          >
            <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.contactText}>support@rezapp.com</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhonePress}
            accessible={true}
            accessibilityLabel="Call toll free number"
            accessibilityRole="link"
          >
            <Ionicons name="call-outline" size={20} color={Colors.text.secondary} />
            <ThemedText style={styles.contactText}>1800-XXX-XXXX (Toll Free)</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            © 2024 ReZ Technologies Pvt Ltd
          </ThemedText>
          <ThemedText style={styles.madeWith}>
            Made with ❤️ in India
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadows.medium,
  },
  logo: {
    width: 80,
    height: 80,
  },
  tagline: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  contactText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  copyright: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  madeWith: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
});
