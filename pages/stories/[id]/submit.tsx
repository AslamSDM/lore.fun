"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { useWallet } from "../../../hooks/use-wallet"
import type { Story, StorySentence } from "../../../lib/types"

interface StoryData {
  story: Story
  sentences: StorySentence[]
  current_round: {
    position: number
    submissions: any[]
    total_votes: number
  }
}

export default function SubmitPage() {
  const router = useRouter()
  const { id } = router.query
  const { connected, connect, user } = useWallet()
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [submission, setSubmission] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const handleSubmissionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setSubmission(text)
    setCharCount(text.length)
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length)
  }

  const handleSubmit = async () => {
    if (!connected) {
      connect()
      return
    }

    if (!user) {
      setError("Please connect your wallet to submit")
      return
    }

    if (wordCount < 10 || wordCount > 50) {
      setError("Your submission must be between 10-50 words.")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          story_id: id,
          content: submission,
          submitted_by: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit continuation")
      }

      setSubmitSuccess(true)

      // Redirect back to story page after successful submission
      setTimeout(() => {
        router.push(`/stories/${id}`)
      }, 2000)
    } catch (err) {
      setError((err as Error).message || "Error submitting continuation")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/stories/${id}`)
  }

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

  if (!storyData) return null

  const { story, sentences } = storyData
  const lastSentence = sentences.length > 0 ? sentences[sentences.length - 1].content : story.first_sentence

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/stories/${id}`} className="flex items-center text-gray-400 hover:text-white mb-6">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Story
      </Link>

      <div className="card max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Submit Your Continuation</h1>
        <p className="text-gray-400 mb-6">Propose the next sentence in "{story.title}"</p>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Last sentence in the story:</h2>
          <blockquote className="border-l-4 border-primary pl-4 py-2 bg-gray-800 rounded">{lastSentence}</blockquote>
        </div>

        {submitSuccess ? (
          <div className="bg-green-900 bg-opacity-30 border border-green-500 text-green-300 px-4 py-6 rounded mb-6 text-center">
            <p className="text-xl mb-2">Submission successful!</p>
            <p>Your continuation has been submitted for voting. Redirecting back to the story...</p>
          </div>
        ) : (
          <>
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
                <li>Your submission should be a single sentence that continues the story</li>
                <li>Keep it between 10-50 words</li>
                <li>Stay consistent with the established tone and plot</li>
                <li>You must hold $LORE tokens to submit</li>
                <li>Submissions close in {story.submission_period_hours} hours</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Your submission:</label>
              <textarea
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your continuation here..."
                value={submission}
                onChange={handleSubmissionChange}
                disabled={isSubmitting}
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
              <button onClick={handleCancel} className="btn-secondary" disabled={isSubmitting}>
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`btn-primary ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {!connected ? "Connect Wallet to Submit" : isSubmitting ? "Submitting..." : "Submit for Voting"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
