// Support Ticket Status Page
// Track and manage support ticket

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const MOCK_TICKET: Ticket = {
  id: 'TKT-2024-001234',
  subject: 'Order not delivered',
  category: 'Orders & Delivery',
  status: 'in_progress',
  priority: 'high',
  createdAt: '2024-12-18T10:30:00',
  updatedAt: '2024-12-20T09:00:00',
  messages: [
    { id: '1', sender: 'user', message: 'My order #ORD-123 was supposed to be delivered yesterday but I haven\'t received it yet.', timestamp: '2024-12-18T10:30:00' },
    { id: '2', sender: 'support', message: 'Hi! Thank you for reaching out. I\'m looking into your order now. Can you please confirm your delivery address?', timestamp: '2024-12-18T11:15:00' },
    { id: '3', sender: 'user', message: '123 Main Street, Apartment 4B, Bangalore 560001', timestamp: '2024-12-18T11:20:00' },
    { id: '4', sender: 'support', message: 'Thank you for confirming. I can see there was a delivery attempt yesterday but no one was available. The package is at the local hub and will be re-delivered today.', timestamp: '2024-12-18T14:00:00' },
  ],
};

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [ticket, setTicket] = useState<Ticket>(MOCK_TICKET);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const message: TicketMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      setTicket(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return Colors.info;
      case 'in_progress': return Colors.primary[600];
      case 'waiting': return Colors.warning;
      case 'resolved': return Colors.success;
      case 'closed': return Colors.gray[500];
      default: return Colors.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'waiting': return 'Waiting for Reply';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Ticket #{id || ticket.id}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '30' }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                {getStatusLabel(ticket.status)}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Ticket Info */}
      <View style={styles.ticketInfo}>
        <ThemedText style={styles.ticketSubject}>{ticket.subject}</ThemedText>
        <View style={styles.ticketMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={14} color={Colors.text.tertiary} />
            <ThemedText style={styles.metaText}>{ticket.category}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.text.tertiary} />
            <ThemedText style={styles.metaText}>
              Created {formatTime(ticket.createdAt)}
            </ThemedText>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {ticket.messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'user' && styles.messageWrapperUser,
              ]}
            >
              <View style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleSupport,
              ]}>
                {msg.sender === 'support' && (
                  <View style={styles.supportBadge}>
                    <Ionicons name="headset" size={12} color={Colors.primary[600]} />
                    <ThemedText style={styles.supportBadgeText}>Support</ThemedText>
                  </View>
                )}
                <ThemedText style={[
                  styles.messageText,
                  msg.sender === 'user' && styles.messageTextUser,
                ]}>
                  {msg.message}
                </ThemedText>
                <ThemedText style={[
                  styles.messageTime,
                  msg.sender === 'user' && styles.messageTimeUser,
                ]}>
                  {formatTime(msg.timestamp)}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color={Colors.text.tertiary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? '#FFF' : Colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Resolution Actions */}
        {ticket.status === 'resolved' && (
          <View style={styles.resolutionActions}>
            <ThemedText style={styles.resolutionText}>Was your issue resolved?</ThemedText>
            <View style={styles.resolutionButtons}>
              <TouchableOpacity style={styles.resolutionButtonYes}>
                <Ionicons name="thumbs-up" size={20} color="#FFF" />
                <ThemedText style={styles.resolutionButtonText}>Yes</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resolutionButtonNo}>
                <Ionicons name="thumbs-down" size={20} color={Colors.text.primary} />
                <ThemedText style={styles.resolutionButtonNoText}>No, reopen</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.label,
    color: '#FFF',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  moreButton: {
    padding: Spacing.sm,
  },
  ticketInfo: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  ticketSubject: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  messageWrapper: {
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  messageWrapperUser: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  messageBubbleSupport: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 0,
    ...Shadows.subtle,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary[600],
    borderTopRightRadius: 0,
  },
  supportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  supportBadgeText: {
    ...Typography.caption,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  messageText: {
    ...Typography.body,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#FFF',
  },
  messageTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  messageTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
  },
  attachButton: {
    padding: Spacing.sm,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
  resolutionActions: {
    backgroundColor: Colors.success + '15',
    padding: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.success + '30',
  },
  resolutionText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  resolutionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  resolutionButtonYes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  resolutionButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  resolutionButtonNo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  resolutionButtonNoText: {
    ...Typography.button,
    color: Colors.text.primary,
  },
});
