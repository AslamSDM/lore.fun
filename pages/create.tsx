"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWallet } from "../hooks/use-wallet";

export default function CreateStoryPage() {
  const router = useRouter();
  const { connected, connect, balance } = useWallet();
  const [title, setTitle] = useState("");
  const [firstSentence, setFirstSentence] = useState("");
  const [genre, setGenre] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!connected) {
      connect();
      return;
    }

    if (!title || !firstSentence || !genre) {
      setError("Please fill in all fields.");
      return;
    }

    if (balance < 500) {
      setError("You need at least 500 $LORE tokens to create a new story.");
      return;
    }

    setError("");
    setIsCreating(true);

    // Simulate creation on blockchain
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsCreating(false);
    router.push("/stories/new-story");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
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
          Back to Home
        </p>
      </Link>

      <div className="card max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a New Story</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">
              Story Title
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Genre</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Select a genre</option>
              <option value="sci-fi">Science Fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="thriller">Thriller</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="adventure">Adventure</option>
              <option value="historical">Historical Fiction</option>
              <option value="crypto">Crypto Fiction</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              First Sentence
            </label>
            <textarea
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Start your story with a captivating first sentence..."
              value={firstSentence}
              onChange={(e) => setFirstSentence(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Story Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Minimum sentences for completion</span>
                <span className="font-medium">100</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Voting period</span>
                <span className="font-medium">3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Submission period</span>
                <span className="font-medium">12 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Required tokens to create</span>
                <span className="font-medium text-primary">500 $LORE</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 px-4 py-3 rounded my-6">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isCreating}
          className={`btn-primary w-full mt-8 ${
            isCreating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {!connected
            ? "Connect Wallet to Create"
            : isCreating
            ? "Creating Story..."
            : "Create New Story"}
        </button>
      </div>
    </div>
  );
}
