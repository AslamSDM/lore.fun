"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../../../hooks/use-wallet";
import type { Story, StorySentence, Submission } from "../../../lib/types";
import { VotesAPI, StoriesAPI } from "../../../lib/api-client";
import { motion } from "framer-motion";
import {
  ScrollAnimation,
  AnimatedHeading,
  ScrollTextAnimation,
} from "@/components/animations/scroll-animation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

interface StoryData {
  story: Story;
  sentences: StorySentence[];
  current_round: {
    position: number;
    submissions: Submission[];
    total_votes: number;
  };
}

export default function VotePage() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, connect, user } = useWallet();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const { balance, solBalance } = useTokenBalance();
  const tokenReqs = useTokenRequirements();
  const { notifyWarning, notifyError, notifySuccess, notifyInfo } =
    useNotifications();
  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Use the StoriesAPI client helper to fetch the story
        const data = (await StoriesAPI.getById(id as string)) as StoryData;
        setStoryData(data);

        // Check if the user has already voted in this round
        if (user) {
          try {
            const voteCheck = await VotesAPI.checkVote({
              story_id: id as string,
              user_id: user.id,
              round: data.current_round.position,
            });

            setHasVoted(voteCheck.hasVoted);

            if (voteCheck.hasVoted && voteCheck.votes.length > 0) {
              // Set the previously voted submission
              setSelectedSubmission(voteCheck.votes[0].submission.id);
            }
          } catch (voteErr) {
            console.error("Error checking vote status:", voteErr);
          }
        }
      } catch (err) {
        const errorMsg = (err as Error).message || "Error loading story";
        notifyError(errorMsg, "Failed to Load");
        setError(errorMsg); // Keep this for UI display
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id, user]);
  console.log("Story Data:", balance, tokenReqs.minTokensToVote);

  const handleVote = async () => {
    if (!connected) {
      connect();
      return;
    }

    if (!user) {
      notifyWarning("Please connect your wallet to vote", "Wallet Required");
      return;
    }

    if (selectedSubmission === null) {
      notifyWarning("Please select a submission to vote", "Selection Required");
      return;
    }
    if (balance < tokenReqs.minTokensToVote) {
      notifyWarning(
        `You need at least ${tokenReqs.minTokensToVote} LORE tokens to vote. You currently have ${balance} LORE.`,
        "Insufficient Tokens"
      );
      return;
    }
    if (hasVoted) {
      notifyInfo("You have already voted in this round", "Already Voted");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      try {
        // Use our client API helper to submit the vote
        await VotesAPI.cast({
          submission_id: selectedSubmission,
          user_id: user.id,
        });

        setVoteSuccess(true);
        setHasVoted(true);
        notifySuccess(
          "Your vote has been submitted successfully!",
          "Vote Recorded"
        );

        // Check if the round can be ended after this vote
        try {
          const roundStatus = await StoriesAPI.checkRoundStatus(id as string);

          // If voting period has ended and there are submissions, try to auto-end the round
          if (roundStatus.canEndRound && roundStatus.submissionsCount > 0) {
            const endResult = await StoriesAPI.endRound(id as string, false);

            if (endResult.success) {
              // Round ended successfully, redirect with a notification
              setError(null);
              // Set a slightly longer delay to allow for round ending processing
              setTimeout(() => {
                router.push(`/stories/${id}?roundEnded=true`);
              }, 3000);
              return;
            } else if (endResult.hasTie && endResult.waitingForTieBreak) {
              // There's a tie, so we'll redirect to the story page to show the tie status
              setTimeout(() => {
                router.push(`/stories/${id}?tie=true`);
              }, 2000);
              return;
            } else if (endResult.waitingForSubmissions) {
              // Shouldn't happen at this point since we checked for submissions
              console.warn(
                "Unexpected state: Round ending reports waiting for submissions"
              );
            }
          }
        } catch (statusError) {
          console.error("Error checking round status:", statusError);
          // Continue with normal flow if checking fails
        }

        // Refresh the story data to update vote counts
        setTimeout(() => {
          router.push(`/stories/${id}`);
        }, 2000);
      } catch (apiError) {
        // Check if error is about already voting
        const errorMsg = (apiError as Error).message;

        if (errorMsg.includes("already voted")) {
          setVoteSuccess(true);
          setHasVoted(true);

          // Show a different message
          notifyInfo(
            "You have already voted for a submission in this round",
            "Already Voted"
          );

          // Still redirect after a short delay
          setTimeout(() => {
            router.push(`/stories/${id}`);
          }, 2000);
          return;
        }

        throw apiError;
      }
    } catch (err) {
      notifyError(
        (err as Error).message || "Error submitting vote",
        "Vote Failed"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-400">Loading voting options...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !voteSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="text-center py-8 border-red-600/50">
            <CardContent>
              <ScrollAnimation>
                <p className="text-red-400 mb-4">{error}</p>
                <Link href={`/stories/${id}`}>
                  <Button>Back to Story</Button>
                </Link>
              </ScrollAnimation>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!storyData) return null;

  const { story, sentences, current_round } = storyData;
  const lastSentence =
    sentences.length > 0
      ? sentences[sentences.length - 1].content
      : story.first_sentence;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/stories/${id}`}
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
          Back to Story
        </Link>
      </motion.div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <AnimatedHeading el="h1" className="text-2xl font-bold">
            Vote on the Next Sentence
          </AnimatedHeading>
          <ScrollAnimation delay={0.1}>
            <CardDescription className="text-lg">
              Choose which continuation should be added to "{story.title}"
            </CardDescription>
          </ScrollAnimation>
        </CardHeader>

        <CardContent className="space-y-6">
          <ScrollAnimation delay={0.2} className="mb-6">
            <h2 className="text-lg font-medium mb-2">
              Last sentence in the story:
            </h2>
            <blockquote className="border-l-4 border-primary pl-4 py-2 bg-card/50 rounded">
              {lastSentence}
            </blockquote>
          </ScrollAnimation>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <span className="mr-4 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Voting deadline:{" "}
                {new Date(
                  new Date(story.created_at).getTime() +
                    story.voting_period_days * 86400000
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {current_round.total_votes || 0} votes cast
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {voteSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-6 rounded mb-6 text-center"
            >
              <p className="text-xl mb-2">Vote submitted successfully!</p>
              <p>Redirecting back to the story...</p>
            </motion.div>
          ) : current_round.submissions.length > 0 ? (
            <ScrollAnimation delay={0.3}>
              <div className="space-y-6 mb-4">
                {current_round.submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSubmission === submission.id
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-gray-700 hover:border-gray-500 hover:shadow-md hover:shadow-gray-700/10"
                    }`}
                    onClick={() => setSelectedSubmission(submission.id)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border ${
                            selectedSubmission === submission.id
                              ? "border-primary"
                              : "border-gray-500"
                          } flex items-center justify-center transition-all`}
                        >
                          {selectedSubmission === submission.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 rounded-full bg-primary"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="mb-3 text-white leading-relaxed">
                          {submission.content}
                        </p>
                        <div className="flex flex-wrap items-center text-sm text-gray-400">
                          <span className="mr-4 mb-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {submission.author?.username || "Anonymous"}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <span
                              className={
                                submission.votes_count
                                  ? "text-primary font-medium"
                                  : ""
                              }
                            >
                              {submission.votes_count || 0}
                            </span>{" "}
                            votes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Votes</span>
                        <span
                          className={
                            submission.percentage && submission.percentage > 0
                              ? "text-primary font-medium"
                              : "text-gray-400"
                          }
                        >
                          {submission.percentage || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${submission.percentage || 0}%` }}
                          transition={{
                            duration: 0.5,
                            delay: 0.2 * (index + 1),
                          }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollAnimation>
          ) : (
            <ScrollAnimation delay={0.3} className="text-center py-8">
              <p className="text-gray-400 mb-4">
                No submissions yet for this voting round.
              </p>
              <Link href={`/stories/${id}/submit`}>
                <Button className="bg-primary hover:bg-primary/90">
                  Submit a Continuation
                </Button>
              </Link>
            </ScrollAnimation>
          )}

          {/* Error messages are now shown via toast notifications */}

          {current_round.submissions.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400 flex items-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Voting ends in: {story.voting_period_days} days
              </div>

              <Button
                onClick={handleVote}
                disabled={
                  selectedSubmission === null || hasVoted || isSubmitting
                }
                variant={hasVoted ? "outline" : "default"}
                className={
                  selectedSubmission === null || hasVoted || isSubmitting
                    ? "opacity-50"
                    : ""
                }
              >
                {!connected ? (
                  <>
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    Connect Wallet to Vote
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : hasVoted ? (
                  <>
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
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    {selectedSubmission
                      ? "You've Already Voted"
                      : "Vote Submitted!"}
                  </>
                ) : (
                  <>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                    Submit Vote
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add getServerSideProps at the end of the file
import { GetServerSidePropsContext } from "next";
import { useTokenRequirements } from "@/lib/token-requirements";
import { useTokenBalance } from "@/hooks/use-token-balance";
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.params as { id: string };

  // Enable caching for 15 seconds on this page (shorter because voting can change quickly)
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=15, stale-while-revalidate=30"
  );

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

    // Fetch all sentences for the story
    const sentences = await prisma.sentence.findMany({
      where: {
        storyId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    // Calculate current voting round
    const currentRoundPosition = sentences.length + 1;

    // Get submissions for current round
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

    // Calculate total votes and vote percentages
    const totalVotes = submissions.reduce(
      (sum, submission) => sum + submission.votes.length,
      0
    );

    // Format the submissions with vote percentages
    const formattedSubmissions = submissions.map((submission) => {
      const votesCount = submission.votes.length;
      const percentage =
        totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

      return {
        id: submission.id,
        content: submission.content,
        author: submission.author,
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

    // Return the pre-fetched data as props
    return {
      props: {
        initialStoryData: {
          story: formattedStory,
          sentences: formattedSentences,
          current_round: {
            position: currentRoundPosition,
            submissions: formattedSubmissions,
            total_votes: totalVotes,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        initialError: "Error loading story data",
      },
    };
  }
};
