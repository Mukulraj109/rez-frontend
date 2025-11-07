import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface EarningsUpdate {
  earnings: {
    totalEarned: number;
    breakdown: {
      projects: number;
      referrals: number;
      shareAndEarn: number;
      spin: number;
    };
  };
  timestamp: string;
}

interface ProjectStatusUpdate {
  status: {
    completeNow: number;
    inReview: number;
    completed: number;
  };
  timestamp: string;
}

interface BalanceUpdate {
  balance: number;
  pendingBalance: number;
  timestamp: string;
}

interface NewTransaction {
  transaction: any;
  timestamp: string;
}

export function useEarningsSocket() {
  const { socket, state } = useSocket();
  const { state: authState } = useAuth();

  // Join earnings room when socket is connected and user is authenticated
  useEffect(() => {
    if (socket && state.connected && authState.user) {
      const userId = authState.user._id || authState.user.id;
      if (userId) {
        socket.emit('join-earnings-room', userId.toString());
        console.log('✅ [EARNINGS SOCKET] Joined earnings room for user:', userId);
      }

      return () => {
        if (socket && userId) {
          socket.emit('leave-earnings-room', userId.toString());
          console.log('✅ [EARNINGS SOCKET] Left earnings room for user:', userId);
        }
      };
    }
  }, [socket, state.connected, authState.user]);

  // Subscribe to earnings updates
  const onEarningsUpdate = useCallback((callback: (data: EarningsUpdate) => void) => {
    if (!socket) return () => {};

    socket.on('earnings-update', callback);

    return () => {
      socket.off('earnings-update', callback);
    };
  }, [socket]);

  // Subscribe to project status updates
  const onProjectStatusUpdate = useCallback((callback: (data: ProjectStatusUpdate) => void) => {
    if (!socket) return () => {};

    socket.on('project-status-update', callback);

    return () => {
      socket.off('project-status-update', callback);
    };
  }, [socket]);

  // Subscribe to balance updates
  const onBalanceUpdate = useCallback((callback: (data: BalanceUpdate) => void) => {
    if (!socket) return () => {};

    socket.on('balance-update', callback);

    return () => {
      socket.off('balance-update', callback);
    };
  }, [socket]);

  // Subscribe to new transactions
  const onNewTransaction = useCallback((callback: (data: NewTransaction) => void) => {
    if (!socket) return () => {};

    socket.on('new-transaction', callback);

    return () => {
      socket.off('new-transaction', callback);
    };
  }, [socket]);

  // Subscribe to earnings notifications
  const onEarningsNotification = useCallback((callback: (data: { notification: any; timestamp: string }) => void) => {
    if (!socket) return () => {};

    socket.on('earnings-notification', callback);

    return () => {
      socket.off('earnings-notification', callback);
    };
  }, [socket]);

  return {
    connected: state.connected,
    onEarningsUpdate,
    onProjectStatusUpdate,
    onBalanceUpdate,
    onNewTransaction,
    onEarningsNotification,
  };
}

