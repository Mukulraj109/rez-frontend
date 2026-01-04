import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import surveyApiService, { SurveyDetail, SurveyAnswer } from '@/services/surveyApi';

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
  error: '#EF4444',
};

const categoryEmojis: Record<string, string> = {
  'Shopping': '📦',
  'Food': '🍔',
  'Fashion': '👗',
  'Finance': '🏦',
  'Health': '💊',
  'Technology': '📱',
  'Travel': '✈️',
  'Entertainment': '🎬',
  'Lifestyle': '🏡',
  'General': '📋',
};

export default function SurveyDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const loadSurvey = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await surveyApiService.getSurveyById(id);
      setSurvey(data);
      if (data.existingSession) {
        setCurrentQuestion(data.existingSession.currentQuestionIndex);
      }
    } catch (error) {
      console.error('Error loading survey:', error);
      Alert.alert('Error', 'Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSurvey();
  }, [loadSurvey]);

  const handleStartSurvey = async () => {
    setStarting(true);
    try {
      const session = await surveyApiService.startSurvey(id!);
      setStartTime(new Date());
      setShowQuestions(true);
      if (session.resumed && session.answers) {
        setAnswers(session.answers);
        setCurrentQuestion(session.currentQuestionIndex);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start survey');
    } finally {
      setStarting(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNext = async () => {
    if (!survey) return;

    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      // Save progress
      try {
        await surveyApiService.saveProgress(id!, answers, currentQuestion + 1);
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    } else {
      // Submit survey
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    // Check required questions
    const unanswered = survey.questions.filter(q =>
      q.required && !answers.find(a => a.questionId === q.id)
    );

    if (unanswered.length > 0) {
      Alert.alert('Incomplete', 'Please answer all required questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await surveyApiService.submitSurvey(id!, answers);
      router.replace({
        pathname: '/survey/complete',
        params: {
          coinsEarned: result.coinsEarned.toString(),
          timeSpent: result.timeSpent.toString(),
          surveyTitle: survey.title,
        },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      'Abandon Survey?',
      'Your progress will be saved and you can continue later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await surveyApiService.saveProgress(id!, answers, currentQuestion);
            } catch (error) {
              console.error('Failed to save progress:', error);
            }
            router.back();
          },
        },
      ]
    );
  };

  const getCurrentAnswer = () => {
    if (!survey) return undefined;
    const question = survey.questions[currentQuestion];
    const answer = answers.find(a => a.questionId === question.id);
    return answer?.answer;
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

  if (!survey) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>Survey not found</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Survey Taking View
  if (showQuestions) {
    const question = survey.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / survey.questions.length) * 100;
    const currentAnswerValue = getCurrentAnswer();

    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleAbandon}>
              <Ionicons name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {survey.questions.length}
              </Text>
            </View>
            <View style={styles.rewardBadge}>
              <Ionicons name="wallet" size={14} color={COLORS.primary} />
              <Text style={styles.rewardBadgeText}>+{survey.reward}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
            {/* Question */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.required && (
                <Text style={styles.requiredText}>* Required</Text>
              )}
            </View>

            {/* Answer Options */}
            <View style={styles.optionsContainer}>
              {question.type === 'single_choice' && question.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    currentAnswerValue === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(question.id, option)}
                >
                  <View style={[
                    styles.radioCircle,
                    currentAnswerValue === option && styles.radioCircleSelected,
                  ]}>
                    {currentAnswerValue === option && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    currentAnswerValue === option && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}

              {question.type === 'multiple_choice' && question.options?.map((option, index) => {
                const selected = Array.isArray(currentAnswerValue) && currentAnswerValue.includes(option);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selected && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      const current = Array.isArray(currentAnswerValue) ? currentAnswerValue : [];
                      if (selected) {
                        handleAnswer(question.id, current.filter(o => o !== option));
                      } else {
                        handleAnswer(question.id, [...current, option]);
                      }
                    }}
                  >
                    <View style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                    ]}>
                      {selected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                    </View>
                    <Text style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {(question.type === 'rating' || question.type === 'scale') && (
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingLabels}>
                    <Text style={styles.ratingLabelText}>{question.minValue || 1}</Text>
                    <Text style={styles.ratingLabelText}>{question.maxValue || (question.type === 'scale' ? 10 : 5)}</Text>
                  </View>
                  <View style={styles.ratingButtons}>
                    {Array.from({ length: (question.maxValue || (question.type === 'scale' ? 10 : 5)) - (question.minValue || 1) + 1 }, (_, i) => (question.minValue || 1) + i).map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.ratingButton,
                          question.type === 'scale' && styles.scaleButton,
                          currentAnswerValue === value && styles.ratingButtonSelected,
                        ]}
                        onPress={() => handleAnswer(question.id, value)}
                      >
                        <Text style={[
                          styles.ratingText,
                          question.type === 'scale' && styles.scaleText,
                          currentAnswerValue === value && styles.ratingTextSelected,
                        ]}>
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {question.type === 'text' && (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Type your answer here..."
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={typeof currentAnswerValue === 'string' ? currentAnswerValue : ''}
                    onChangeText={(text) => handleAnswer(question.id, text)}
                    maxLength={question.maxLength || 500}
                  />
                  <Text style={styles.textInputHint}>
                    {typeof currentAnswerValue === 'string' ? currentAnswerValue.length : 0}/{question.maxLength || 500} characters
                    {question.minLength ? ` (min: ${question.minLength})` : ''}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonSecondary]}
              onPress={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? COLORS.textMuted : COLORS.textDark} />
              <Text style={[styles.navButtonText, currentQuestion === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleNext}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.navButtonTextPrimary}>
                    {currentQuestion === survey.questions.length - 1 ? 'Submit' : 'Next'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Survey Detail View (before starting)
  const emoji = categoryEmojis[survey.subcategory || 'General'] || '📋';
  const completionPercent = survey.targetResponses > 0
    ? Math.round((survey.completedCount / survey.targetResponses) * 100)
    : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Survey Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.08)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroEmoji}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </View>
              <Text style={styles.heroTitle}>{survey.title}</Text>
              <Text style={styles.heroCategory}>{survey.subcategory || 'General'}</Text>

              <View style={styles.heroBadges}>
                <View style={styles.heroBadge}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.heroBadgeText}>{survey.estimatedTime} mins</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.heroBadgeText}>{survey.questionsCount} questions</Text>
                </View>
                <View style={styles.heroBadge}>
                  <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.heroBadgeText}>{survey.completedCount} completed</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Reward Card */}
          <View style={styles.rewardCard}>
            <LinearGradient
              colors={['rgba(0, 192, 106, 0.1)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.rewardCardGradient}
            >
              <View style={styles.rewardIconContainer}>
                <Ionicons name="wallet" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.rewardContent}>
                <Text style={styles.rewardLabel}>Complete to earn</Text>
                <Text style={styles.rewardAmount}>+{survey.reward} ReZ Coins</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this survey</Text>
            <Text style={styles.description}>{survey.description}</Text>
          </View>

          {/* Instructions */}
          {survey.instructions && survey.instructions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              {survey.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Responses</Text>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>
                  {survey.completedCount} of {survey.targetResponses} responses
                </Text>
                <Text style={styles.progressPercent}>{completionPercent}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(completionPercent, 100)}%` }]} />
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButtonWrapper}
            onPress={handleStartSurvey}
            disabled={starting || survey.userStatus === 'completed'}
          >
            <LinearGradient
              colors={survey.userStatus === 'completed' ? ['#9CA3AF', '#9CA3AF'] : ['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              {starting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.startButtonText}>
                    {survey.userStatus === 'completed'
                      ? 'Already Completed'
                      : survey.userStatus === 'in_progress'
                      ? 'Continue Survey'
                      : 'Start Survey'}
                  </Text>
                  {survey.userStatus !== 'completed' && (
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  progressInfo: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    borderRadius: 20,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  heroSection: {
    padding: 16,
  },
  heroGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  heroEmoji: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emojiText: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroCategory: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rewardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  rewardCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
    gap: 16,
  },
  rewardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  rewardAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 26,
  },
  requiredText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 192, 106, 0.05)',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  ratingContainer: {
    gap: 12,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ratingLabelText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  ratingButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scaleText: {
    fontSize: 13,
  },
  ratingTextSelected: {
    color: COLORS.white,
  },
  textInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    fontSize: 15,
    color: COLORS.textDark,
    minHeight: 120,
    paddingTop: 0,
    paddingBottom: 12,
  },
  textInputHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  navButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  navButtonSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  navButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  navButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  navButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
