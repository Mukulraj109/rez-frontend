// UGCDetailScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Platform } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { ThemedText } from '@/components/ThemedText';

type ProductCard = {
  id: string;
  title: string;
  price: string;
  rating?: number;
  cashbackText?: string;
  image: string;
};

type UGCItem = {
  id: string;
  videoUrl?: string;
  uri?: string;
  viewCount: string;
  description: string;
  tag?: string;
  productCards?: ProductCard[];
};

export default function UGCDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const videoRef = useRef<Video | null>(null);
  const [ready, setReady] = useState(false);

  const item: UGCItem = useMemo(() => {
    return route.params?.item ?? {
      id: 'fallback',
      // Sample Google Cloud video URL
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      viewCount: '2.5L',
      description: '“Watch me slay the look – dressed to impress and ready to film!”',
      tag: '#Check Stripes',
      productCards: [
        {
          id: 'p1',
          title: 'Little Big Comfort Shirt',
          price: '₹2,199',
          rating: 4.2,
          cashbackText: 'Upto 12% cash back',
          image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=300&h=300&fit=crop',
        },
        {
          id: 'p2',
          title: 'Little Big Comfort Shirt',
          price: '₹2,199',
          rating: 4.2,
          cashbackText: 'Upto 12% cash back',
          image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=300&h=300&fit=crop',
        },
      ],
    };
  }, [route.params]);

  useEffect(() => {
    const playVideo = async () => {
      try {
        if (videoRef.current) {
          if (isFocused) {
            await videoRef.current.playAsync();
          } else {
            await videoRef.current.pauseAsync();
          }
        }
      } catch (error) {
        console.warn('Video play error:', error);
      }
    };

    playVideo();
  }, [isFocused]);

  const { width } = Dimensions.get('window');
  const bottomCardWidth = Math.min(220, Math.floor(width * 0.58));

  return (
    <View style={styles.container}>
      {item.videoUrl ? (
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER} // middle part filling screen
          isLooping
          shouldPlay={isFocused}
          isMuted // required for web autoplay
          useNativeControls={false}
          playsInSilentModeIOS
          onLoad={() => {
            setReady(true);
            if (Platform.OS === 'web' && videoRef.current) {
              videoRef.current.playAsync().catch(() => {});
            }
          }}
        />
      ) : (
        <Image source={{ uri: item.uri! }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: 160 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        style={[StyleSheet.absoluteFill, { top: '40%' }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconPill}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={[styles.iconPill, { backgroundColor: '#FFFFFFE6' }]}>
          <Ionicons name="eye" size={14} color="#111827" />
          <ThemedText style={{ marginLeft: 6, fontWeight: '700', color: '#111827' }}>
            {item.viewCount}
          </ThemedText>
        </View>
      </View>

      <View style={styles.captionBlock}>
        <ThemedText style={styles.captionText}>{item.description}</ThemedText>
        {item.tag ? (
          <View style={styles.tagPill}>
            <ThemedText style={styles.tagText}>{item.tag}</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomCardsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          snapToAlignment="start"
        >
          {(item.productCards ?? []).map((p) => (
            <View key={p.id} style={[styles.productCard, { width: bottomCardWidth }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: p.image }} style={styles.productThumb} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <ThemedText numberOfLines={1} style={styles.productTitle}>{p.title}</ThemedText>
                  <ThemedText style={styles.productPrice}>{p.price}</ThemedText>
                  <View style={{ flexDirection: 'row', marginTop: 2 }}>
                    {p.rating ? (
                      <ThemedText style={styles.metaText}>{p.rating.toFixed(1)}</ThemedText>
                    ) : null}
                    {p.cashbackText ? (
                      <ThemedText style={[styles.metaText, { marginLeft: 8 }]}>{p.cashbackText}</ThemedText>
                    ) : null}
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.ctaButton}>
                <ThemedText style={styles.ctaText}>Add to cart</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 18,
  },
  captionBlock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 160,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 18,
    opacity: 0.95,
  },
  tagPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1F2937',
    borderRadius: 999,
  },
  tagText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  bottomCardsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    padding: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  productThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#EEE' },
  productTitle: { color: '#111827', fontWeight: '700', fontSize: 13.5 },
  productPrice: { color: '#111827', fontWeight: '800', marginTop: 2 },
  metaText: { color: '#6B7280', fontSize: 11.5 },
  ctaButton: {
    marginTop: 10,
    backgroundColor: '#6F45FF',
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});
