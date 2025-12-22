// Support Hub Page
// Main customer support hub with quick actions, tickets, and FAQs

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import supportService, { SupportTicket, FAQ } from '@/services/supportApi';

export default function SupportHubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTickets, setActiveTickets] = useState<SupportTicket[]>([]);
  const [popularFAQs, setPopularFAQs] = useState<FAQ[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    byStatus: {} as { [key: string]: number },
    byCategory: {} as { [key: string]: number },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsResponse, summaryResponse, faqsResponse] = await Promise.all([
        supportService.getMyTickets({ status: 'open', limit: 5 }),
        supportService.getTicketsSummary(),
        supportService.getPopularFAQs(5),
      ]);

      if (ticketsResponse.success && ticketsResponse.data) {
        setActiveTickets(ticketsResponse.data.tickets);
      }

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data);
      }

      if (faqsResponse.success && faqsResponse.data) {
        setPopularFAQs(faqsResponse.data.faqs);
      }
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBackPress = () => {
    // Check if there's a previous screen to go back to
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no previous screen (e.g., page was refreshed), navigate to account page
      router.push('/account' as any);
    }
  };

  const handleCreateTicket = () => {
    router.push('/support/create-ticket' as any);
  };

  const handleViewAllTickets = () => {
    router.push('/support/tickets' as any);
  };

  const handleViewAllFAQs = () => {
    router.push('/support/faq' as any);
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    router.push(`/support/ticket-detail?id=${ticket._id}` as any);
  };

  const handleViewFAQ = (faq: FAQ) => {
    router.push(`/support/faq?id=${faq._id}` as any);
  };

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'order-issue':
        Alert.alert('Order Issue', 'Select an order to report an issue', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Orders', onPress: () => router.push('/orders' as any) },
        ]);
        break;
      case 'track-order':
        router.push('/tracking' as any);
        break;
      case 'payment-help':
        handleCreateTicket();
        break;
      case 'account-help':
        handleCreateTicket();
        break;
      default:
        handleCreateTicket();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#10B981';
      case 'in_progress':
        return '#3B82F6';
      case 'waiting_customer':
        return '#F59E0B';
      case 'resolved':
        return '#6B7280';
      case 'closed':
        return '#9CA3AF';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderQuickAction = (icon: string, label: string, color: string, action: string) => {
    return (
      <TouchableOpacity
        key={action}
        style={styles.quickActionCard}
        onPress={() => handleQuickAction(action)}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <ThemedText style={styles.quickActionLabel}>{label}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderTicketCard = (ticket: SupportTicket) => {
    const statusColor = getStatusColor(ticket.status);
    const lastMessage = ticket.messages[ticket.messages.length - 1];

    return (
      <TouchableOpacity
        key={ticket._id}
        style={styles.ticketCard}
        onPress={() => handleViewTicket(ticket)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketTitleRow}>
            <ThemedText style={styles.ticketNumber}>{ticket.ticketNumber}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <ThemedText style={[styles.statusText, { color: statusColor }]}>
                {ticket.status.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.ticketSubject} numberOfLines={1}>
            {ticket.subject}
          </ThemedText>
        </View>

        {lastMessage && (
          <ThemedText style={styles.lastMessage} numberOfLines={2}>
            {lastMessage.message}
          </ThemedText>
        )}

        <View style={styles.ticketFooter}>
          <View style={styles.ticketMeta}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <ThemedText style={styles.ticketDate}>{formatDate(ticket.updatedAt)}</ThemedText>
          </View>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>{ticket.category}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFAQCard = (faq: FAQ) => {
    return (
      <TouchableOpacity
        key={faq._id}
        style={styles.faqCard}
        onPress={() => handleViewFAQ(faq)}
      >
        <View style={styles.faqIcon}>
          <Ionicons name="help-circle" size={24} color="#3B82F6" />
        </View>
        <View style={styles.faqContent}>
          <ThemedText style={styles.faqQuestion} numberOfLines={2}>
            {faq.question}
          </ThemedText>
          {faq.shortAnswer && (
            <ThemedText style={styles.faqShortAnswer} numberOfLines={1}>
              {faq.shortAnswer}
            </ThemedText>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent={true} />

        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Support</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ThemedText style={styles.headerSubtitle}>
          How can we help you today?
        </ThemedText>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction('cube-outline', 'Order Issue', '#EF4444', 'order-issue')}
            {renderQuickAction('location-outline', 'Track Order', '#3B82F6', 'track-order')}
            {renderQuickAction('card-outline', 'Payment Help', '#10B981', 'payment-help')}
            {renderQuickAction('person-outline', 'Account Help', '#F59E0B', 'account-help')}
          </View>
        </View>

        {/* Get Help */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Get Help</ThemedText>
          <View style={styles.helpOptionsGrid}>
            <TouchableOpacity style={styles.helpOptionCard} onPress={() => router.push('/support/call')}>
              <View style={[styles.helpOptionIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="call" size={24} color="#10B981" />
              </View>
              <ThemedText style={styles.helpOptionLabel}>Call Support</ThemedText>
              <ThemedText style={styles.helpOptionDesc}>Talk to us directly</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpOptionCard} onPress={() => router.push('/support/feedback')}>
              <View style={[styles.helpOptionIcon, { backgroundColor: '#3B82F620' }]}>
                <Ionicons name="chatbox" size={24} color="#3B82F6" />
              </View>
              <ThemedText style={styles.helpOptionLabel}>Feedback</ThemedText>
              <ThemedText style={styles.helpOptionDesc}>Share your thoughts</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helpOptionCard} onPress={() => router.push('/support/report-fraud')}>
              <View style={[styles.helpOptionIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
              <ThemedText style={styles.helpOptionLabel}>Report Fraud</ThemedText>
              <ThemedText style={styles.helpOptionDesc}>Suspicious activity</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Tickets Summary */}
        {summary.total > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Your Tickets</ThemedText>
              <TouchableOpacity onPress={handleViewAllTickets}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryValue}>{summary.total}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Total</ThemedText>
              </View>
              <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryValue}>
                  {summary.byStatus['open'] || 0}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Open</ThemedText>
              </View>
              <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryValue}>
                  {summary.byStatus['resolved'] || 0}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Resolved</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Active Tickets */}
        {activeTickets.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Active Tickets</ThemedText>
            {activeTickets.map(renderTicketCard)}
          </View>
        )}

        {/* Create Ticket Button */}
        <TouchableOpacity style={styles.createTicketButton} onPress={handleCreateTicket}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.createTicketGradient}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <ThemedText style={styles.createTicketText}>Create New Ticket</ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        {/* Popular FAQs */}
        {popularFAQs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Popular FAQs</ThemedText>
              <TouchableOpacity onPress={handleViewAllFAQs}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            {popularFAQs.map(renderFAQCard)}
          </View>
        )}

        {/* Contact Options */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Other Ways to Reach Us</ThemedText>
          <View style={styles.contactCard}>
            <Ionicons name="mail-outline" size={24} color="#667eea" />
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactTitle}>Email Support</ThemedText>
              <ThemedText style={styles.contactValue}>support@rezapp.com</ThemedText>
            </View>
          </View>
          <View style={styles.contactCard}>
            <Ionicons name="call-outline" size={24} color="#667eea" />
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactTitle}>Phone Support</ThemedText>
              <ThemedText style={styles.contactValue}>1800-123-4567</ThemedText>
            </View>
          </View>
          <View style={styles.contactCard}>
            <Ionicons name="time-outline" size={24} color="#667eea" />
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactTitle}>Support Hours</ThemedText>
              <ThemedText style={styles.contactValue}>Mon-Sat, 9 AM - 6 PM</ThemedText>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        )}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  helpOptionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  helpOptionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helpOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  helpOptionDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ticketHeader: {
    marginBottom: 12,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketNumber: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  createTicketButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createTicketGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  createTicketText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  faqCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqShortAnswer: {
    fontSize: 12,
    color: '#6B7280',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
