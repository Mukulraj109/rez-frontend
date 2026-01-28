import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EarnScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/playandearn' as any);
  }, []);

  // Show a brief loading state while redirecting
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00C06A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
});
