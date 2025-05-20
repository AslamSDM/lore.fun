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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useTokenRequirements } from "@/lib/token-requirements";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useWallet();
  const { balance, solBalance } = useTokenBalance();
  const tokenReqs = useTokenRequirements();
  const { notifyWarning, notifySuccess, notifyInfo, notifyError } =
    useNotifications();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Helper function to replace checkTokenRequirement
  const handleCreateStory = () => {
    if (
      tokenReqs.checkAction("create", balance, () => {
        notifyInfo(
          `You need at least ${tokenReqs.minTokensToCreate} LORE tokens to create a story.`
        );
      })
    ) {
      router.push("/create");
    }
  };

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
      notifyWarning(
        "Username must be at least 3 characters",
        "Username Too Short"
      );
      setUsernameError("Username must be at least 3 characters"); // Keep for UI display
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
        notifySuccess(
          "Username has been updated successfully!",
          "Username Updated"
        );
      } else {
        const errorMsg = result.error || "Failed to update username";
        notifyError(errorMsg, "Update Failed");
        setUsernameError(errorMsg); // Keep for UI display
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      notifyError(errorMsg, "Update Error");
      setUsernameError(errorMsg); // Keep for UI display
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
      <AnimatedHeading className="text-3xl font-bold mb-8">
        My Profile
      </AnimatedHeading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ScrollAnimation delay={0.1}>
            <div className="h-4"></div> {/* Empty div as placeholder content */}
          </ScrollAnimation>
          <Card className="backdrop-blur-md bg-card/40 shadow-xl border-primary/30 border mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-primary">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-24 h-24 bg-primary/80 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl"
                >
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </motion.div>
                <div className="sm:ml-2 flex-1">
                  {!editingUsername ? (
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold text-foreground">
                        {user.username || "Anonymous"}
                      </h2>
                      <button
                        onClick={() => setEditingUsername(true)}
                        className="ml-3 text-gray-400 hover:text-primary transition-colors"
                        title="Edit username"
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
                            className="bg-background/50 backdrop-blur-sm border border-primary/20 rounded-md px-4 py-2.5 text-base w-full"
                            placeholder="Enter username"
                            autoFocus
                          />
                          <div className="ml-2 flex">
                            <button
                              type="submit"
                              disabled={updatingUsername}
                              className="text-green-500 hover:text-green-400 p-2.5"
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
                              className="ml-1 text-red-500 hover:text-red-400 p-2.5"
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
                          <p className="text-red-500 text-xs mt-2">
                            {usernameError}
                          </p>
                        )}
                      </div>
                    </form>
                  )}
                  <p className="text-muted-foreground text-sm mt-2 truncate max-w-full">
                    {user.wallet_address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-6 pt-6 border-t border-primary/20">
                <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10">
                  <p className="text-muted-foreground text-sm mb-2">
                    Member since
                  </p>
                  <p className="font-medium text-foreground text-lg">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10">
                  <p className="text-muted-foreground text-sm mb-2">
                    Wallet Balance
                  </p>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <svg
                        className="h-6 w-6 text-primary mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span className="font-bold text-xl">
                        {balance || 0}{" "}
                        <span className="text-primary">LORE</span>
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      SPL token balance on Solana
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/40 shadow-xl border-primary/30 border mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-primary">
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center transition-all hover:bg-primary/10">
                    <span className="text-2xl font-bold text-primary mb-2">
                      {stats.stories_created_count}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      Stories Created
                    </span>
                  </div>
                  <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center transition-all hover:bg-primary/10">
                    <span className="text-2xl font-bold text-primary mb-2">
                      {stats.submissions_count}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      Submissions
                    </span>
                  </div>
                  <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center transition-all hover:bg-primary/10">
                    <span className="text-2xl font-bold text-primary mb-2">
                      {stats.winning_submissions_count}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      Winning Submissions
                    </span>
                  </div>
                  <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center transition-all hover:bg-primary/10">
                    <span className="text-2xl font-bold text-primary mb-2">
                      {stats.votes_cast_count}
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                      Votes Cast
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-6 text-center">
                  Failed to load stats
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="backdrop-blur-md bg-card/40 shadow-xl border-primary/30 border mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-primary">
                  My Stories
                </CardTitle>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/80"
                  onClick={() => {
                    // Check if user has enough tokens to create a story
                    if (
                      tokenReqs.checkAction("create", balance, () => {
                        notifyInfo(
                          `You need at least ${tokenReqs.minTokensToCreate} LORE tokens to create a story.`
                        );
                      })
                    ) {
                      router.push("/create");
                    }
                  }}
                >
                  Create New Story
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                </div>
              ) : stories.length > 0 ? (
                <div className="space-y-5">
                  {stories.map((story) => (
                    <Link
                      href={`/stories/${story.id}`}
                      key={story.id}
                      className="border border-primary/20 rounded-lg p-5 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all block"
                    >
                      <h3 className="text-lg font-medium mb-2 text-foreground">
                        {story.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {story.subtitle || story.genre}
                      </p>

                      <div className="grid grid-cols-3 gap-6 text-sm">
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
                          <span className="text-base font-medium mb-1">
                            {story.sentences_count}
                          </span>
                          <span className="text-xs text-muted-foreground text-center">
                            Sentences
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
                          <span className="text-base font-medium mb-1">
                            {story.contributors_count}
                          </span>
                          <span className="text-xs text-muted-foreground text-center">
                            Contributors
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
                          <span className="text-base font-medium mb-1">
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground text-center">
                            Created
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't created any stories yet.
                  </p>
                  <Button
                    variant="default"
                    className="bg-primary hover:bg-primary/80"
                    onClick={() => {
                      // Check if user has enough tokens to create a story
                      if (
                        tokenReqs.checkAction("create", balance, () => {
                          notifyInfo(
                            `You need at least ${tokenReqs.minTokensToCreate} LORE tokens to create a story.`
                          );
                        })
                      ) {
                        router.push("/create");
                      }
                    }}
                  >
                    Create Your First Story
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
