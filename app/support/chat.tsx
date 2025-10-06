// Live Chat Page
// Real-time chat support with customer service agents

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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
}

export default function LiveChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! Welcome to Rez Support. How can I help you today?',
      sender: 'agent',
      timestamp: new Date(),
      agentName: 'Sarah',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/account' as any);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage]);
      setMessage('');

      // Simulate agent typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Simulate agent response
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! This is a demo. The live chat feature will be implemented soon with real-time messaging.",
          sender: 'agent',
          timestamp: new Date(),
          agentName: 'Sarah',
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <StatusBar barStyle="light-content" backgroundColor="#10B981" translucent={true} />

        {/* Header */}
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <View style={styles.agentAvatar}>
                <ThemedText style={styles.agentInitial}>S</ThemedText>
              </View>
              <View style={styles.headerTextSection}>
                <ThemedText style={styles.headerTitle}>Sarah</ThemedText>
                <View style={styles.onlineStatus}>
                  <View style={styles.onlineDot} />
                  <ThemedText style={styles.headerSubtitle}>Online</ThemedText>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <View style={styles.backButtonInner}>
                <Ionicons name="ellipsis-vertical" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Chat Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="chatbubbles" size={32} color="#10B981" />
            </View>
            <ThemedText style={styles.welcomeTitle}>
              Welcome to Live Chat! 👋
            </ThemedText>
            <ThemedText style={styles.welcomeText}>
              You're now connected with our support team. We typically respond within a few minutes.
            </ThemedText>
          </View>

          {/* Messages */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.agentMessage,
              ]}
            >
              {msg.sender === 'agent' && (
                <View style={styles.agentInfo}>
                  <View style={styles.smallAgentAvatar}>
                    <ThemedText style={styles.smallAgentInitial}>S</ThemedText>
                  </View>
                  <ThemedText style={styles.agentName}>{msg.agentName}</ThemedText>
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  msg.sender === 'user'
                    ? styles.userMessageContent
                    : styles.agentMessageContent,
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userMessageText : styles.agentMessageText,
                  ]}
                >
                  {msg.text}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userMessageTime : styles.agentMessageTime,
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </ThemedText>
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.smallAgentAvatar}>
                <ThemedText style={styles.smallAgentInitial}>S</ThemedText>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <ThemedText style={styles.quickActionsTitle}>Quick Actions:</ThemedText>
            <View style={styles.quickActionsButtons}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="cube-outline" size={16} color="#10B981" />
                <ThemedText style={styles.quickActionText}>Track Order</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="card-outline" size={16} color="#10B981" />
                <ThemedText style={styles.quickActionText}>Payment Issue</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <LinearGradient
              colors={message.trim() ? ['#10B981', '#059669'] : ['#E5E7EB', '#D1D5DB']}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 12,
  },
  moreButton: {
    marginLeft: 12,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  headerTextSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageBubble: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 4,
  },
  smallAgentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  smallAgentInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  userMessageContent: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  agentMessageContent: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: 'white',
  },
  agentMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  agentMessageTime: {
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  quickActionsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
