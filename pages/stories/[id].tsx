"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import type { Story, StorySentence, Submission } from "../../lib/types";
import { useWallet } from "../../hooks/use-wallet";

interface StoryData {
  story: Story;
  sentences: StorySentence[];
  current_round: {
    position: number;
    submissions: Submission[];
    total_votes: number;
  };
}

export default function StoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useWallet();
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{story.title}</h1>
                <p className="text-gray-400">
                  {story.subtitle || `A ${story.genre} story`}
                </p>
              </div>
              <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">
                {Math.min(
                  Math.round((sentences.length / story.min_sentences) * 100),
                  100
                )}
                % Complete
              </span>
            </div>

            <div className="space-y-6 mt-8">
              {sentences.map((sentence) => (
                <p key={sentence.id}>{sentence.content}</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">Current Voting Round</h2>
            <p className="text-gray-400 mb-6">
              Vote closes in {story.voting_period_days} days
            </p>

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
                    <Link href={`/stories/${story.id}/vote`}>
                      <button className="btn-primary text-center block w-full">
                        Vote
                      </button>
                    </Link>
                  </div>
                ))}

                <Link href={`/stories/${story.id}/vote`}>
                  <div className="text-primary hover:underline block text-center mt-6 cursor-pointer">
                    View All Submissions
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">No submissions yet.</p>
                <Link href={`/stories/${story.id}/submit`}>
                  <button className="btn-primary">Submit Next Sentence</button>
                </Link>
              </div>
            )}
          </div>

          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">Story Info</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Created By</span>
                <span>{story.creator?.username || "Anonymous"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Genre</span>
                <span>{story.genre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Length</span>
                <span>
                  {sentences.length} / {story.min_sentences} sentences
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created On</span>
                <span>{new Date(story.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href={`/stories/${story.id}/submit`}>
                <button className="btn-primary w-full">
                  Submit Next Sentence
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
