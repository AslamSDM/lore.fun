import Link from "next/link";
import { useState, useEffect } from "react";
import type { Story } from "../../lib/types";
import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import { StoryCard } from "@/components/stories/story-card";
import {
  ScrollAnimation,
  AnimatedHeading,
} from "@/components/animations/scroll-animation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useNotifications } from "@/hooks/use-notifications";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useTokenRequirements } from "@/lib/token-requirements";

interface StoriesPageProps {
  initialStories: Story[];
  initialError?: string;
}

export default function StoriesPage({
  initialStories,
  initialError = "",
}: StoriesPageProps) {
  const { connected } = useWallet();
  const { balance } = useTokenBalance();
  const tokenReqs = useTokenRequirements();
  const { notifyWarning, notifyInfo } = useNotifications();
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [loading, setLoading] = useState(
    initialStories.length === 0 && !initialError
  );
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    // We only need to fetch data if we don't have initial data from SSR
    // or if there was an error that needs refresh
    if (initialStories.length === 0 || initialError) {
      const fetchStories = async () => {
        try {
          const response = await fetch("/api/stories");
          if (!response.ok) {
            throw new Error("Failed to fetch stories");
          }
          const data = await response.json();
          setStories(data);
          setError(null);
        } catch (err) {
          setError("Error loading stories. Please try again later.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchStories();
    }
  }, [initialStories, initialError]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <AnimatedHeading el="h1" className="text-3xl font-bold">
          Community Stories
        </AnimatedHeading>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (!connected) {
                notifyWarning(
                  "Please connect your wallet first",
                  "Wallet Required"
                );
                return;
              }
              // Check if user has enough tokens to create a story
              if (
                tokenReqs.checkAction("create", balance, () => {
                  notifyInfo(
                    `You need at least ${tokenReqs.minTokensToCreate} LORE tokens to create a new story.`
                  );
                })
              ) {
                window.location.href = "/create";
              }
            }}
          >
            Create New Story
          </Button>
        </motion.div>
      </div>

      {stories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <ScrollAnimation>
            <p className="text-gray-400 mb-4">
              No stories found. Be the first to create one!
            </p>{" "}
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (!connected) {
                  notifyWarning(
                    "Please connect your wallet first",
                    "Wallet Required"
                  );
                  return;
                }
                // Check if user has enough tokens to create a story
                if (
                  tokenReqs.checkAction("create", balance, () => {
                    notifyInfo(
                      `You need at least ${tokenReqs.minTokensToCreate} LORE tokens to create a new story.`
                    );
                  })
                ) {
                  window.location.href = "/create";
                }
              }}
            >
              Create New Story
            </Button>
          </ScrollAnimation>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// Server Side Props to pre-fetch data
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Enable caching for 60 seconds on this page
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=120"
  );

  try {
    // Get all stories with related data using optimized queries
    const stories = await prisma.story.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            sentences: true, // Count sentences efficiently
          },
        },
        sentences: {
          select: {
            id: true,
            submittedBy: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Process stories to get the expected format with better performance
    const processedData = stories.map((story) => {
      // Get unique contributors more efficiently
      const uniqueContributors = new Set<string>();
      story.sentences.forEach((sentence) => {
        uniqueContributors.add(sentence.submittedBy);
      });

      // Format response to match expected structure
      return {
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
        sentences_count: story._count.sentences, // Use the more efficient count
        contributors_count: uniqueContributors.size,
      };
    });

    return {
      props: {
        initialStories: processedData,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        initialStories: [],
        initialError: "Failed to load stories",
      },
    };
  }
};
