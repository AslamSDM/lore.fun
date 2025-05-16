"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "../hooks/use-wallet";
import { useRouter } from "next/router";
import type { Story, UserStats } from "../lib/types";
import { UsersAPI } from "../lib/api-client";
import { motion } from "framer-motion";
import {
  ScrollAnimation,
  AnimatedHeading,
  ScrollTextAnimation,
} from "@/components/animations/scroll-animation";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, loading, refreshUser, balance } = useWallet();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [updatingUsername, setUpdatingUsername] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Use our API client to fetch user data
        const [statsData, storiesData] = await Promise.all([
          UsersAPI.getStats(user.id),
          UsersAPI.getStories(user.id),
        ]);

        setStats(statsData);
        setStories(storiesData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  // Initialize the username edit form with the current username when editing starts
  useEffect(() => {
    if (editingUsername && user) {
      setUsername(user.username || "");
    }
  }, [editingUsername, user]);

  // Function to handle username update
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate username
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }

    setUpdatingUsername(true);
    setUsernameError("");

    try {
      // Use the API client to update the username
      const result = await UsersAPI.updateUsername(user.id, username);

      if (result.success) {
        // Refresh the user data to get the updated username
        await refreshUser();
        setEditingUsername(false);
      } else {
        setUsernameError(result.error || "Failed to update username");
      }
    } catch (error) {
      setUsernameError((error as Error).message);
    } finally {
      setUpdatingUsername(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedHeading className="text-3xl font-bold mb-8">My Profile</AnimatedHeading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScrollAnimation delay={0.1}>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold"
                  >
                    {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                  </motion.div>
                  <div className="ml-4">
                {!editingUsername ? (
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold">
                      {user.username || "Anonymous"}
                    </h2>
                    <button
                      onClick={() => setEditingUsername(true)}
                      className="ml-2 text-gray-400 hover:text-primary"
                      title="Edit username"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUsernameUpdate} className="w-full">
                    <div className="flex flex-col">
                      <div className="flex">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-full"
                          placeholder="Enter username"
                          autoFocus
                        />
                        <div className="ml-2 flex">
                          <button
                            type="submit"
                            disabled={updatingUsername}
                            className="text-green-500 hover:text-green-400"
                            title="Save"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUsername(false)}
                            className="ml-1 text-red-500 hover:text-red-400"
                            disabled={updatingUsername}
                            title="Cancel"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {usernameError && (
                        <p className="text-red-500 text-xs mt-1">
                          {usernameError}
                        </p>
                      )}
                    </div>
                  </form>
                )}
                <p className="text-gray-400 text-sm truncate w-48">
                  {user.wallet_address}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Member since</p>
                <p>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Wallet Balance</p>
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 text-yellow-500 mr-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span>{balance || 0} LFT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Activity Stats</h2>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stories Created</span>
                  <span className="font-medium">
                    {stats.stories_created_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submissions</span>
                  <span className="font-medium">{stats.submissions_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winning Submissions</span>
                  <span className="font-medium">
                    {stats.winning_submissions_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Votes Cast</span>
                  <span className="font-medium">{stats.votes_cast_count}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Failed to load stats</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Stories</h2>
              <Link href="/create" className="btn-primary">
                Create New Story
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : stories.length > 0 ? (
              <div className="space-y-4">
                {stories.map((story) => (
                  <Link
                    href={`/stories/${story.id}`}
                    key={story.id}
                    className="border border-gray-700 rounded-lg p-4 hover:border-primary cursor-pointer transition-all block"
                  >
                    <h3 className="text-lg font-medium mb-1">{story.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {story.subtitle || story.genre}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Sentences</p>
                        <p>{story.sentences_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Contributors</p>
                        <p>{story.contributors_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p>{new Date(story.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">
                  You haven't created any stories yet.
                </p>
                <Link href="/create" className="btn-primary">
                  Create Your First Story
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
