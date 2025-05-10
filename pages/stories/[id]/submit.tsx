"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../../../hooks/use-wallet";

export default function SubmitPage() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, connect, balance } = useWallet();
  const [submission, setSubmission] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    if (wordCount < 10 || wordCount > 50) {
      setError("Your submission must be between 10-50 words.");
      return;
    }

    if (balance < 100) {
      setError("You need at least 100 $LORE tokens to submit.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Simulate submission to blockchain
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    router.push(`/stories/${id}`);
  };

  const handleCancel = () => {
    router.push(`/stories/${id}`);
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

      <div className="card max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Submit Your Continuation</h1>
        <p className="text-gray-400 mb-6">
          Propose the next sentence in "The Bitcoin Odyssey"
        </p>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">
            Last sentence in the story:
          </h2>
          <blockquote className="border-l-4 border-primary pl-4 py-2 bg-gray-800 rounded">
            "I've been expecting you," the old man said as Sarah approached his
            modest compound, "but I'm afraid we may already be too late."
          </blockquote>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <svg
              className="w-5 h-5 text-primary mr-2"
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
              Your submission should be a single sentence that continues the
              story
            </li>
            <li>Keep it between 10-50 words</li>
            <li>Stay consistent with the established tone and plot</li>
            <li>You must hold at least 100 $LORE tokens to submit</li>
            <li>Submissions close in 12 hours</li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">
            Your submission:
          </label>
          <textarea
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your continuation here..."
            value={submission}
            onChange={handleSubmissionChange}
          ></textarea>
          <div className="flex justify-end text-sm text-gray-400 mt-2">
            {charCount} characters | {wordCount} words
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`btn-primary ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {!connected
              ? "Connect Wallet to Submit"
              : isSubmitting
              ? "Submitting..."
              : "Submit for Voting"}
          </button>
        </div>
      </div>
    </div>
  );
}
