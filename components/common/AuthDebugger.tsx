import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebugger() {
  const { state, actions } = useAuth();
  const [storageData, setStorageData] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  const checkStorageData = async () => {
    try {
      const [token, refreshToken, user] = await AsyncStorage.multiGet([
        'access_token',
        'refresh_token', 
        'auth_user'
      ]);
      
      // Safely parse user data
      let parsedUser = null;
      if (user[1] && user[1] !== 'undefined') {
        try {
          parsedUser = JSON.parse(user[1]);
        } catch (parseError) {
          console.error('AuthDebugger: Error parsing user data:', parseError);
          parsedUser = { error: 'Failed to parse user data' };
        }
      }

      setStorageData({
        accessToken: token[1] ? 'exists' : 'missing',
        refreshToken: refreshToken[1] ? 'exists' : 'missing',
        user: parsedUser
      });
    } catch (error) {
      console.error('Error checking storage:', error);
    }
  };

  useEffect(() => {
    checkStorageData();
  }, [state]);

  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.toggleText}>🔍</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Auth Debugger</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auth State:</Text>
        <Text style={styles.item}>Loading: {state.isLoading ? '✅' : '❌'}</Text>
        <Text style={styles.item}>Authenticated: {state.isAuthenticated ? '✅' : '❌'}</Text>
        <Text style={styles.item}>Has User: {state.user ? '✅' : '❌'}</Text>
        <Text style={styles.item}>User ID: {state.user?.id || 'none'}</Text>
        <Text style={styles.item}>Onboarded: {state.user?.isOnboarded ? '✅' : '❌'}</Text>
        <Text style={styles.item}>Error: {state.error || 'none'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Data:</Text>
        <Text style={styles.item}>Access Token: {storageData.accessToken}</Text>
        <Text style={styles.item}>Refresh Token: {storageData.refreshToken}</Text>
        <Text style={styles.item}>Stored User: {storageData.user?.id || 'none'}</Text>
      </View>

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={checkStorageData}
      >
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.checkAuthButton}
        onPress={actions.checkAuthStatus}
      >
        <Text style={styles.checkAuthText}>🔍 Check Auth Status</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    borderRadius: 10,
    minWidth: 300,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#8B5CF6',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  item: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  refreshButton: {
    backgroundColor: '#8B5CF6',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
  },
  refreshText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkAuthButton: {
    backgroundColor: '#10B981',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkAuthText: {
    color: 'white',
    fontWeight: 'bold',
  },
});