import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface LearnTopic {
  title: string;
  path: string;
}

const LearnMaximiseSection = () => {
  const router = useRouter();

  const learnTopics: LearnTopic[] = [
    { title: 'Complete Coin System Guide', path: '/coin-system' },
    { title: 'How ReZ Coins work', path: '/how-rez-works' },
    { title: 'Difference between coin types', path: '/coin-system' },
    { title: 'Best ways to earn faster', path: '/how-rez-works' },
    { title: 'Coin expiry rules', path: '/how-rez-works' },
  ];

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EFF6FF', '#F5F3FF']}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={28} color="#3B82F6" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Learn & Maximise</Text>
            <Text style={styles.subtitle}>Become an earning pro</Text>
          </View>
        </View>

        {/* Topics List */}
        <View style={styles.topicsList}>
          {learnTopics.map((topic, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.topicItem}
              onPress={() => navigateTo(topic.path)}
            >
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigateTo('/how-rez-works')}
        >
          <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.ctaText}>Watch 30-sec Explainer</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  topicsList: {
    gap: 8,
    marginBottom: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  topicTitle: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginTop: 4,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LearnMaximiseSection;
