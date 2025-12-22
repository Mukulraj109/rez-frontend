/**
 * Prive Offer Detail Page
 *
 * Individual offer detail with dark theme
 */

import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PriveOfferDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // TODO: Implement full offer detail page with dark theme
  // For now, redirect to regular offer detail
  React.useEffect(() => {
    router.replace(`/offers/${id}`);
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loading}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
  },
});
