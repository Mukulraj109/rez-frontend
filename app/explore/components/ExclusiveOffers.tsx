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

const { width } = Dimensions.get('window');

const ExclusiveOffers = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => navigateTo('/offers')}
      >
        <LinearGradient
          colors={['#00C06A', '#10B981', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Exclusive Offers</Text>
            <Text style={styles.subtitle}>Unlock special deals and cashback rewards</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigateTo('/offers')}
            >
              <Text style={styles.buttonText}>View All Offers</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
});

export default ExclusiveOffers;
