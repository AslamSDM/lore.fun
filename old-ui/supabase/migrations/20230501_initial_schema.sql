-- Create tables for the BlockBuster story platform

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- Create profiles table that extends the auth.users table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stories table
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  working_title BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sentence_count INTEGER DEFAULT 0,
  active_contributors INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  estimated_completion TEXT DEFAULT '3 months',
  current_voting_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '2 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create story_sentences table
CREATE TABLE story_sentences (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  submission_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'voting', -- voting, accepted, rejected
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id, status)
);

-- Create voting_stats view
CREATE VIEW voting_stats AS
SELECT 
  s.id AS story_id,
  COUNT(DISTINCT v.id) AS total_votes,
  COUNT(DISTINCT v.user_id) AS unique_voters,
  COUNT(DISTINCT sub.id) AS total_submissions,
  CASE 
    WHEN COUNT(DISTINCT p.id) = 0 THEN 0
    ELSE ROUND((COUNT(DISTINCT v.user_id)::NUMERIC / COUNT(DISTINCT p.id)::NUMERIC) * 100)
  END AS voting_power_used
FROM stories s
LEFT JOIN votes v ON s.id = v.story_id AND v.status = 'active'
LEFT JOIN submissions sub ON s.id = sub.story_id AND sub.status = 'voting'
LEFT JOIN profiles p ON p.id IN (
  SELECT DISTINCT user_id FROM submissions WHERE story_id = s.id
)
GROUP BY s.id;

-- Create functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_vote_count(p_submission_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE submissions
  SET vote_count = vote_count + 1
  WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_sentence_count(p_story_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE stories
  SET sentence_count = sentence_count + 1
  WHERE id = p_story_id
  RETURNING sentence_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Stories: everyone can read, only admins can create/update
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (true);

-- Story sentences: everyone can read
CREATE POLICY "Story sentences are viewable by everyone" ON story_sentences
  FOR SELECT USING (true);

-- Submissions: everyone can read, authenticated users can create
CREATE POLICY "Submissions are viewable by everyone" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Votes: users can read all votes, but only create/update their own
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert initial story
INSERT INTO stories (title, description, working_title, is_active, sentence_count)
VALUES ('The Bitcoin Odyssey', 'A decentralized story about the future of cryptocurrency', true, true, 12);

-- Insert initial sentences for the story
INSERT INTO story_sentences (story_id, content) VALUES 
(1, 'In the year 2031, ten years after the historic Bitcoin standard was adopted globally, a mysterious figure known only as "Nakamoto" emerged from the shadows.'),
(1, 'The world had changed dramatically since the collapse of the traditional banking system, with decentralized networks now governing everything from finance to social interactions.'),
(1, 'Sarah Chen, a brilliant cryptographer working for the Global Blockchain Consortium, received an encrypted message that appeared to be signed with the original Satoshi private key.'),
(1, '"The system is compromised," the message read, "A fatal flaw in the consensus algorithm will trigger a cascade failure in exactly 21 days."'),
(1, 'As panic spread through the markets, Sarah assembled a team of the world''s best blockchain engineers to verify the claim and search for a solution.'),
(1, 'Meanwhile, in a secure underground facility in Switzerland, the world''s most powerful quantum computer was being prepared for an unprecedented attack on the Bitcoin network.'),
(1, 'The team discovered that the vulnerability was not in Bitcoin''s code, but in the interconnected systems that had been built upon it, creating a complex web of dependencies.'),
(1, 'As governments scrambled to secure their digital reserves, a shadowy consortium of former central bankers saw an opportunity to restore the old financial order.'),
(1, 'Sarah realized that the only person who could help them was the original creator of Bitcoin, who had remained silent for over two decades.'),
(1, 'Using a series of clues hidden in the blockchain''s earliest transactions, Sarah began a global hunt for Satoshi Nakamoto, racing against time and powerful enemies.'),
(1, 'The trail led her to a remote island in the Pacific, where an aging programmer had been living off the grid, monitoring his creation from afar.'),
(1, '"I''ve been expecting you," the old man said as Sarah approached his modest compound, "but I''m afraid we may already be too late."');

-- Create trigger to update profiles on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
