import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from './Toast';

export interface ToastConfig {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  actions?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel';
  }>;
}

let showToastGlobal: ((config: Omit<ToastConfig, 'id'>) => void) | null = null;

export function showToast(config: Omit<ToastConfig, 'id'>) {
  if (showToastGlobal) {
    showToastGlobal(config);
  } else {
    console.warn('Toast manager not initialized');
  }
}

export default function ToastManager() {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const addToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...config, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Set global reference
  React.useEffect(() => {
    showToastGlobal = addToast;
    return () => {
      showToastGlobal = null;
    };
  }, [addToast]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          actions={toast.actions}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
