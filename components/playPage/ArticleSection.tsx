import React from 'react';
import { View, StyleSheet , ScrollView,} from 'react-native';
import { UGCVideoItem, PLAY_PAGE_COLORS } from '@/types/playPage.types';
import SectionHeader from './SectionHeader';
import VideoGrid from './VideoGrid';


interface ArticleSectionProps {
  articles: UGCVideoItem[];
  onArticlePress: (article: UGCVideoItem) => void;
  onViewAllPress?: () => void;
  autoPlay?: boolean;
  loading?: boolean;
}

export default function ArticleSection({ 
  articles, 
  onArticlePress, 
  onViewAllPress,
  autoPlay = true,
  loading = false 
}: ArticleSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader
        title="Article"
        showViewAll={true}
        onViewAllPress={onViewAllPress}
      />
         <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
      <VideoGrid
        items={articles}
        onItemPress={onArticlePress}
        columns={2}
        autoPlay={autoPlay}
        showLoadMore={false}
        loading={loading}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: PLAY_PAGE_COLORS.background,
    paddingBottom: 16,
  },
    scrollContainer: {
    paddingHorizontal: 16,
  },
});