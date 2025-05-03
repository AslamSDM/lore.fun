"use client"

import { useState } from "react"

export default function SubmissionForm({ handleSubmit, hasLoreTokens, userHasSubmitted, address }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Please enter your submission")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await handleSubmit(content)

      if (result) {
        setSuccess(true)
        setContent("")
      } else {
        setError("Failed to submit. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-lg text-gray-300 mb-4">Connect your wallet to submit the next line of this story.</p>
      </div>
    )
  }

  if (!hasLoreTokens) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-lg text-gray-300 mb-4">You need to hold $LORE tokens to submit to this story.</p>
      </div>
    )
  }

  if (userHasSubmitted) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-lg text-gray-300 mb-4">
          You have already submitted to this round. Wait for the voting phase!
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-green-700 text-center">
        <p className="text-lg text-green-400 mb-4">Your submission has been added successfully!</p>
        <p className="text-gray-300">Wait for the voting phase to see if your line gets selected.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="submission" className="block text-lg font-medieval text-violet-300 mb-2">
          YOUR SUBMISSION
        </label>
        <textarea
          id="submission"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-white h-24"
          placeholder="Write the next line of the story..."
          maxLength={500}
          required
        />
        <p className="text-sm text-gray-400 mt-2">{content.length}/500 characters</p>
      </div>

      {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">{error}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300 disabled:opacity-50"
        >
          {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
        </button>
      </div>
    </form>
  )
}
