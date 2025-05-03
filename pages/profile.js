"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useWeb3 } from "../context/Web3Context";
import StoryCard from "../components/StoryCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile({ supabaseClient }) {
  const { address, hasLoreTokens, loreBalance, connectWallet } = useWeb3();

  const [userStories, setUserStories] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stories");

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      try {
        // Fetch stories created by user
        const { data: storiesData, error: storiesError } = await supabaseClient
          .from("stories")
          .select("*")
          .eq("creator_address", address)
          .order("created_at", { ascending: false });

        if (storiesError) {
          console.error("Error fetching user stories:", storiesError);
        } else {
          setUserStories(storiesData || []);
        }

        // Fetch user contributions (submissions that were selected)
        const { data: contributionsData, error: contributionsError } =
          await supabaseClient
            .from("submissions")
            .select(
              `
            id,
            content,
            created_at,
            stories(id, title)
          `
            )
            .eq("author_address", address)
            .eq("is_selected", true)
            .order("created_at", { ascending: false });

        if (contributionsError) {
          console.error(
            "Error fetching user contributions:",
            contributionsError
          );
        } else {
          setContributions(contributionsData || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [address, supabaseClient]);

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-medieval text-violet-400 mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-gray-300 mb-8">
          Connect your wallet to view your profile and stories.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300"
        >
          CONNECT WALLET
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>Your Profile | Lore.fun</title>
        <meta
          name="description"
          content="View your profile and stories on Lore.fun"
        />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
            <h1 className="text-3xl font-bold text-violet-400 mb-4 font-medieval">
              YOUR PROFILE
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-gray-300 mb-2">
                  <span className="text-gray-400">Address:</span>{" "}
                  <span className="font-mono">{address}</span>
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">$LORE Balance:</span>{" "}
                  {loreBalance === null ? (
                    <span className="text-yellow-400">Loading...</span>
                  ) : loreBalance === "Error" ? (
                    <span className="text-red-400">Error loading balance</span>
                  ) : (
                    <span
                      className={
                        hasLoreTokens ? "text-green-400" : "text-red-400"
                      }
                    >
                      {loreBalance} $LORE
                    </span>
                  )}
                </p>
                {hasLoreTokens && (
                  <p className="text-green-400 text-sm mt-1">
                    You have enough $LORE to participate in all platform
                    activities
                  </p>
                )}
              </div>

              <Link href="/create-story">
                <div className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
                  CREATE NEW STORY
                </div>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex border-b border-gray-700">
              <button
                className={`px-6 py-3 font-medieval text-lg ${
                  activeTab === "stories"
                    ? "border-b-2 border-violet-500 text-violet-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("stories")}
              >
                YOUR STORIES
              </button>
              <button
                className={`px-6 py-3 font-medieval text-lg ${
                  activeTab === "contributions"
                    ? "border-b-2 border-violet-500 text-violet-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("contributions")}
              >
                YOUR CONTRIBUTIONS
              </button>
            </div>
          </div>

          {activeTab === "stories" ? (
            userStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border border-gray-700 rounded-lg">
                <h3 className="text-2xl font-medieval text-violet-400 mb-4">
                  No Stories Created Yet
                </h3>
                <p className="text-gray-300 mb-6">
                  Start your first saga and let the community contribute!
                </p>
                <Link href="/create-story">
                  <div className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
                    CREATE STORY
                  </div>
                </Link>
              </div>
            )
          ) : contributions.length > 0 ? (
            <div className="space-y-6">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="bg-gray-800 p-6 rounded-lg border border-gray-700"
                >
                  <Link href={`/story/${contribution.stories.id}`}>
                    <div className="text-xl font-medieval text-violet-400 hover:underline mb-2 block">
                      {contribution.stories.title}
                    </div>
                  </Link>
                  <p className="text-gray-300 mb-4">{contribution.content}</p>
                  <p className="text-sm text-gray-400">
                    Added on{" "}
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-medieval text-violet-400 mb-4">
                No Contributions Yet
              </h3>
              <p className="text-gray-300 mb-6">
                Start contributing to stories to see your additions here!
              </p>
              <Link href="/">
                <div className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
                  BROWSE STORIES
                </div>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
