/**
 * Client-side API helpers for making requests to the API endpoints
 * These functions should be used in client components instead of direct Prisma calls
 */
import type { User, Story, StorySentence, Submission } from "./types";

// Generic API fetcher
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return await response.json();
}

// Type definitions for API responses
interface UserStats {
  submissions_count: number;
  winning_submissions_count: number;
  votes_cast_count: number;
  stories_created_count: number;
}

interface UserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// API Endpoints for Stories
export const StoriesAPI = {
  // Get all stories
  getAll: (): Promise<Story[]> => fetchAPI("/api/stories"),

  // Get a story by ID
  getById: (id: string): Promise<Story & { sentences: StorySentence[] }> =>
    fetchAPI(`/api/stories/${id}`),

  // Create a new story
  create: (storyData: {
    title: string;
    subtitle?: string;
    genre: string;
    first_sentence: string;
    created_by: string;
  }): Promise<Story> =>
    fetchAPI("/api/stories", {
      method: "POST",
      body: JSON.stringify(storyData),
    }),

  // Check if a round can be ended
  checkRoundStatus: (
    id: string
  ): Promise<{
    canEndRound: boolean;
    votingEndDate: string;
    remainingTime: number;
    submissionsCount: number;
    currentRound: number;
  }> => fetchAPI(`/api/stories/${id}/end-round`),

  // End the current voting round
  endRound: (
    id: string,
    force: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    winningSentence?: any;
    hasTie?: boolean;
    waitingForTieBreak?: boolean;
    tiedSubmissions?: { id: string; content: string; votes: number }[];
    waitingForSubmissions?: boolean;
  }> =>
    fetchAPI(`/api/stories/${id}/end-round`, {
      method: "POST",
      body: JSON.stringify({ force, waitForTieBreak: !force }),
    }),
};

interface VoteResponse {
  id: string;
  submission_id: string;
  user_id: string;
  created_at: string;
}

// API Endpoints for Votes
export const VotesAPI = {
  // Cast a vote
  cast: (data: {
    submission_id: string;
    user_id: string;
  }): Promise<VoteResponse> =>
    fetchAPI("/api/votes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  // Check if user has already voted
  checkVote: (data: {
    story_id: string;
    user_id: string;
    round?: number;
  }): Promise<{hasVoted: boolean, votes: any[]}> =>
    fetchAPI(`/api/votes/check?user_id=${data.user_id}&story_id=${data.story_id}${data.round ? `&round=${data.round}` : ''}`),
};

// API Endpoints for Users
export const UsersAPI = {
  // Get user profile
  getProfile: (userId: string): Promise<User> =>
    fetchAPI(`/api/users/${userId}`),

  // Get user stats
  getStats: (userId: string): Promise<UserStats> =>
    fetchAPI(`/api/users/${userId}/stats`),

  // Update username
  updateUsername: (userId: string, username: string): Promise<UserResponse> =>
    fetchAPI(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ username }),
    }),

  // Get user's stories
  getStories: (userId: string): Promise<Story[]> =>
    fetchAPI(`/api/users/${userId}/stories`),
};

// API Endpoints for Submissions
export const SubmissionsAPI = {
  // Create a new submission
  create: (data: {
    story_id: string;
    content: string;
    submitted_by: string;
    voting_round: number;
  }): Promise<Submission> =>
    fetchAPI("/api/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// API Endpoints for Authentication
export const AuthAPI = {
  // Sign in with wallet address and signature
  signin: (
    walletAddress: string,
    signature: string
  ): Promise<{
    authenticated: boolean;
    user: User;
    isNewUser: boolean;
  }> =>
    fetchAPI("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ walletAddress, signature }),
    }),

  // Get current session
  getSession: (): Promise<{
    user: User | null;
    authenticated: boolean;
  }> => fetchAPI("/api/auth/session"),
};
