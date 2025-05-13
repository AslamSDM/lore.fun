"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import type { Story, StorySentence, Submission } from "../../lib/types"
import { useWallet } from "../../hooks/use-wallet"

interface StoryData {
  story: Story
  sentences: StorySentence[]
  current_round: {
    position: number
    submissions: Submission[]
    total_votes: number
  }
}

export default function StoryPage() {
  const router = useRouter()
  const { id } = router.query
  const { connected } = useWallet()
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await fetch(`/api/stories/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Story not found")
          }
          throw new Error("Failed to fetch story")
        }

        const data = await response.json()
        setStoryData(data)
      } catch (err) {
        setError((err as Error).message || "Error loading story")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStory()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading story...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/stories" className="btn-primary">
            Back to Stories
          </Link>
        </div>
      </div>
    )
  }

  if (!storyData) return null

  const { story, sentences, current_round } = storyData

  // Calculate progress percentage
  const progress = Math.min(Math.round((sentences.length / (story.min_sentences || 100)) * 100), 100)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/stories" className="flex items-center text-gray-400 hover:text-white mb-6">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Stories
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{story.title}</h1>
                <p className="text-gray-400">{story.subtitle || `A ${story.genre} story by the community`}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full mb-2">
                  {progress < 100 ? "In Progress" : "Completed"}
                </span>
                <div className="text-sm text-gray-400">
                  {sentences.length} of {story.min_sentences} sentences
                </div>
              </div>
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
              {current_round.submissions.length > 0
                ? `Vote closes in ${story.voting_period_days} days`
                : "Waiting for submissions"}
            </p>

            {current_round.submissions.length > 0 ? (
              <div className="space-y-6">
                {current_round.submissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">By {submission.author?.username || "Anonymous"}</p>
                      <p className="text-sm text-gray-400">
                        {submission.percentage}% ({submission.votes_count} votes)
                      </p>
                    </div>
                    <blockquote className="border-l-4 border-primary pl-4 italic mb-4">
                      "{submission.content}"
                    </blockquote>
                    <Link href={`/stories/${id}/vote`} className="btn-primary text-center block w-full">
                      Vote
                    </Link>
                  </div>
                ))}

                <Link href={`/stories/${id}/vote`} className="text-primary hover:underline block text-center mt-6">
                  View All Submissions
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">No submissions yet. Be the first to contribute!</p>
                {connected ? (
                  <Link href={`/stories/${id}/submit`} className="btn-primary">
                    Submit Next Sentence
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400">Connect your wallet to submit</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            {connected ? (
              <Link href={`/stories/${id}/submit`} className="btn-primary">
                Submit Next Sentence
              </Link>
            ) : (
              <div className="card text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to participate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
