// Live Chat Support Page (Full Implementation)
// Real-time chat support with complete functionality

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import useSupportChat from '@/hooks/useSupportChat';
import AgentCard from '@/components/support/AgentCard';
import QueuePosition from '@/components/support/QueuePosition';
import ChatRating from '@/components/support/ChatRating';
import FAQSuggestions from '@/components/support/FAQSuggestions';
import TransferNotice from '@/components/support/TransferNotice';
import ChatHeader from '@/components/support/ChatHeader';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { IssueCategory } from '@/types/supportChat.types';

export default function SupportChatPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string; category?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    currentTicket,
    messages,
    messagesLoading,
    messagesError,
    assignedAgent,
    isAgentTyping,
    queueInfo,
    connected,
    connecting,
    reconnecting,
    inputText,
    attachments,
    showRating,
    showFAQ,
    faqSuggestions,
    isOnline,
    createTicket,
    sendMessage,
    uploadAttachment,
    startTyping,
    stopTyping,
    markAsRead,
    rateConversation,
    markFAQHelpful,
    requestCall,
    setInputText,
    clearInput,
    addAttachment,
    removeAttachment,
    toggleRating,
    toggleFAQ,
  } = useSupportChat(params.ticketId);

  const [showOptions, setShowOptions] = useState(false);
  const [initializingTicket, setInitializingTicket] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Initialize ticket if we don't have one
  useEffect(() => {
    if (!currentTicket && !params.ticketId && !initializingTicket) {
      handleInitializeTicket();
    }
  }, []);

  const handleInitializeTicket = async () => {
    setInitializingTicket(true);

    const category = (params.category as IssueCategory) || 'general_inquiry';

    const ticket = await createTicket({
      subject: 'Support Request',
      category,
      priority: 'medium',
      initialMessage: 'Hello, I need help.',
    });

    if (!ticket) {
      Alert.alert('Error', 'Failed to create support ticket. Please try again.');
      router.back();
    }

    setInitializingTicket(false);
  };

  const handleBackPress = () => {
    if (currentTicket && currentTicket.status === 'open') {
      Alert.alert(
        'End Chat',
        'Are you sure you want to end this chat session? Your conversation will be saved.',
        [
          { text: 'Continue Chat', style: 'cancel' },
          {
            text: 'End Chat',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    stopTyping();
    const success = await sendMessage(inputText, attachments.length > 0 ? attachments : undefined);

    if (!success && !isOnline) {
      Alert.alert(
        'Offline',
        'You are offline. Your message will be sent when you reconnect.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (text.length > 0 && connected && currentTicket) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const attachment = await uploadAttachment(
        {
          uri: asset.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any,
        'image'
      );
      if (attachment) {
        addAttachment(attachment);
      }
    }

    setShowOptions(false);
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const file = result.assets[0];
      const attachment = await uploadAttachment(
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any,
        'file'
      );
      if (attachment) {
        addAttachment(attachment);
      }
    }

    setShowOptions(false);
  };

  const handleCallRequest = () => {
    Alert.alert('Voice Call', 'Request a voice call with the agent?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: async () => {
          const success = await requestCall('voice');
          if (success) {
            Alert.alert('Call Request Sent', 'The agent will call you shortly.');
          }
        },
      },
    ]);
  };

  const handleRatingSubmit = (rating: any, comment?: string) => {
    rateConversation(rating, comment);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (initializingTicket || connecting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <ThemedText style={styles.loadingText}>
          {initializingTicket ? 'Creating chat session...' : 'Connecting to support...'}
        </ThemedText>
      </View>
    );
  }

  if (messagesError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
        <ThemedText style={styles.errorMessage}>{messagesError}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={handleInitializeTicket}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

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
        <ChatHeader
          agent={assignedAgent}
          isTyping={isAgentTyping}
          onBack={handleBackPress}
          onCall={handleCallRequest}
          onInfo={() => {}}
        />

        {/* Connection Status */}
        {!connected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={16} color="white" />
            <ThemedText style={styles.offlineBannerText}>
              {reconnecting ? 'Reconnecting...' : 'Offline - Messages will be sent when connected'}
            </ThemedText>
          </View>
        )}

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="chatbubbles" size={32} color="#10B981" />
            </View>
            <ThemedText style={styles.welcomeTitle}>Welcome to Live Chat Support</ThemedText>
            <ThemedText style={styles.welcomeText}>
              {queueInfo
                ? `You're in queue position ${queueInfo.position}. Average wait time is ${Math.round(queueInfo.estimatedWaitTime / 60)} minutes.`
                : assignedAgent
                ? `${assignedAgent.name} is here to help you. Feel free to ask any questions.`
                : 'Connecting you with a support agent...'}
            </ThemedText>
          </View>

          {/* Queue Position */}
          {queueInfo && !assignedAgent && <QueuePosition queueInfo={queueInfo} />}

          {/* Agent Card */}
          {assignedAgent && !queueInfo && (
            <View style={styles.agentCardContainer}>
              <AgentCard agent={assignedAgent} showDetails />
            </View>
          )}

          {/* FAQ Suggestions */}
          {showFAQ && faqSuggestions.length > 0 && (
            <FAQSuggestions
              suggestions={faqSuggestions}
              onHelpful={markFAQHelpful}
              onClose={toggleFAQ}
            />
          )}

          {/* Messages */}
          {messagesLoading && messages.length === 0 ? (
            <View style={styles.messagesLoading}>
              <ActivityIndicator size="small" color="#10B981" />
              <ThemedText style={styles.messagesLoadingText}>Loading messages...</ThemedText>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userMessage : styles.agentMessage,
                  msg.sender === 'system' && styles.systemMessage,
                ]}
              >
                {msg.sender === 'agent' && assignedAgent && (
                  <View style={styles.agentInfo}>
                    <View style={styles.smallAgentAvatar}>
                      <ThemedText style={styles.smallAgentInitial}>
                        {assignedAgent.name.charAt(0)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.agentName}>{assignedAgent.name}</ThemedText>
                  </View>
                )}

                {msg.sender === 'system' ? (
                  <View style={styles.systemMessageContent}>
                    <Ionicons name="information-circle" size={16} color="#6B7280" />
                    <ThemedText style={styles.systemMessageText}>{msg.content}</ThemedText>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.messageContent,
                      msg.sender === 'user' ? styles.userMessageContent : styles.agentMessageContent,
                    ]}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <View style={styles.attachments}>
                        {msg.attachments.map((att) => (
                          <Image
                            key={att.id}
                            source={{ uri: att.url }}
                            style={styles.attachmentImage}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    )}

                    <ThemedText
                      style={[
                        styles.messageText,
                        msg.sender === 'user' ? styles.userMessageText : styles.agentMessageText,
                      ]}
                    >
                      {msg.content}
                    </ThemedText>

                    <View style={styles.messageFooter}>
                      <ThemedText
                        style={[
                          styles.messageTime,
                          msg.sender === 'user' ? styles.userMessageTime : styles.agentMessageTime,
                        ]}
                      >
                        {formatTime(msg.timestamp)}
                      </ThemedText>

                      {msg.sender === 'user' && (
                        <View style={styles.messageStatus}>
                          {msg.read ? (
                            <Ionicons name="checkmark-done" size={14} color="rgba(255, 255, 255, 0.8)" />
                          ) : msg.delivered ? (
                            <Ionicons name="checkmark" size={14} color="rgba(255, 255, 255, 0.8)" />
                          ) : null}
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))
          )}

          {/* Typing Indicator */}
          {isAgentTyping && assignedAgent && (
            <View style={styles.typingIndicator}>
              <View style={styles.smallAgentAvatar}>
                <ThemedText style={styles.smallAgentInitial}>
                  {assignedAgent.name.charAt(0)}
                </ThemedText>
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
        </ScrollView>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            style={styles.attachmentsPreview}
            contentContainerStyle={styles.attachmentsPreviewContent}
            showsHorizontalScrollIndicator={false}
          >
            {attachments.map((att) => (
              <View key={att.id} style={styles.attachmentPreview}>
                {att.type === 'image' && att.thumbnail ? (
                  <Image source={{ uri: att.thumbnail }} style={styles.attachmentPreviewImage} />
                ) : (
                  <View style={styles.attachmentPreviewFile}>
                    <Ionicons name="document" size={24} color="#6B7280" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => removeAttachment(att.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Ionicons
              name={showOptions ? 'close-circle' : 'add-circle'}
              size={28}
              color={showOptions ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && attachments.length === 0 && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() && attachments.length === 0}
          >
            <LinearGradient
              colors={(inputText.trim() || attachments.length > 0 ? ['#10B981', '#059669'] : ['#E5E7EB', '#D1D5DB']) as any}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Attachment Options */}
        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.option} onPress={handleImagePick}>
              <Ionicons name="image" size={24} color="#3B82F6" />
              <ThemedText style={styles.optionText}>Photo</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleFilePick}>
              <Ionicons name="document" size={24} color="#8B5CF6" />
              <ThemedText style={styles.optionText}>File</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={toggleFAQ}>
              <Ionicons name="help-circle" size={24} color="#F59E0B" />
              <ThemedText style={styles.optionText}>FAQ</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Rating Modal */}
      <ChatRating
        visible={showRating}
        onClose={toggleRating}
        onSubmit={handleRatingSubmit}
        agentName={assignedAgent?.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
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
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  agentCardContainer: {
    marginBottom: 16,
  },
  messagesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  messagesLoadingText: {
    fontSize: 14,
    color: '#6B7280',
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
  systemMessage: {
    alignItems: 'center',
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
  systemMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
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
  attachments: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  agentMessageText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
  messageStatus: {
    marginLeft: 4,
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
  attachmentsPreview: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
  },
  attachmentsPreviewContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  attachmentPreview: {
    position: 'relative',
  },
  attachmentPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  attachmentPreviewFile: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
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
  optionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 24,
  },
  option: {
    alignItems: 'center',
    gap: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});
