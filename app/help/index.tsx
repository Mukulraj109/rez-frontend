// Help & Support Main Page
// Central hub for user assistance and support

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  route: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isExpanded?: boolean;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  itemCount: number;
  route: string;
}

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleFAQPress = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: 'chatbubble-ellipses',
      iconColor: '#10B981',
      route: '/help/chat',
    },
    {
      id: 'call',
      title: 'Call Support',
      description: 'Speak directly with a support agent',
      icon: 'call',
      iconColor: '#3B82F6',
      route: '/help/call',
    },
    {
      id: 'email',
      title: 'Email Us',
      description: 'Send us a detailed message',
      icon: 'mail',
      iconColor: '#8B5CF6',
      route: '/help/email',
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Share your thoughts and suggestions',
      icon: 'star',
      iconColor: '#F59E0B',
      route: '/help/feedback',
    },
  ];

  const helpCategories: HelpCategory[] = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      icon: 'bag-handle',
      iconColor: '#10B981',
      itemCount: 12,
      route: '/help/orders',
    },
    {
      id: 'payments',
      title: 'Payments & Refunds',
      icon: 'card',
      iconColor: '#3B82F6',
      itemCount: 8,
      route: '/help/payments',
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person',
      iconColor: '#8B5CF6',
      itemCount: 6,
      route: '/help/account',
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: 'settings',
      iconColor: '#EF4444',
      itemCount: 10,
      route: '/help/technical',
    },
    {
      id: 'features',
      title: 'App Features',
      icon: 'apps',
      iconColor: '#F59E0B',
      itemCount: 15,
      route: '/help/features',
    },
    {
      id: 'policies',
      title: 'Policies & Terms',
      icon: 'document-text',
      iconColor: '#6B7280',
      itemCount: 5,
      route: '/help/policies',
    },
  ];

  const popularFAQs: FAQItem[] = [
    {
      id: 'faq1',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to the "Tracking" section in the app or by clicking on the order number in your order history. You\'ll see real-time updates on your order status, estimated delivery time, and delivery partner information.',
      category: 'orders',
    },
    {
      id: 'faq2',
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order within 5 minutes of placing it by going to "My Orders" and clicking the cancel button. If it\'s been longer than 5 minutes, you can contact our support team for assistance.',
      category: 'orders',
    },
    {
      id: 'faq3',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, digital wallets, and cash on delivery. You can manage your payment methods in the "Payment Methods" section of your account.',
      category: 'payments',
    },
    {
      id: 'faq4',
      question: 'How do I get a refund?',
      answer: 'Refunds are processed automatically for cancelled orders. For other refund requests, please contact our support team with your order details. Refunds typically take 3-5 business days to reflect in your account.',
      category: 'payments',
    },
    {
      id: 'faq5',
      question: 'How do I change my delivery address?',
      answer: 'You can update your delivery address during checkout or manage saved addresses in your account settings. Note that address changes may not be possible after the order has been confirmed.',
      category: 'account',
    },
  ];

  const filteredFAQs = popularFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickAction}
      onPress={() => router.push(action.route as any)}
      activeOpacity={0.8}
      accessibilityLabel={`${action.title}. ${action.description}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to access this support option"
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.iconColor + '15' }]}>
        <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
      </View>
      <ThemedText style={styles.quickActionTitle}>{action.title}</ThemedText>
      <ThemedText style={styles.quickActionDescription}>{action.description}</ThemedText>
    </TouchableOpacity>
  );

  const renderHelpCategory = (category: HelpCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.helpCategory}
      onPress={() => router.push(category.route as any)}
      activeOpacity={0.8}
      accessibilityLabel={`${category.title} category. ${category.itemCount} articles available`}
      accessibilityRole="button"
      accessibilityHint="Double tap to browse articles in this category"
    >
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: category.iconColor + '15' }]}>
          <Ionicons name={category.icon as any} size={20} color={category.iconColor} />
        </View>

        <View style={styles.categoryText}>
          <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
          <ThemedText style={styles.categoryCount}>
            {category.itemCount} articles
          </ThemedText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderFAQItem = (faq: FAQItem) => {
    const isExpanded = expandedFAQ === faq.id;
    return (
      <TouchableOpacity
        key={faq.id}
        style={styles.faqItem}
        onPress={() => handleFAQPress(faq.id)}
        activeOpacity={0.8}
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} FAQ: ${faq.question}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view answer"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.faqHeader}>
          <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9CA3AF"
          />
        </View>

        {isExpanded && (
          <View
            style={styles.faqAnswer}
            accessibilityLabel={`Answer: ${faq.answer}`}
            accessibilityRole="text"
          >
            <ThemedText style={styles.faqAnswerText}>{faq.answer}</ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#8B5CF6"
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7'] as const}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Help & Support</ThemedText>
          
          <View style={styles.headerRight} />
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search help articles"
            accessibilityHint="Enter keywords to search for help articles"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              accessibilityHint="Double tap to clear search text"
            >
              <Ionicons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Get Quick Help</ThemedText>
          <View style={styles.quickActions}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Browse by Category</ThemedText>
          <View style={styles.helpCategories}>
            {helpCategories.map(renderHelpCategory)}
          </View>
        </View>

        {/* Popular FAQs */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredFAQs.length})` : 'Popular Questions'}
          </ThemedText>
          <View style={styles.faqList}>
            {filteredFAQs.map(renderFAQItem)}
          </View>
          
          {filteredFAQs.length === 0 && searchQuery && (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#D1D5DB" />
              <ThemedText style={styles.noResultsTitle}>No results found</ThemedText>
              <ThemedText style={styles.noResultsText}>
                Try searching with different keywords or browse our help categories above.
              </ThemedText>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <ThemedText style={styles.contactTitle}>Still need help?</ThemedText>
          <ThemedText style={styles.contactText}>
            Our support team is available 24/7 to assist you.
          </ThemedText>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/help/contact' as any)}
            accessibilityLabel="Contact Support"
            accessibilityRole="button"
            accessibilityHint="Double tap to contact our 24/7 support team"
          >
            <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Help Categories
  helpCategories: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  helpCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  // FAQ List
  faqList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // No Results
  noResults: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Contact Info
  contactInfo: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  bottomSpace: {
    height: 20,
  },
});