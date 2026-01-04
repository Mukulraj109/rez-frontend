import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import surveysApiService, { SurveyDetail } from '@/services/surveysApi';

const COLORS = {
  primary: '#00C06A',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
};

const categoryEmojis: Record<string, string> = {
  'Shopping': '📦', 'Food': '🍔', 'Fashion': '👗', 'Finance': '🏦',
  'Health': '💊', 'Technology': '📱', 'Travel': '✈️', 'Entertainment': '🎬',
  'General': '📋',
};

const difficultyColors = {
  easy: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)' },
  medium: { bg: 'rgba(249, 115, 22, 0.1)', text: '#EA580C', border: 'rgba(249, 115, 22, 0.3)' },
  hard: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', border: 'rgba(239, 68, 68, 0.3)' },
};

export default function SurveyDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await surveysApiService.getSurveyById(id);
      setSurvey(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSurvey = async () => {
    if (!id || !survey) return;

    if (survey.userStatus === 'completed') {
      setError('You have already completed this survey');
      return;
    }

    setStarting(true);
    try {
      await surveysApiService.startSurvey(id);
      router.push(`/survey/${id}/take`);
    } catch (err: any) {
      setError(err.message || 'Failed to start survey');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading survey...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !survey) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.errorText}>{error || 'Survey not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSurvey}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const emoji = categoryEmojis[survey.subcategory || 'General'] || '📋';
  const difficulty = survey.difficulty || 'easy';
  const diffColors = difficultyColors[difficulty] || difficultyColors.easy;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.heroGradient}
            >
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
              </View>
              <Text style={styles.title}>{survey.title}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: diffColors.bg, borderColor: diffColors.border }]}>
                  <Text style={[styles.badgeText, { color: diffColors.text }]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Ionicons name="pricetag" size={12} color={COLORS.textMuted} />
                  <Text style={styles.categoryText}>{survey.subcategory || 'General'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>+{survey.reward}</Text>
              <Text style={styles.statLabel}>ReZ Coins</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{survey.estimatedTime} min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{survey.questionsCount}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Survey</Text>
            <Text style={styles.description}>{survey.description}</Text>
          </View>

          {/* Instructions */}
          {survey.instructions && survey.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {survey.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Progress Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Survey Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Responses</Text>
                <Text style={styles.progressValue}>{survey.completedCount} / {survey.targetResponses}</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((survey.completedCount / survey.targetResponses) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* User Status */}
          {survey.userStatus === 'completed' && (
            <View style={styles.completedBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <Text style={styles.completedText}>You have completed this survey</Text>
            </View>
          )}

          {survey.userStatus === 'in_progress' && survey.existingSession && (
            <View style={styles.resumeBanner}>
              <Ionicons name="play-circle" size={24} color="#3B82F6" />
              <View>
                <Text style={styles.resumeText}>Resume your survey</Text>
                <Text style={styles.resumeSubtext}>
                  {survey.existingSession.answeredCount} of {survey.questionsCount} questions answered
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom CTA */}
        {survey.userStatus !== 'completed' && (
          <View style={styles.bottomCTA}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSurvey}
              disabled={starting}
            >
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                {starting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.startButtonText}>
                      {survey.userStatus === 'in_progress' ? 'Continue Survey' : 'Start Survey'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 16, textAlign: 'center' },
  retryButton: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  content: { flex: 1 },
  heroSection: { padding: 16 },
  heroGradient: { borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  emojiContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emoji: { fontSize: 40 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12 },
  categoryText: { fontSize: 12, color: COLORS.textMuted },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: { elevation: 2 } }) },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginTop: 8 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  description: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  instructionBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  instructionNumber: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  instructionText: { flex: 1, fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  progressCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, color: COLORS.textMuted },
  progressValue: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  completedBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 16, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  completedText: { fontSize: 14, fontWeight: '600', color: '#059669' },
  resumeBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 16, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)' },
  resumeText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  resumeSubtext: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  startButton: { borderRadius: 14, overflow: 'hidden' },
  startButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
