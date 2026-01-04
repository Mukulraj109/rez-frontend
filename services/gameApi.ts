// Game API Service
// Handles all game-related API calls

import apiClient from './apiClient';

export interface GameSession {
  sessionId: string;
  gameType: string;
  status: string;
  result?: {
    won: boolean;
    prize?: {
      type: string;
      value: number;
      description: string;
    };
    score?: number;
  };
  createdAt: string;
  expiresAt: string;
}

export interface DailyLimits {
  [gameType: string]: {
    limit: number;
    remaining: number;
    used: number;  // Frontend uses 'used', backend returns 'played'
  };
}

export interface GameStats {
  [gameType: string]: {
    totalPlayed: number;
    totalWon: number;
    totalCoins: number;
    winRate: number;
  };
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  coins: number;
  category: string;
  difficulty: string;
}

class GameApi {
  // ======== SPIN WHEEL ========
  async createSpinWheel(earnedFrom: string = 'daily_free') {
    return apiClient.post<GameSession>('/games/spin-wheel/create', { earnedFrom });
  }

  async playSpinWheel(sessionId: string) {
    return apiClient.post<GameSession>('/games/spin-wheel/play', { sessionId });
  }

  // Convenience method: creates and plays spin wheel in one call
  async spinWheel(earnedFrom: string = 'daily_free') {
    const createResponse = await this.createSpinWheel(earnedFrom);
    if (createResponse.data?.sessionId) {
      return this.playSpinWheel(createResponse.data.sessionId);
    }
    return createResponse;
  }

  // ======== SCRATCH CARD ========
  async createScratchCard(earnedFrom: string) {
    return apiClient.post<GameSession>('/games/scratch-card/create', { earnedFrom });
  }

  async playScratchCard(sessionId: string) {
    return apiClient.post<GameSession>('/games/scratch-card/play', { sessionId });
  }

  // ======== QUIZ ========
  async createQuiz(questions: any[]) {
    return apiClient.post<GameSession>('/games/quiz/create', { questions });
  }

  async submitQuizFull(sessionId: string, answers: any[], correctAnswers: any[]) {
    return apiClient.post<GameSession>('/games/quiz/submit', {
      sessionId,
      answers,
      correctAnswers
    });
  }

  // Convenience method: submits quiz answers directly (creates session internally)
  async submitQuiz(answers: Array<{ questionId: string; selectedAnswer: number; timeSpent: number }>) {
    return apiClient.post<{
      totalCoins: number;
      correctAnswers: number;
      totalQuestions: number;
      results: Array<{ questionId: string; correct: boolean; coins: number }>;
    }>('/games/quiz/submit', { answers });
  }

  // ======== DAILY TRIVIA ========
  async getDailyTrivia() {
    return apiClient.get<any>('/games/daily-trivia');
  }

  async answerDailyTrivia(questionId: string, answer: string) {
    return apiClient.post<{ correct: boolean; coins: number }>('/games/daily-trivia/answer', {
      questionId,
      answer
    });
  }

  // ======== MEMORY MATCH ========
  async startMemoryMatch(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
    return apiClient.post<{
      sessionId: string;
      difficulty: string;
      pairs: number;
      expiresAt: string;
      rewards: { baseCoins: number; perfectBonus: number; timeBonus: number };
    }>('/games/memory-match/start', { difficulty });
  }

  async completeMemoryMatch(sessionId: string, score: number, timeSpent: number, moves: number) {
    return apiClient.post<{
      sessionId: string;
      coins: number;
      score: number;
      perfectMatch: boolean;
      timeBonus: boolean;
    }>('/games/memory-match/complete', { sessionId, score, timeSpent, moves });
  }

  // ======== COIN HUNT ========
  async startCoinHunt() {
    return apiClient.post<{
      sessionId: string;
      coins: Array<{ id: number; value: number; x: number; y: number }>;
      duration: number;
      expiresAt: string;
    }>('/games/coin-hunt/start');
  }

  async completeCoinHunt(sessionId: string, coinsCollected: number, score: number) {
    return apiClient.post<{
      sessionId: string;
      coinsCollected: number;
      coinsEarned: number;
      success: boolean;
    }>('/games/coin-hunt/complete', { sessionId, coinsCollected, score });
  }

  // ======== GUESS THE PRICE ========
  async startGuessPrice() {
    return apiClient.post<{
      sessionId: string;
      product: { id: string; name: string; image: string };
      priceRange: { min: number; max: number };
      expiresAt: string;
    }>('/games/guess-price/start');
  }

  async submitGuessPrice(sessionId: string, guessedPrice: number) {
    return apiClient.post<{
      sessionId: string;
      guessedPrice: number;
      actualPrice: number;
      accuracy: number;
      coins: number;
      message: string;
      productName: string;
    }>('/games/guess-price/submit', { sessionId, guessedPrice });
  }

  // ======== GENERAL ========
  async getMyGames(gameType?: string, limit: number = 20) {
    return apiClient.get<GameSession[]>('/games/my-games', { gameType, limit });
  }

  async getPendingGames() {
    return apiClient.get<GameSession[]>('/games/pending');
  }

  async getGameStatistics() {
    return apiClient.get<GameStats>('/games/statistics');
  }

  async getDailyLimits() {
    const response = await apiClient.get<any>('/games/daily-limits');
    // Transform backend 'played' to frontend 'used'
    if (response.data) {
      const transformed: DailyLimits = {};
      for (const [key, value] of Object.entries(response.data)) {
        const v = value as any;
        transformed[key] = {
          limit: v.limit,
          remaining: v.remaining,
          used: v.played ?? v.used ?? 0
        };
      }
      response.data = transformed;
    }
    return response as { data: DailyLimits };
  }
}

export default new GameApi();
