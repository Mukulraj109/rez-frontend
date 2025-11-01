// Chat Header Component
// Enhanced header for chat screen with agent info and status

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { SupportAgent } from '@/types/supportChat.types';

interface ChatHeaderProps {
  agent: SupportAgent | null;
  isTyping?: boolean;
  onBack: () => void;
  onInfo?: () => void;
  onCall?: () => void;
}

export default function ChatHeader({
  agent,
  isTyping,
  onBack,
  onInfo,
  onCall,
}: ChatHeaderProps) {
  const getStatusColor = () => {
    if (!agent) return '#6B7280';

    switch (agent.status) {
      case 'online':
        return '#10B981';
      case 'away':
        return '#F59E0B';
      case 'busy':
        return '#EF4444';
      case 'offline':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    if (!agent) return 'Connecting...';
    if (isTyping) return 'typing...';

    switch (agent.status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return agent.status;
    }
  };

  return (
    <LinearGradient colors={['#10B981', '#059669']} style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.buttonInner}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.centerContent}>
          {agent ? (
            <>
              {agent.avatar ? (
                <Image source={{ uri: agent.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText style={styles.avatarText}>
                    {agent.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
              )}
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            </>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="chatbubbles" size={20} color="white" />
            </View>
          )}

          <View style={styles.textContent}>
            <ThemedText style={styles.name}>
              {agent ? agent.name : 'Support Agent'}
            </ThemedText>
            <View style={styles.statusRow}>
              {isTyping && (
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              )}
              <ThemedText
                style={[
                  styles.status,
                  isTyping && styles.statusTyping,
                ]}
              >
                {getStatusText()}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {onCall && agent && agent.status === 'online' && (
            <TouchableOpacity onPress={onCall} style={styles.actionButton}>
              <View style={styles.buttonInner}>
                <Ionicons name="call-outline" size={20} color="white" />
              </View>
            </TouchableOpacity>
          )}

          {onInfo && (
            <TouchableOpacity onPress={onInfo} style={styles.actionButton}>
              <View style={styles.buttonInner}>
                <Ionicons name="ellipsis-vertical" size={20} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  buttonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  statusDot: {
    position: 'absolute',
    left: 32,
    top: 32,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statusTyping: {
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    marginLeft: 4,
  },
});
