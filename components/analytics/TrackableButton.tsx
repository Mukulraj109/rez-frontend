/**
 * Trackable Button Component
 *
 * Button with built-in analytics tracking
 */

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useComprehensiveAnalytics } from '@/hooks/useComprehensiveAnalytics';

interface TrackableButtonProps extends TouchableOpacityProps {
  eventName: string;
  eventProperties?: Record<string, any>;
  onPress?: () => void;
  trackOnPress?: boolean;
}

export const TrackableButton: React.FC<TrackableButtonProps> = ({
  eventName,
  eventProperties = {},
  onPress,
  trackOnPress = true,
  children,
  ...touchableProps
}) => {
  const { trackEvent } = useComprehensiveAnalytics();

  const handlePress = () => {
    if (trackOnPress) {
      trackEvent(eventName, {
        ...eventProperties,
        timestamp: Date.now(),
      });
    }

    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity {...touchableProps} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};

export default TrackableButton;
