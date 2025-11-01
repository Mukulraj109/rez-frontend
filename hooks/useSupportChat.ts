// Use Support Chat Hook
// Complete state management and real-time functionality for live chat support

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { realTimeService, MESSAGE_TYPES } from '@/services/realTimeService';
import supportChatApi from '@/services/supportChatApi';
import type {
  SupportTicket,
  ChatMessage,
  SupportAgent,
  QueueInfo,
  FAQSuggestion,
  MessageAttachment,
  CreateTicketRequest,
  SendMessageRequest,
  ConversationRating,
  OfflineMessage,
  SupportChatState,
  SupportChatActions,
  UseSupportChatReturn,
  TypingIndicator,
  CallRequest,
  MessageDeliveryStatus,
} from '@/types/supportChat.types';

const STORAGE_KEYS = {
  CURRENT_TICKET: 'support_current_ticket',
  TICKET_HISTORY: 'support_ticket_history',
  OFFLINE_MESSAGES: 'support_offline_messages',
  DRAFT_MESSAGE: 'support_draft_message',
};

export function useSupportChat(initialTicketId?: string): UseSupportChatReturn {
  // State
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [ticketHistory, setTicketHistory] = useState<SupportTicket[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [assignedAgent, setAssignedAgent] = useState<SupportAgent | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showRating, setShowRating] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [faqSuggestions, setFaqSuggestions] = useState<FAQSuggestion[]>([]);

  const [offlineMessages, setOfflineMessages] = useState<OfflineMessage[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Refs
  const subscriptionIds = useRef<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== Network Status ====================

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      if (online && offlineMessages.length > 0) {
        // Process offline messages when back online
        processOfflineMessages();
      }
    });

    return () => unsubscribe();
  }, [offlineMessages]);

  // ==================== WebSocket Connection ====================

  useEffect(() => {
    initializeConnection();

    return () => {
      cleanup();
    };
  }, []);

  const initializeConnection = async () => {
    try {
      setConnecting(true);

      // Load stored data
      await loadStoredData();

      // Connect to WebSocket
      if (!realTimeService.getStatus().connected) {
        await realTimeService.connect();
      }

      // Setup event listeners
      setupRealTimeListeners();

      setConnected(true);
      setConnecting(false);
    } catch (error) {
      console.error('Failed to initialize support chat:', error);
      setConnecting(false);
      setMessagesError('Failed to connect to chat service');
    }
  };

  const setupRealTimeListeners = () => {
    // Connection status listeners
    realTimeService.on('connected', () => {

      setConnected(true);
      setReconnecting(false);

      // Rejoin ticket room if we have an active ticket
      if (currentTicket) {
        realTimeService.joinTicketRoom(currentTicket.id, 'current_user');
      }
    });

    realTimeService.on('disconnected', () => {

      setConnected(false);
    });

    realTimeService.on('reconnecting', () => {

      setReconnecting(true);
    });

    realTimeService.on('error', (error) => {
      console.error('Support chat error:', error);
      setMessagesError(error.error || 'Connection error');
    });

    // Subscribe to message events if we have a ticket
    if (currentTicket) {
      subscribeToTicketEvents(currentTicket.id);
    }
  };

  const subscribeToTicketEvents = (ticketId: string) => {
    // Unsubscribe from previous tickets
    unsubscribeAll();

    // Subscribe to all support chat events for this ticket
    const chatSubId = realTimeService.subscribeToSupportChat(ticketId, handleChatEvent);
    const typingSubId = realTimeService.subscribeToAgentTyping(ticketId, handleTypingEvent);

    subscriptionIds.current = [chatSubId, typingSubId];

    // Join the ticket room
    realTimeService.joinTicketRoom(ticketId, 'current_user');
  };

  const unsubscribeAll = () => {
    subscriptionIds.current.forEach((id) => {
      realTimeService.unsubscribe(id);
    });
    subscriptionIds.current = [];
  };

  const handleChatEvent = (event: any) => {
    const { type, data } = event;

    switch (type) {
      case MESSAGE_TYPES.SUPPORT_MESSAGE_RECEIVED:
        handleNewMessage(data);
        break;

      case MESSAGE_TYPES.SUPPORT_AGENT_ASSIGNED:
        handleAgentAssigned(data.agent);
        break;

      case MESSAGE_TYPES.SUPPORT_AGENT_STATUS_CHANGED:
        handleAgentStatusChanged(data);
        break;

      case MESSAGE_TYPES.SUPPORT_QUEUE_POSITION_UPDATED:
        handleQueueUpdate(data);
        break;

      case MESSAGE_TYPES.SUPPORT_TICKET_STATUS_CHANGED:
        handleTicketStatusChanged(data);
        break;

      case MESSAGE_TYPES.SUPPORT_CONVERSATION_TRANSFERRED:
        handleConversationTransferred(data);
        break;

      case MESSAGE_TYPES.SUPPORT_MESSAGE_DELIVERED:
        handleMessageDelivered(data);
        break;

      case MESSAGE_TYPES.SUPPORT_MESSAGE_READ:
        handleMessageRead(data);
        break;

      case MESSAGE_TYPES.SUPPORT_FAQ_SUGGESTED:
        handleFAQSuggested(data.suggestions);
        break;

      case MESSAGE_TYPES.SUPPORT_CALL_REQUEST:
        handleCallRequest(data);
        break;

      default:

    }
  };

  const handleTypingEvent = (event: any) => {
    const { type, data } = event;

    if (type === MESSAGE_TYPES.SUPPORT_AGENT_TYPING_START) {
      setIsAgentTyping(true);
    } else if (type === MESSAGE_TYPES.SUPPORT_AGENT_TYPING_STOP) {
      setIsAgentTyping(false);
    }
  };

  // ==================== Event Handlers ====================

  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prev) => {
      // Check if message already exists
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });

    // Auto-mark as read if chat is active
    if (document.hasFocus && document.hasFocus()) {
      markAsRead([message.id]);
    }
  };

  const handleAgentAssigned = (agent: SupportAgent) => {
    setAssignedAgent(agent);
    setQueueInfo(null); // Clear queue info once agent is assigned

    // Show system message
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      ticketId: currentTicket?.id || '',
      content: `${agent.name} has joined the conversation`,
      sender: 'system',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: true,
      delivered: true,
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const handleAgentStatusChanged = (data: { agentId: string; status: string }) => {
    if (assignedAgent && assignedAgent.id === data.agentId) {
      setAssignedAgent({
        ...assignedAgent,
        status: data.status as any,
      });
    }
  };

  const handleQueueUpdate = (queue: QueueInfo) => {
    setQueueInfo(queue);
  };

  const handleTicketStatusChanged = (data: { ticketId: string; status: string }) => {
    if (currentTicket && currentTicket.id === data.ticketId) {
      setCurrentTicket({
        ...currentTicket,
        status: data.status as any,
      });

      // If ticket is closed, show rating
      if (data.status === 'closed' || data.status === 'resolved') {
        setShowRating(true);
      }
    }
  };

  const handleConversationTransferred = (data: any) => {
    const { toAgentName } = data;

    // Update assigned agent
    setAssignedAgent(null);

    // Show system message
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      ticketId: currentTicket?.id || '',
      content: `Conversation transferred to ${toAgentName}`,
      sender: 'system',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: true,
      delivered: true,
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const handleMessageDelivered = (status: MessageDeliveryStatus) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === status.messageId ? { ...msg, delivered: true } : msg
      )
    );
  };

  const handleMessageRead = (data: { messageId: string }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const handleFAQSuggested = (suggestions: FAQSuggestion[]) => {
    setFaqSuggestions(suggestions);
    if (suggestions.length > 0) {
      setShowFAQ(true);
    }
  };

  const handleCallRequest = (callRequest: CallRequest) => {
    Alert.alert(
      'Call Request',
      `The agent would like to start a ${callRequest.type} call with you.`,
      [
        {
          text: 'Decline',
          style: 'cancel',
          onPress: () => rejectCall(callRequest.id),
        },
        {
          text: 'Accept',
          onPress: () => acceptCall(callRequest.id),
        },
      ]
    );
  };

  // ==================== Ticket Management ====================

  const createTicket = async (request: CreateTicketRequest): Promise<SupportTicket | null> => {
    try {
      const response = await supportChatApi.createTicket(request);

      if (response && response.ticket) {
        setCurrentTicket(response.ticket);
        setMessages(response.ticket.messages || []);

        if (response.queueInfo) {
          setQueueInfo(response.queueInfo);
        }

        // Save to storage
        await AsyncStorage.setItem(
          STORAGE_KEYS.CURRENT_TICKET,
          JSON.stringify(response.ticket)
        );
        
        // Subscribe to real-time events
        subscribeToTicketEvents(response.ticket.id);

        return response.ticket;
      }

      return null;
    } catch (error) {
      console.error('Error creating ticket:', error);
      setMessagesError('Failed to create support ticket');
      return null;
    }
  };

  const closeTicket = async (ticketId: string, reason?: string): Promise<boolean> => {
    try {
      const success = await supportChatApi.closeTicket(ticketId, {
        ticketId,
        reason,
        requestTranscript: true,
      });

      if (success) {
        setShowRating(true);
      }

      return success;
    } catch (error) {
      console.error('Error closing ticket:', error);
      return false;
    }
  };

  const reopenTicket = async (ticketId: string): Promise<boolean> => {
    try {
      const success = await supportChatApi.reopenTicket(ticketId);

      if (success && currentTicket) {
        setCurrentTicket({
          ...currentTicket,
          status: 'open',
        });
      }

      return success;
    } catch (error) {
      console.error('Error reopening ticket:', error);
      return false;
    }
  };

  // ==================== Messaging ====================

  const sendMessage = async (
    content: string,
    messageAttachments?: MessageAttachment[]
  ): Promise<boolean> => {
    if (!currentTicket) {
      console.error('No active ticket');
      return false;
    }

    if (!content.trim() && (!messageAttachments || messageAttachments.length === 0)) {
      return false;
    }

    const messageRequest: SendMessageRequest = {
      ticketId: currentTicket.id,
      content: content.trim(),
      type: messageAttachments && messageAttachments.length > 0 ? 'image' : 'text',
      attachments: messageAttachments || attachments,
    };

    // If offline, queue the message
    if (!isOnline) {
      return queueOfflineMessage(messageRequest);
    }

    try {
      // Optimistically add message to UI
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        ticketId: currentTicket.id,
        content: messageRequest.content,
        sender: 'user',
        type: messageRequest.type || 'text',
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
        attachments: messageRequest.attachments,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setInputText('');
      setAttachments([]);

      // Send to backend
      const response = await supportChatApi.sendMessage(messageRequest);

      if (response && response.message) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? response.message : msg
          )
        );
        
        // Stop typing indicator
        stopTyping();

        return true;
      } else {
        // Remove optimistic message on failure
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessagesError('Failed to send message');
      return false;
    }
  };

  const uploadAttachment = async (
    file: File | Blob,
    type: string
  ): Promise<MessageAttachment | null> => {
    try {
      const response = await supportChatApi.uploadAttachment(
        file,
        type,
        currentTicket?.id
      );
      
      if (response && response.attachment) {
        return response.attachment;
      }

      return null;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (!currentTicket) return false;

    try {
      const success = await supportChatApi.deleteMessage(
        currentTicket.id,
        messageId
      );
      
      if (success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }

      return success;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  // ==================== Real-time Actions ====================

  const startTyping = useCallback(() => {
    if (!currentTicket || !connected) return;

    realTimeService.notifyTypingStarted(currentTicket.id, 'current_user');

    // Auto-stop typing after 3 seconds of no activity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000) as any;
  }, [currentTicket, connected]);

  const stopTyping = useCallback(() => {
    if (!currentTicket || !connected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    realTimeService.notifyTypingStopped(currentTicket.id, 'current_user');
  }, [currentTicket, connected]);

  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!currentTicket) return;

      supportChatApi.markAsRead(currentTicket.id, messageIds);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
    },
    [currentTicket]
  );

  // ==================== Agent Interaction ====================

  const requestAgent = async (): Promise<boolean> => {
    if (!currentTicket) return false;

    try {
      const agent = await supportChatApi.requestAgent(currentTicket.id);

      if (agent) {
        setAssignedAgent(agent);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting agent:', error);
      return false;
    }
  };

  const transferToAgent = async (
    agentId: string,
    reason?: string
  ): Promise<boolean> => {
    if (!currentTicket) return false;

    try {
      const transfer = await supportChatApi.transferAgent(
        currentTicket.id,
        agentId,
        reason
      );
      
      return transfer !== null;
    } catch (error) {
      console.error('Error transferring to agent:', error);
      return false;
    }
  };

  // ==================== Rating ====================

  const rateConversation = async (
    rating: ConversationRating,
    comment?: string
  ): Promise<boolean> => {
    if (!currentTicket) return false;

    try {
      const success = await supportChatApi.rateConversation({
        ticketId: currentTicket.id,
        rating,
        comment,
      });

      if (success) {
        setCurrentTicket({
          ...currentTicket,
          rating,
          ratingComment: comment,
        });
        setShowRating(false);
      }

      return success;
    } catch (error) {
      console.error('Error rating conversation:', error);
      return false;
    }
  };

  // ==================== FAQ ====================

  const searchFAQ = async (query: string): Promise<FAQSuggestion[]> => {
    try {
      const response = await supportChatApi.searchFAQ({ query });

      if (response && response.suggestions) {
        setFaqSuggestions(response.suggestions);
        return response.suggestions;
      }

      return [];
    } catch (error) {
      console.error('Error searching FAQ:', error);
      return [];
    }
  };

  const markFAQHelpful = async (faqId: string, helpful: boolean): Promise<boolean> => {
    try {
      return await supportChatApi.markFAQHelpful(faqId, helpful);
    } catch (error) {
      console.error('Error marking FAQ helpful:', error);
      return false;
    }
  };

  // ==================== Calls ====================

  const requestCall = async (type: 'voice' | 'video'): Promise<boolean> => {
    if (!currentTicket) return false;

    try {
      const callRequest = await supportChatApi.requestCall(currentTicket.id, type);
      return callRequest !== null;
    } catch (error) {
      console.error('Error requesting call:', error);
      return false;
    }
  };

  const acceptCall = async (callId: string): Promise<boolean> => {
    try {
      return await supportChatApi.acceptCall(callId);
    } catch (error) {
      console.error('Error accepting call:', error);
      return false;
    }
  };

  const rejectCall = async (callId: string): Promise<boolean> => {
    try {
      return await supportChatApi.rejectCall(callId);
    } catch (error) {
      console.error('Error rejecting call:', error);
      return false;
    }
  };

  // ==================== History ====================

  const loadTicketHistory = async (page: number = 1): Promise<void> => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const response = await supportChatApi.getTicketHistory(page, 20);

      if (response && response.tickets) {
        setTicketHistory(response.tickets);

        // Cache to storage
        await AsyncStorage.setItem(
          STORAGE_KEYS.TICKET_HISTORY,
          JSON.stringify(response.tickets)
        );
      }
    } catch (error) {
      console.error('Error loading ticket history:', error);
      setHistoryError('Failed to load ticket history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadMessages = async (
    ticketId: string,
    before?: string
  ): Promise<void> => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);

      const response = await supportChatApi.getMessages(ticketId, before, 50);

      if (response && response.messages) {
        if (before) {
          // Prepend older messages
          setMessages((prev) => [...response.messages, ...prev]);
        } else {
          // Set initial messages
          setMessages(response.messages);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessagesError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // ==================== Offline Support ====================

  const queueOfflineMessage = async (
    request: SendMessageRequest
  ): Promise<boolean> => {
    const offlineMsg: OfflineMessage = {
      id: `offline_${Date.now()}`,
      ticketId: request.ticketId,
      message: {
        id: `temp_${Date.now()}`,
        ticketId: request.ticketId,
        content: request.content,
        sender: 'user',
        type: request.type || 'text',
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
        attachments: request.attachments,
      },
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'queued',
    };

    setOfflineMessages((prev) => [...prev, offlineMsg]);

    // Save to storage
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_MESSAGES,
      JSON.stringify([...offlineMessages, offlineMsg])
    );
    
    return true;
  };

  const processOfflineMessages = async () => {
    if (offlineMessages.length === 0) return;

    for (const offlineMsg of offlineMessages) {
      if (offlineMsg.status === 'queued' || offlineMsg.status === 'failed') {
        try {
          const request: SendMessageRequest = {
            ticketId: offlineMsg.ticketId,
            content: offlineMsg.message.content,
            type: offlineMsg.message.type,
            attachments: offlineMsg.message.attachments,
          };

          const response = await supportChatApi.sendMessage(request);

          if (response && response.message) {
            // Remove from offline queue
            setOfflineMessages((prev) =>
              prev.filter((msg) => msg.id !== offlineMsg.id)
            );
          } else {
            // Mark as failed
            setOfflineMessages((prev) =>
              prev.map((msg) =>
                msg.id === offlineMsg.id
                  ? { ...msg, status: 'failed' as const, retryCount: msg.retryCount + 1 }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error('Failed to send offline message:', error);
        }
      }
    }

    // Update storage
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_MESSAGES,
      JSON.stringify(offlineMessages)
    );
  };

  // ==================== Connection Management ====================

  const connect = async (): Promise<void> => {
    await realTimeService.connect();
  };

  const disconnect = (): void => {
    if (currentTicket) {
      realTimeService.leaveTicketRoom(currentTicket.id, 'current_user');
    }
    unsubscribeAll();
    realTimeService.disconnect();
    setConnected(false);
  };

  const reconnect = async (): Promise<void> => {
    disconnect();
    await connect();
  };

  // ==================== UI Helpers ====================

  const clearInput = () => {
    setInputText('');
    setAttachments([]);
  };

  const addAttachment = (attachment: MessageAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  const toggleRating = () => {
    setShowRating((prev) => !prev);
  };

  const toggleFAQ = () => {
    setShowFAQ((prev) => !prev);
  };

  // ==================== Storage & Persistence ====================

  const loadStoredData = async () => {
    try {
      // Load current ticket
      const storedTicket = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TICKET);
      if (storedTicket) {
        const ticket = JSON.parse(storedTicket);
        setCurrentTicket(ticket);
        if (ticket.messages) {
          setMessages(ticket.messages);
        }
      }

      // Load ticket history
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEYS.TICKET_HISTORY);
      if (storedHistory) {
        setTicketHistory(JSON.parse(storedHistory));
      }

      // Load offline messages
      const storedOffline = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MESSAGES);
      if (storedOffline) {
        setOfflineMessages(JSON.parse(storedOffline));
      }

      // Load draft message
      const storedDraft = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE);
      if (storedDraft) {
        setInputText(storedDraft);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  // Auto-save draft message
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (inputText) {
        AsyncStorage.setItem(STORAGE_KEYS.DRAFT_MESSAGE, inputText);
      } else {
        AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_MESSAGE);
      }
    }, 1000) as any;

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [inputText]);

  // ==================== Cleanup ====================

  const cleanup = () => {
    if (currentTicket) {
      realTimeService.leaveTicketRoom(currentTicket.id, 'current_user');
    }

    unsubscribeAll();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  // Load initial ticket if provided
  useEffect(() => {
    if (initialTicketId && !currentTicket) {
      supportChatApi.getTicket(initialTicketId).then((ticket) => {
        if (ticket) {
          setCurrentTicket(ticket);
          setMessages(ticket.messages || []);
          subscribeToTicketEvents(ticket.id);
        }
      });
    }
  }, [initialTicketId]);

  // ==================== Return ====================

  return {
    // State
    currentTicket,
    messages,
    messagesLoading,
    messagesError,
    ticketHistory,
    historyLoading,
    historyError,
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
    offlineMessages,
    isOnline,

    // Actions
    createTicket,
    closeTicket,
    reopenTicket,
    sendMessage,
    uploadAttachment,
    deleteMessage,
    startTyping,
    stopTyping,
    markAsRead,
    requestAgent,
    transferToAgent,
    rateConversation,
    searchFAQ,
    markFAQHelpful,
    requestCall,
    acceptCall,
    rejectCall,
    loadTicketHistory,
    loadMessages,
    connect,
    disconnect,
    reconnect,
    setInputText,
    clearInput,
    addAttachment,
    removeAttachment,
    toggleRating,
    toggleFAQ,
  };
}

export default useSupportChat;
