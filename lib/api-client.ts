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
  getById: (id: string | number): Promise<Story & { sentences: StorySentence[] }> =>
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
    id: string | number
  ): Promise<{
    canEndRound: boolean;
    votingEndDate: string;
    remainingTime: number;
    submissionsCount: number;
    currentRound: number;
  }> => fetchAPI(`/api/stories/${id}/end-round`),

  // End the current voting round
  endRound: (
    id: string | number,
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
    submission_id: string | number;
    user_id: string;
  }): Promise<VoteResponse> =>
    fetchAPI("/api/votes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Check if user has already voted
  checkVote: (data: {
    story_id: string | number;
    user_id: string;
    round?: number;
    submission_id?: string | number;
  }): Promise<{ hasVoted: boolean; votes: any[] }> => {
    const params = new URLSearchParams();
    params.append("user_id", data.user_id);
    params.append("story_id", data.story_id.toString());
    
    if (data.round) {
      params.append("round", data.round.toString());
    }
    
    if (data.submission_id) {
      params.append("submission_id", data.submission_id.toString());
    }
    
    return fetchAPI(`/api/votes/check?${params.toString()}`);
  },
};

// API Endpoints for Submissions
export const SubmissionsAPI = {
  // Create a new submission
  create: (
    story_id: string | number,
    content: string,
    submitted_by: string
  ): Promise<Submission> =>
    fetchAPI("/api/submissions", {
      method: "POST",
      body: JSON.stringify({ story_id, content, submitted_by }),
    }),
};

// API Endpoints for Users
export const UsersAPI = {
  // Get a user by ID
  getById: (id: string): Promise<User> => fetchAPI(`/api/users/${id}`),

  // Update a user
  update: (
    id: string,
    data: {
      username?: string;
      bio?: string;
      avatarUrl?: string;
    }
  ): Promise<User> =>
    fetchAPI(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Get a user's statistics
  getStats: (id: string): Promise<UserStats> =>
    fetchAPI(`/api/users/${id}/stats`),

  // Get a user's created stories
  getStories: (id: string): Promise<Story[]> =>
    fetchAPI(`/api/users/${id}/stories`),
};

// API Endpoints for Authentication
export const AuthAPI = {
  // Get the current user
  me: (): Promise<UserResponse> => fetchAPI("/api/auth/me"),

  // Sign in with a wallet
  signin: (
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
  }> =>
    fetchAPI("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ walletAddress, signature, message }),
    }),
};
