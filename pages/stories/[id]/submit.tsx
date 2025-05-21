"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../../../hooks/use-wallet";
import type { Story, StorySentence } from "../../../lib/types";
import { StoriesAPI, SubmissionsAPI } from "../../../lib/api-client";
import { GetServerSideProps } from "next";
import { prisma } from "../../../lib/prisma";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useTokenRequirements } from "@/lib/token-requirements";
import { useNotifications } from "@/hooks/use-notifications";

interface StoryData {
  story: Story;
  sentences: StorySentence[];
  current_round: {
    position: number;
    submissions: any[];
    total_votes: number;
  };
}

interface SubmitPageProps {
  initialStoryData: StoryData | null;
  initialError?: string;
}

export default function SubmitPage({
  initialStoryData,
  initialError = "",
}: SubmitPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { connected, connect, user } = useWallet();
  const [storyData, setStoryData] = useState<StoryData | null>(
    initialStoryData
  );
  const [submission, setSubmission] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(!initialStoryData);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { balance } = useTokenBalance();
  const tokenReq = useTokenRequirements();
  const { notifyWarning, notifyError, notifySuccess, notifyInfo } =
    useNotifications();

  // Only fetch if we don't have initial data from SSR
  useEffect(() => {
    const fetchStory = async () => {
      if (!id || initialStoryData) return;

      try {
        setLoading(true);

        // Use our API client to fetch the story
        const data = (await StoriesAPI.getById(
          id as string
        )) as unknown as StoryData;
        setStoryData(data);
      } catch (err) {
        const errorMsg = (err as Error).message || "Error loading story";
        notifyError(errorMsg, "Failed to Load");
        setError(errorMsg); // Keep this for UI display
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && !initialStoryData) {
      fetchStory();
    }
  }, [id, initialStoryData]);

  const handleSubmissionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    setSubmission(text);
    setCharCount(text.length);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleSubmit = async () => {
    if (!connected) {
      connect();
      return;
    }

    if (!user) {
      notifyWarning("Please connect your wallet to submit", "Wallet Required");
      return;
    }

    if (wordCount < 10 || wordCount > 50) {
      notifyWarning(
        "Your submission must be between 10-50 words.",
        "Invalid Submission Length"
      );
      return;
    }
    if (balance <= tokenReq.minTokensToSubmit) {
      notifyWarning(
        `You need at least ${tokenReq.minTokensToSubmit} LORE tokens to submit.`,
        "Insufficient Tokens"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Use our API client to submit the continuation
      await SubmissionsAPI.create(id as string, submission, user.id);

      setSubmitSuccess(true);
      notifySuccess(
        "Your continuation has been submitted successfully!",
        "Submission Successful"
      );

      // Redirect back to story page after successful submission
      setTimeout(() => {
        router.push(`/stories/${id}`);
      }, 2000);
    } catch (err) {
      notifyError(
        (err as Error).message || "Error submitting continuation",
        "Submission Failed"
      );
      setError((err as Error).message || "Error submitting continuation"); // Keep this for showing in UI
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/stories/${id}`);
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
          <p className="mt-4 text-gray-400">Loading story...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !storyData) {
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

  const { story, sentences } = storyData;

  const lastSentence =
    sentences.length > 0
      ? sentences[sentences.length - 1].content
      : story.first_sentence;

  const roundNumber = sentences.length + 1;

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
            Submit a Continuation
          </AnimatedHeading>
          <ScrollAnimation delay={0.1}>
            <CardDescription className="text-lg">
              Add the next sentence to "{story.title}"
            </CardDescription>
          </ScrollAnimation>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <svg
                className="w-16 h-16 text-green-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">
                Submission Successful!
              </h2>
              <p className="text-gray-400 mb-4">
                Your continuation has been submitted for voting.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Link href={`/stories/${id}/vote`}>
                  <Button
                    variant="default"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Go to Voting
                  </Button>
                </Link>
                <Link href={`/stories/${id}`}>
                  <Button variant="outline">Back to Story</Button>
                </Link>
              </div>
            </motion.div>
          ) : false ? (
            <ScrollAnimation className="text-center py-6">
              <svg
                className="w-16 h-16 text-yellow-400 mx-auto mb-4"
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
              <h2 className="text-2xl font-bold mb-2">
                Submission Period Closed
              </h2>
              <p className="text-gray-400 mb-4">
                The submission period for this round has ended.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Link href={`/stories/${id}/vote`}>
                  <Button
                    variant="default"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Go to Voting
                  </Button>
                </Link>
                <Link href={`/stories/${id}`}>
                  <Button variant="outline">Back to Story</Button>
                </Link>
              </div>
            </ScrollAnimation>
          ) : (
            <>
              <ScrollAnimation delay={0.2} className="mb-6">
                <h2 className="text-lg font-medium mb-2">
                  Last sentence in the story:
                </h2>
                <blockquote className="border-l-4 border-primary pl-4 py-2 bg-card/50 rounded">
                  {lastSentence}
                </blockquote>
              </ScrollAnimation>

              <div className="flex justify-between items-center">
                <Badge variant="outline">Round {roundNumber}</Badge>
                <div className="text-sm text-gray-400 flex items-center">
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
                  Submissions close in {story.submission_period_hours} hours
                </div>
              </div>

              <ScrollAnimation
                delay={0.3}
                className="bg-card/30 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium">Submission Guidelines</h3>
                </div>

                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>
                    Your submission should be a single sentence that continues
                    the story
                  </li>
                  <li>Keep it between 10-50 words</li>
                  <li>Stay consistent with the established tone and plot</li>
                  <li>You must hold $LORE tokens to submit</li>
                  <li>
                    Submissions close in {story.submission_period_hours} hours
                  </li>
                </ul>
              </ScrollAnimation>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2">
                  Your submission:
                </label>
                <Textarea
                  className="w-full h-32 border-gray-700 focus:border-primary focus:ring-primary"
                  placeholder="Type your continuation here..."
                  value={submission}
                  onChange={handleSubmissionChange}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <div>
                    {charCount < 10 || charCount > 280 ? (
                      <span className="text-red-400">
                        {charCount} characters
                      </span>
                    ) : (
                      <span>{charCount} characters</span>
                    )}
                  </div>
                  <div>
                    {wordCount < 3 || wordCount > 50 ? (
                      <span className="text-red-400">{wordCount} words</span>
                    ) : (
                      <span>{wordCount} words</span>
                    )}
                  </div>
                </div>

                <Progress
                  value={Math.min((wordCount / 50) * 100, 100)}
                  className={`h-1 mt-2 ${wordCount > 50 ? "bg-red-500" : ""}`}
                />
              </div>

              {/* Error messages are now shown via toast notifications */}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || submission.trim().length < 10}
                  className={`${isSubmitting ? "opacity-50" : ""}`}
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
                      Connect Wallet to Submit
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit for Voting</>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Server Side Props to pre-fetch data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  // Enable caching for 20 seconds on this page
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=20, stale-while-revalidate=60"
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
        submissions: submissions.map((sub) => ({
          id: sub.id,
          content: sub.content,
          votes_count: sub.votes.length,
        })),
        total_votes: submissions.reduce(
          (sum, sub) => sum + sub.votes.length,
          0
        ),
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
