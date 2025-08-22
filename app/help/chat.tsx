// Live Chat Support Page
// Real-time chat with customer support agents

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
  isTyping?: boolean;
  type: 'text' | 'image' | 'file' | 'quick_reply';
  quickReplies?: string[];
}

interface SupportAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  title: string;
}

export default function ChatSupportPage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agent, setAgent] = useState<SupportAgent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const initializeChat = async () => {
    // Simulate connecting to support
    setIsTyping(true);
    
    setTimeout(() => {
      const supportAgent: SupportAgent = {
        id: 'agent_1',
        name: 'Sarah Wilson',
        status: 'online',
        title: 'Customer Support Specialist',
      };
      
      setAgent(supportAgent);
      setIsConnected(true);
      setIsTyping(false);
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hi! I'm ${supportAgent.name}, your customer support specialist. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromUser: false,
        type: 'quick_reply',
        quickReplies: [
          'Track my order',
          'Refund request',
          'Account issue',
          'Technical problem',
          'Other'
        ],
      };
      
      setMessages([welcomeMessage]);
    }, 2000);
  };

  const handleBackPress = () => {
    Alert.alert(
      'End Chat',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Continue Chat', style: 'cancel' },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: true,
      type: 'text',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after delay
    setTimeout(() => {
      const agentResponse = generateAgentResponse(text);
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const generateAgentResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    let response = "I understand your concern. Let me help you with that. Could you please provide more details so I can assist you better?";
    
    if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      response = "I'd be happy to help you track your order! Could you please provide your order number? It usually starts with 'WAS' followed by numbers.";
    } else if (lowerMessage.includes('refund') || lowerMessage.includes('cancel')) {
      response = "I can help you with your refund request. To process this quickly, could you please share your order number and the reason for the refund?";
    } else if (lowerMessage.includes('account') || lowerMessage.includes('login')) {
      response = "I'm here to help with your account issues. Are you having trouble logging in, or is there something specific you'd like to update in your account?";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      response = "I can assist you with payment-related queries. For security reasons, please don't share your complete card details. What specific payment issue are you experiencing?";
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('address')) {
      response = "I can help you with delivery concerns. Could you tell me if this is about updating your delivery address or if there's an issue with a current delivery?";
    }
    
    return {
      id: `agent_${Date.now()}`,
      content: response,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromUser: false,
      type: 'text',
    };
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isFromUser ? styles.userMessageContainer : styles.agentMessageContainer
      ]}
    >
      {!message.isFromUser && (
        <View style={styles.agentInfo}>
          <View style={styles.agentAvatar}>
            <ThemedText style={styles.agentAvatarText}>
              {agent?.name.charAt(0) || 'S'}
            </ThemedText>
          </View>
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          message.isFromUser ? styles.userMessageBubble : styles.agentMessageBubble
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            message.isFromUser ? styles.userMessageText : styles.agentMessageText
          ]}
        >
          {message.content}
        </ThemedText>
        
        <ThemedText
          style={[
            styles.messageTime,
            message.isFromUser ? styles.userMessageTime : styles.agentMessageTime
          ]}
        >
          {message.timestamp}
        </ThemedText>
      </View>
      
      {message.quickReplies && (
        <View style={styles.quickRepliesContainer}>
          {message.quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyButton}
              onPress={() => handleQuickReply(reply)}
            >
              <ThemedText style={styles.quickReplyText}>{reply}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.agentMessageContainer]}>
      <View style={styles.agentInfo}>
        <View style={styles.agentAvatar}>
          <ThemedText style={styles.agentAvatarText}>
            {agent?.name.charAt(0) || 'S'}
          </ThemedText>
        </View>
      </View>
      
      <View style={[styles.messageBubble, styles.agentMessageBubble, styles.typingBubble]}>
        <View style={styles.typingIndicator}>
          <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
          <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
          <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {agent && (
            <>
              <ThemedText style={styles.headerTitle}>{agent.name}</ThemedText>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: agent.status === 'online' ? '#10B981' : '#F59E0B' }
                ]} />
                <ThemedText style={styles.statusText}>
                  {agent.status === 'online' ? 'Online' : 'Away'}
                </ThemedText>
              </View>
            </>
          )}
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {!isConnected && (
            <View style={styles.connectingContainer}>
              <ThemedText style={styles.connectingText}>
                Connecting you to a support agent...
              </ThemedText>
            </View>
          )}
          
          {messages.map(renderMessage)}
          
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: inputText.trim() ? 1 : 0.5 }
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  connectingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  agentMessageContainer: {
    alignItems: 'flex-start',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  agentAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageBubble: {
    backgroundColor: '#8B5CF6',
  },
  agentMessageBubble: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  agentMessageText: {
    color: '#374151',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  agentMessageTime: {
    color: '#9CA3AF',
  },
  typingBubble: {
    paddingVertical: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickReplyText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
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
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    maxHeight: 80,
  },
  attachButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});