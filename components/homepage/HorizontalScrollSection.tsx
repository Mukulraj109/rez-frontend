import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HorizontalScrollSectionProps } from '@/types/homepage.types';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

export default function HorizontalScrollSection({
  section,
  onRefresh,
  renderCard,
  cardWidth = 280,
  spacing = 16,
  showIndicator = true,
}: HorizontalScrollSectionProps) {
  const [refreshing, setRefreshing] = React.useState(false);
  
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Failed to refresh section:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Section Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>{section.title}</ThemedText>
        <View style={[styles.titleAccent, { backgroundColor: primaryColor }]} />
      </ThemedView>

      {/* Horizontal Scroll Content */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={showIndicator}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing }]}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {section.items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.cardContainer,
              { width: cardWidth, marginRight: index === section.items.length - 1 ? 0 : spacing },
            ]}
          >
            {renderCard(item)}
          </View>
        ))}
      </ScrollView>

      {/* Optional iOS Always-visible Scroll Indicator */}
      {Platform.OS === 'ios' && showIndicator && (
        <View style={[styles.fakeIndicator, { backgroundColor: primaryColor }]} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  titleAccent: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    flex: 0,
    flexShrink: 0,
  },
  fakeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },
});
