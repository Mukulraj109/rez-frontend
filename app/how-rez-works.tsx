import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import all section components
import {
  HowRezWorksHeader,
  HeroSection,
  StepsSection,
  WalletSection,
  WalletTransparencySection,
  OfflineStoresSection,
  BillUploadCard,
  OnlineShoppingSection,
  ProductLockSection,
  LoyaltySection,
  EarnByShareSection,
  TrustPrivacySection,
  FooterCTA,
} from '@/components/how-rez-works';

const HowRezWorksPage: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Fixed Header */}
      <HowRezWorksHeader />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Steps (How saving happens on ReZ) */}
        <StepsSection />

        {/* Section 3: Your ReZ Wallet */}
        <WalletSection />

        {/* Section 4: Wallet Transparency */}
        <WalletTransparencySection />

        {/* Section 5: Using ReZ at offline stores */}
        <OfflineStoresSection />

        {/* Section 6: Bill Upload Special Case */}
        <BillUploadCard />

        {/* Section 7: Shopping online with ReZ */}
        <OnlineShoppingSection />

        {/* Section 8: Lock products before you decide */}
        <ProductLockSection />

        {/* Section 9: Loyalty that actually matters */}
        <LoyaltySection />

        {/* Section 10: Earn more by sharing */}
        <EarnByShareSection />

        {/* Section 11: Trust, Privacy & Control */}
        <TrustPrivacySection />

        {/* Section 12: Footer CTA */}
        <FooterCTA />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default HowRezWorksPage;
