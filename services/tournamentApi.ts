// Tournament API Service
// Handles all tournament-related API calls

import apiClient from './apiClient';

export interface TournamentPrize {
  rank: number;
  coins: number;
  badge?: string;
  description: string;
}

export interface Tournament {
  _id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  gameType: 'quiz' | 'memory_match' | 'coin_hunt' | 'guess_price' | 'mixed';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  entryFee: number;
  maxParticipants: number;
  minParticipants: number;
  prizes: TournamentPrize[];
  rules: string[];
  totalPrizePool: number;
  image?: string;
  featured: boolean;
  participantsCount?: number;
}

export interface TournamentLeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  gamesPlayed: number;
  joinedAt: string;
  lastPlayedAt?: string;
}

export interface UserTournament {
  _id: string;
  name: string;
  type: string;
  gameType: string;
  status: string;
  startDate: string;
  endDate: string;
  userScore: number;
  userRank: number;
  totalParticipants: number;
  prizes: TournamentPrize[];
}

export interface UserRankInTournament {
  rank: number;
  score: number;
  gamesPlayed: number;
  totalParticipants: number;
  prize: TournamentPrize | null;
  isWinner: boolean;
}

class TournamentApi {
  // Get all tournaments
  async getTournaments(
    status?: 'upcoming' | 'active' | 'completed',
    type?: 'daily' | 'weekly' | 'monthly' | 'special',
    limit: number = 20,
    offset: number = 0
  ) {
    return apiClient.get<Tournament[]>('/tournaments', { status, type, limit, offset });
  }

  // Get featured tournaments
  async getFeaturedTournaments(limit: number = 5) {
    return apiClient.get<Tournament[]>('/tournaments/featured', { limit });
  }

  // Get tournament by ID
  async getTournamentById(id: string) {
    return apiClient.get<Tournament>(`/tournaments/${id}`);
  }

  // Join tournament
  async joinTournament(tournamentId: string) {
    return apiClient.post<{
      tournamentId: string;
      name: string;
      participantsCount: number;
    }>(`/tournaments/${tournamentId}/join`);
  }

  // Leave tournament
  async leaveTournament(tournamentId: string) {
    return apiClient.post<void>(`/tournaments/${tournamentId}/leave`);
  }

  // Get tournament leaderboard
  async getTournamentLeaderboard(tournamentId: string, limit: number = 100) {
    return apiClient.get<TournamentLeaderboardEntry[]>(
      `/tournaments/${tournamentId}/leaderboard`,
      { limit }
    );
  }

  // Get user's rank in tournament
  async getMyRankInTournament(tournamentId: string) {
    return apiClient.get<UserRankInTournament>(`/tournaments/${tournamentId}/my-rank`);
  }

  // Get user's tournaments
  async getMyTournaments() {
    return apiClient.get<UserTournament[]>('/tournaments/my-tournaments');
  }
}

export default new TournamentApi();
