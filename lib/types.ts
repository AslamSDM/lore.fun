export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string | null;
  genre: string;
  first_sentence: string;
  created_by: string;
  min_sentences: number;
  voting_period_days: number;
  submission_period_hours: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  sentences_count?: number;
  contributors_count?: number;
}

export interface StorySentence {
  id: string;
  story_id: string;
  content: string;
  position: number;
  submitted_by: string;
  created_at: string;
  author?: User;
}

export interface Submission {
  id: string;
  story_id: string;
  content: string;
  submitted_by: string;
  voting_round: number;
  is_winner: boolean;
  created_at: string;
  author?: User;
  votes_count?: number;
  percentage?: number;
}

export interface Vote {
  id: string;
  submission_id: string;
  user_id: string;
  created_at: string;
}

export interface UserStats {
  submissions_count: number;
  winning_submissions_count: number;
  votes_cast_count: number;
  stories_created_count: number;
}

export type FeaturedStory = {
  id?: string;
  title?: string;
  author?: string;
  description?: string;
  progress?: number;
  sentencesCount?: number;
  contributorsCount?: number;
  timeRemaining?: string;
  loreTokens?: string;
  loading: boolean;
};
