import { useState, useEffect, useCallback } from 'react';

export interface GameStats {
  gamesPlayed: number;
  coinsEarned: number;
  highScore: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  reward: string;
  isLocked: boolean;
  requiredLevel?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  reward: number;
  expiresAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface PlayState {
  stats: GameStats;
  games: Game[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

// Mock data for development
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Lucky Spin',
    description: 'Spin to win coins',
    icon: 'dice',
    iconColor: '#8B5CF6',
    reward: 'Up to 50 coins',
    isLocked: false,
  },
  {
    id: '2',
    title: 'Quiz Challenge',
    description: 'Test your knowledge',
    icon: 'trophy',
    iconColor: '#F59E0B',
    reward: 'Up to 100 coins',
    isLocked: false,
  },
  {
    id: '3',
    title: 'Memory Game',
    description: 'Match the patterns',
    icon: 'grid',
    iconColor: '#10B981',
    reward: 'Up to 75 coins',
    isLocked: true,
    requiredLevel: 2,
  },
  {
    id: '4',
    title: 'Word Puzzle',
    description: 'Find hidden words',
    icon: 'text',
    iconColor: '#06B6D4',
    reward: 'Up to 80 coins',
    isLocked: true,
    requiredLevel: 3,
  },
];

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Complete 3 Games',
    description: 'Play any 3 games today',
    icon: 'calendar',
    iconColor: '#8B5CF6',
    progress: 0,
    maxProgress: 3,
    isCompleted: false,
    reward: 25,
    expiresAt: '2025-08-20T23:59:59Z',
  },
  {
    id: '2',
    title: 'Score 500+ Points',
    description: 'Achieve high score in any game',
    icon: 'star',
    iconColor: '#F59E0B',
    progress: 0,
    maxProgress: 500,
    isCompleted: false,
    reward: 50,
    expiresAt: '2025-08-20T23:59:59Z',
  },
  {
    id: '3',
    title: 'Win 5 Rounds',
    description: 'Win 5 consecutive game rounds',
    icon: 'trophy',
    iconColor: '#10B981',
    progress: 0,
    maxProgress: 5,
    isCompleted: false,
    reward: 75,
    expiresAt: '2025-08-20T23:59:59Z',
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', playerName: 'John Doe', score: 2450, rank: 1 },
  { id: '2', playerName: 'Jane Smith', score: 2100, rank: 2 },
  { id: '3', playerName: 'Mike Johnson', score: 1890, rank: 3 },
  { id: '4', playerName: 'Sarah Wilson', score: 1750, rank: 4 },
  { id: '5', playerName: 'Tom Brown', score: 1620, rank: 5 },
];

export function usePlayData() {
  const [state, setState] = useState<PlayState>({
    stats: {
      gamesPlayed: 0,
      coinsEarned: 0,
      highScore: 0,
    },
    games: [],
    challenges: [],
    leaderboard: [],
    loading: true,
    error: null,
  });

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch from an API
      setState(prev => ({
        ...prev,
        games: mockGames,
        challenges: mockChallenges,
        leaderboard: mockLeaderboard,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load play data',
      }));
    }
  }, []);

  // Update game stats
  const updateStats = useCallback((newStats: Partial<GameStats>) => {
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, ...newStats },
    }));
  }, []);

  // Play game
  const playGame = useCallback(async (gameId: string) => {
    const game = state.games.find(g => g.id === gameId);
    if (!game || game.isLocked) return false;

    try {
      // Simulate game play
      const score = Math.floor(Math.random() * 1000) + 100;
      const coins = Math.floor(Math.random() * 50) + 10;
      
      // Update stats
      updateStats({
        gamesPlayed: state.stats.gamesPlayed + 1,
        coinsEarned: state.stats.coinsEarned + coins,
        highScore: Math.max(state.stats.highScore, score),
      });

      // Update challenges progress
      setState(prev => ({
        ...prev,
        challenges: prev.challenges.map(challenge => {
          if (challenge.id === '1' && !challenge.isCompleted) {
            const newProgress = Math.min(challenge.progress + 1, challenge.maxProgress);
            return {
              ...challenge,
              progress: newProgress,
              isCompleted: newProgress >= challenge.maxProgress,
            };
          }
          if (challenge.id === '2' && !challenge.isCompleted && score >= 500) {
            return {
              ...challenge,
              progress: score,
              isCompleted: true,
            };
          }
          return challenge;
        }),
      }));

      return { score, coins };
    } catch (error) {
      console.error('Failed to play game:', error);
      return false;
    }
  }, [state.stats, state.games, updateStats]);

  // Complete challenge
  const completeChallenge = useCallback((challengeId: string) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, isCompleted: true, progress: challenge.maxProgress }
          : challenge
      ),
    }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    state,
    actions: {
      playGame,
      completeChallenge,
      updateStats,
      refresh,
    },
  };
}