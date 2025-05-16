import Link from "next/link"
import { useState, useEffect } from "react"
import type { Story } from "../../lib/types"
import { GetServerSideProps } from "next"
import { prisma } from "../../lib/prisma"

interface StoriesPageProps {
  initialStories: Story[];
  initialError?: string;
}

export default function StoriesPage({ initialStories, initialError = "" }: StoriesPageProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [loading, setLoading] = useState(initialStories.length === 0 && !initialError)
  const [error, setError] = useState<string | null>(initialError)

  useEffect(() => {
    // We only need to fetch data if we don't have initial data from SSR
    // or if there was an error that needs refresh
    if (initialStories.length === 0 || initialError) {
      const fetchStories = async () => {
        try {
          const response = await fetch("/api/stories")
          if (!response.ok) {
            throw new Error("Failed to fetch stories")
          }
          const data = await response.json()
          setStories(data)
          setError(null)
        } catch (err) {
          setError("Error loading stories. Please try again later.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      fetchStories()
    }
  }, [initialStories, initialError])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading stories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Stories</h1>
        <Link href="/create" className="btn-primary">
          Create New Story
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400 mb-4">No stories found. Be the first to create one!</p>
          <Link href="/create" className="btn-primary">
            Create New Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            // Calculate progress percentage based on sentences count and min_sentences
            const progress = Math.min(
              Math.round(((story.sentences_count || 0) / (story.min_sentences || 100)) * 100),
              100,
            )

            return (
              <Link
                href={`/stories/${story.id}`}
                key={story.id}
                className="card hover:border-primary transition-all block"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{story.title}</h2>
                  <p className="text-gray-400">{story.subtitle || story.genre}</p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-value" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Sentences</p>
                    <p className="font-medium">{story.sentences_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Contributors</p>
                    <p className="font-medium">{story.contributors_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Genre</p>
                    <p className="font-medium">{story.genre}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="font-medium">{new Date(story.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Server Side Props to pre-fetch data
export const getServerSideProps: GetServerSideProps = async () => {
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
