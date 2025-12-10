import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const PADDING = 16;
const BANNER_WIDTH = screenWidth - (PADDING * 2);
const BANNER_HEIGHT = (BANNER_WIDTH * 250) / 450; // Fixed height for better look

interface GlobeBannerProps {
  onPress?: () => void;
}

function GlobeBanner({ onPress }: GlobeBannerProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to offers/view-all for best deals on internet
      router.push('/offers/view-all');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <Image
          source={require('@/assets/images/globe-banner.png')}
          style={[styles.bannerImage, { width: BANNER_WIDTH, height: BANNER_HEIGHT }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    marginTop: 20,
    marginBottom: 8,
  },
  bannerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: {
    borderRadius: 8,
  },
});

export default memo(GlobeBanner);
