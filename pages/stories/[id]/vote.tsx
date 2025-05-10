"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../../../hooks/use-wallet";

// Mock data for voting submissions
const votingData = {
  storyId: "the-bitcoin-odyssey",
  lastSentence:
    '"I\'ve been expecting you," the old man said as Sarah approached his modest compound, "but I\'m afraid we may already be too late."',
  votingEndsIn: "2 days, 4 hours",
  submissions: [
    {
      id: 1,
      text: "The old man handed Sarah a small device, its screen displaying a countdown that matched exactly with the 21-day warning.",
      author: "satoshi_fan",
      votes: 1245,
      percentage: 42,
    },
    {
      id: 2,
      text: "As Sarah processed the old man's words, a deafening explosion rocked the island, sending plumes of smoke into the clear blue sky.",
      author: "crypto_writer",
      votes: 923,
      percentage: 31,
    },
    {
      id: 3,
      text: "The old man smiled mysteriously, 'But I've prepared for this day since the genesis block was mined,' he said, revealing a hidden bunker filled with servers.",
      author: "blockchain_poet",
      votes: 801,
      percentage: 27,
    },
  ],
};

export default function VotePage() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, connect } = useWallet();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!connected) {
      connect();
      return;
    }

    if (selectedSubmission !== null) {
      // In a real app, you would send the vote to the blockchain
      setHasVoted(true);
      setTimeout(() => {
        router.push(`/stories/${id}`);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/stories/${id}`}>
        <p className="flex items-center text-gray-400 hover:text-white mb-6">
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
        </p>
      </Link>

      <div className="card max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Vote on the Next Sentence</h1>
        <p className="text-gray-400 mb-6">
          Choose which continuation should be added to "The Bitcoin Odyssey"
        </p>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">
            Last sentence in the story:
          </h2>
          <blockquote className="border-l-4 border-primary pl-4 py-2 bg-gray-800 rounded">
            {votingData.lastSentence}
          </blockquote>
        </div>

        <div className="space-y-6 mb-8">
          {votingData.submissions.map((submission) => (
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
                  <p className="mb-2">{submission.text}</p>
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
                      {submission.author}
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
                      {submission.votes} votes
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
            Voting ends in: {votingData.votingEndsIn}
          </div>

          <button
            onClick={handleVote}
            disabled={selectedSubmission === null || hasVoted}
            className={`btn-primary ${
              selectedSubmission === null || hasVoted
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {!connected
              ? "Connect Wallet to Vote"
              : hasVoted
              ? "Vote Submitted!"
              : "Submit Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
