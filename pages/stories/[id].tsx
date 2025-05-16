import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Story, StorySentence, Submission } from "../../lib/types";
import { useWallet } from "../../hooks/use-wallet";
import { StoriesAPI } from "../../lib/api-client";
import RoundStatus from "../../components/stories/RoundStatus";
import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";

interface StoryData {
  story: Story;
  sentences: StorySentence[];
  current_round: {
    position: number;
    submissions: Submission[];
    total_votes: number;
  };
}

interface StoryPageProps {
  initialStoryData: StoryData | null;
  initialError?: string;
}

export default function StoryPage({ initialStoryData, initialError = "" }: StoryPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { connected } = useWallet();
  const [storyData, setStoryData] = useState<StoryData | null>(initialStoryData);
  const [loading, setLoading] = useState(!initialStoryData);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStory = async () => {
    if (!id) return;

    try {
      if (!refreshing) setLoading(true);

      // Only fetch if we don't have initial data from SSR
      // or if we're explicitly refreshing the data
      if (!initialStoryData || refreshing) {
        // Use our API client to fetch the story
        const data = (await StoriesAPI.getById(
          id as string
        )) as unknown as StoryData;
        setStoryData(data);
      }

      // Check if we should also check round status
      // This helps if the page is loaded directly or after voting
      try {
        const roundStatus = await StoriesAPI.checkRoundStatus(id as string);

        // If voting period has ended and there are submissions but no query param indicating we just handled this
        // This prevents an endless loop of rounds ending when the page loads
        const justEnded =
          router.query.roundEnded === "true" || router.query.tie === "true";

        if (
          !justEnded &&
          roundStatus.canEndRound &&
          roundStatus.submissionsCount > 0
        ) {
          // We don't auto-end the round here, just let the RoundStatus component handle it
          // This ensures the user can see the state and make decisions about ties
          console.log("Round is eligible to be ended");
        }
      } catch (roundError) {
        console.error("Error checking round status:", roundError);
        // Non-critical error, we can still show the story
      }
    } catch (err) {
      setError((err as Error).message || "Error loading story");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle round ended event to refresh story data
  const handleRoundEnded = async () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchStory();
    }, 1000); // Small delay to allow the backend to process
  };

  useEffect(() => {
    if (id && (!initialStoryData || refreshing)) {
      fetchStory();
    }
  }, [id, initialStoryData, refreshing]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/stories" className="btn-primary">
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  if (!storyData) return null;

  const { story, sentences, current_round } = storyData;

  // Calculate progress percentage
  const progress = Math.min(
    Math.round((sentences.length / (story.min_sentences || 100)) * 100),
    100
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/stories"
        className="flex items-center text-gray-400 hover:text-white mb-6"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Stories
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{story.title}</h1>
                <p className="text-gray-400">
                  {story.subtitle || `A ${story.genre} story by the community`}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full mb-2">
                  {progress < 100 ? "In Progress" : "Completed"}
                </span>
                <div className="text-sm text-gray-400">
                  {sentences.length} of {story.min_sentences} sentences
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-value"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              {sentences.map((sentence) => (
                <p key={sentence.id}>{sentence.content}</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Round Status Component */}
          {id && (
            <RoundStatus
              storyId={id as string}
              onRoundEnded={handleRoundEnded}
            />
          )}

          <div className="card">
            <h2 className="text-2xl font-bold mb-2">Current Voting Round</h2>
            <p className="text-gray-400 mb-6">
              {current_round.submissions.length > 0
                ? `Round ${current_round.position}: Choose the next sentence`
                : "Waiting for submissions"}
            </p>

            {refreshing && (
              <div className="text-center py-2 mb-4">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="text-sm text-gray-400 mt-1">Refreshing...</p>
              </div>
            )}

            {current_round.submissions.length > 0 ? (
              <div className="space-y-6">
                {current_round.submissions.slice(0, 3).map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">
                        By {submission.author?.username || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {submission.percentage}% ({submission.votes_count}{" "}
                        votes)
                      </p>
                    </div>
                    <blockquote className="border-l-4 border-primary pl-4 italic mb-4">
                      "{submission.content}"
                    </blockquote>
                    <Link
                      href={`/stories/${id}/vote`}
                      className="btn-primary text-center block w-full"
                    >
                      Vote
                    </Link>
                  </div>
                ))}

                <Link
                  href={`/stories/${id}/vote`}
                  className="text-primary hover:underline block text-center mt-6"
                >
                  View All Submissions
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">
                  No submissions yet. Be the first to contribute!
                </p>
                {connected ? (
                  <Link href={`/stories/${id}/submit`} className="btn-primary">
                    Submit Next Sentence
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400">
                    Connect your wallet to submit
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            {connected ? (
              <Link href={`/stories/${id}/submit`} className="btn-primary">
                Submit Next Sentence
              </Link>
            ) : (
              <div className="card text-center">
                <p className="text-gray-400 mb-4">
                  Connect your wallet to participate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Side Props to pre-fetch data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    // Fetch story directly from the database for SSR
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!story) {
      return {
        notFound: true, // This will show the 404 page
      };
    }

    // Fetch story sentences
    const sentences = await prisma.storySentence.findMany({
      where: { storyId: id },
      orderBy: { position: "asc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Calculate current voting round
    const currentRoundPosition = sentences.length + 1;

    // Get submissions for current round with votes
    const submissions = await prisma.submission.findMany({
      where: {
        storyId: id,
        votingRound: currentRoundPosition,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        votes: true,
      },
    });

    // Count total votes for this round
    const totalVotes = submissions.reduce(
      (sum, sub) => sum + sub.votes.length,
      0
    );

    // Calculate percentage for each submission
    const processedSubmissions = submissions.map((sub) => {
      const votesCount = sub.votes.length;
      const percentage =
        totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

      return {
        id: sub.id,
        story_id: sub.storyId,
        content: sub.content,
        submitted_by: sub.submittedBy,
        voting_round: sub.votingRound,
        is_winner: sub.isWinner,
        created_at: sub.createdAt.toISOString(),
        author: sub.author,
        votes_count: votesCount,
        percentage,
      };
    });

    // Format the response data to match what the client expects
    const formattedStory = {
      id: story.id,
      title: story.title,
      subtitle: story.subtitle,
      genre: story.genre,
      first_sentence: story.firstSentence,
      created_by: story.createdById,
      min_sentences: story.minSentences,
      voting_period_days: story.votingPeriodDays,
      submission_period_hours: story.submissionPeriodHours,
      created_at: story.createdAt.toISOString(),
      updated_at: story.updatedAt.toISOString(),
      creator: story.creator,
    };

    const formattedSentences = sentences.map((sentence) => ({
      id: sentence.id,
      story_id: sentence.storyId,
      content: sentence.content,
      position: sentence.position,
      submitted_by: sentence.submittedBy,
      created_at: sentence.createdAt.toISOString(),
      author: sentence.author,
    }));

    const initialStoryData = {
      story: formattedStory,
      sentences: formattedSentences,
      current_round: {
        position: currentRoundPosition,
        submissions: processedSubmissions,
        total_votes: totalVotes,
      },
    };

    return {
      props: {
        initialStoryData,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        initialStoryData: null,
        initialError: "Failed to load story data",
      },
    };
  }
};
