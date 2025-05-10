"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";

export default function Home() {
  const { connect, connected } = useWallet();

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-medieval2">
                Collaborative Storytelling on the Blockchain
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Join the first decentralized story production. Submit
                storylines, vote on the best content, and help create a
                $LORE-themed story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/stories">
                  <p className="btn-primary">Read Current Story</p>
                </Link>
                {!connected && (
                  <button onClick={connect} className="btn-secondary">
                    Connect Wallet to Participate
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-2">Current Progress</h2>
              <p className="text-gray-400 mb-6">The $LORE story is evolving</p>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Image
                        src="/logo.svg"
                        width={20}
                        height={20}
                        alt="Story icon"
                      />
                      <span className="ml-2">Story Progress: 15%</span>
                    </div>
                    <span>12 sentences</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-value"
                      style={{ width: "15%" }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="ml-2">Active Contributors</span>
                  </div>
                  <span>237</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="ml-2">Current Voting Round</span>
                  </div>
                  <span>Ends in 2 days</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="ml-2">$LORE Token Price</span>
                  </div>
                  <span>0.0015 SOL</span>
                </div>
              </div>

              <Link href="/submit">
                <p className="btn-primary w-full text-center mt-8 block">
                  Submit Next Sentence
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 font-medieval">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Our decentralized platform allows token holders to shape the future
            of storytelling
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">1. Connect Wallet</h3>
              <p className="text-gray-300">
                Hold $LORE tokens to participate in the storytelling process
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">2. Submit Ideas</h3>
              <p className="text-gray-300">
                Propose the next sentence in the $LORE story storyline
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">3. Vote</h3>
              <p className="text-gray-300">
                Cast your vote for the best continuation of the story
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">4. Earn Rewards</h3>
              <p className="text-gray-300">
                Get rewarded when your submissions are selected by the community
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
