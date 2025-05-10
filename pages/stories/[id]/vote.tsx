"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../../../hooks/use-wallet";
import type { Story, StorySentence, Submission } from "../../../lib/types";

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
  const { user, loading: walletLoading } = useWallet();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/stories/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch story");
        }

        const data = await res.json();
        setStoryData(data);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load story. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      setVoteError("Please connect your wallet to vote");
      return;
    }

    if (!selectedSubmission) {
      setVoteError("Please select a submission to vote");
      return;
    }

    setVoteError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: selectedSubmission,
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit vote");
      }

      setHasVoted(true);

      // Refresh the page data after voting
      const storyRes = await fetch(`/api/stories/${id}`);
      const storyData = await storyRes.json();
      setStoryData(storyData);

      setTimeout(() => {
        router.push(`/stories/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      setVoteError(err.message || "Failed to submit vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || walletLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading voting page...</p>
        </div>
      </div>
    );
  }

  if (error || !storyData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/stories">
          <div className="flex items-center text-gray-400 hover:text-white mb-6 cursor-pointer">
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
          </div>
        </Link>

        <div className="text-center py-16">
          <p className="text-red-400">{error || "Story not found"}</p>
        </div>
      </div>
    );
  }

  const { story, sentences, current_round } = storyData;
  const lastSentence =
    sentences.length > 0 ? sentences[sentences.length - 1] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/stories/${id}`}>
        <div className="flex items-center text-gray-400 hover:text-white mb-6 cursor-pointer">
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
        </div>
      </Link>

      <div className="card max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Vote on the Next Sentence</h1>
        <p className="text-gray-400 mb-6">
          Choose which continuation should be added to "{story.title}"
        </p>

        {lastSentence && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">
              Last sentence in the story:
            </h2>
            <blockquote className="border-l-4 border-primary pl-4 py-2 bg-gray-800 rounded">
              {lastSentence.content}
            </blockquote>
          </div>
        )}

        {current_round.submissions.length > 0 ? (
          <div className="space-y-6 mb-8">
            {current_round.submissions.map((submission) => (
              <div
                key={submission.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSubmission === submission.id
                    ? "border-primary bg-primary bg-opacity-10"
                    : "border-gray-700 hover:border-gray-500"
                }`}
                onClick={() => setSelectedSubmission(submission.id)}
              >
                <div className="flex items-start mb-4">
                  <div className="mr-3 mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selectedSubmission === submission.id
                          ? "border-primary"
                          : "border-gray-500"
                      } flex items-center justify-center`}
                    >
                      {selectedSubmission === submission.id && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="mb-2">{submission.content}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-4">
                        <svg
                          className="w-4 h-4 inline mr-1"
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
                      <span>
                        <svg
                          className="w-4 h-4 inline mr-1"
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
                        {submission.votes_count} votes
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-right text-sm mb-1">
                    Current standing: {submission.percentage}%
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-value"
                      style={{ width: `${submission.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              No submissions yet for this voting round.
            </p>
            <Link href={`/stories/${id}/submit`}>
              <button className="btn-primary">Be the first to submit</button>
            </Link>
          </div>
        )}

        {current_round.submissions.length > 0 && (
          <div className="flex items-center justify-between">
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

            <button
              onClick={handleVote}
              disabled={
                !user || selectedSubmission === null || hasVoted || isSubmitting
              }
              className={`btn-primary ${
                !user || selectedSubmission === null || hasVoted || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {!user
                ? "Connect Wallet to Vote"
                : hasVoted
                ? "Vote Submitted!"
                : isSubmitting
                ? "Submitting..."
                : "Submit Vote"}
            </button>
          </div>
        )}

        {voteError && (
          <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 text-red-300 rounded">
            {voteError}
          </div>
        )}
      </div>
    </div>
  );
}
