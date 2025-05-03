"use client"

import { useState } from "react"

export default function VotingSection({ submissions, userVotes, handleVote, votingEndsAt, hasLoreTokens, address }) {
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState("")

  // Sort submissions by vote count (descending)
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const aVotes = a.votes && a.votes.length > 0 ? a.votes[0].count : 0
    const bVotes = b.votes && b.votes.length > 0 ? b.votes[0].count : 0
    return bVotes - aVotes
  })

  const timeRemaining = votingEndsAt ? new Date(votingEndsAt) - new Date() : 0
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const onVote = async (submissionId) => {
    if (!address || !hasLoreTokens) return

    setIsVoting(true)
    setError("")

    try {
      const result = await handleVote(submissionId)

      if (!result) {
        setError("Failed to register vote. Please try again.")
      }
    } catch (err) {
      console.error("Error voting:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsVoting(false)
    }
  }

  if (!address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-lg text-gray-300 mb-4">Connect your wallet to vote for the next line of this story.</p>
      </div>
    )
  }

  if (!hasLoreTokens) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-lg text-gray-300 mb-4">You need to hold $LORE tokens to vote on this story.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {votingEndsAt && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
          <p className="text-lg text-gray-300">
            Voting ends in:{" "}
            <span className="text-violet-400 font-bold">
              {daysRemaining}d {hoursRemaining}h
            </span>
          </p>
        </div>
      )}

      {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">{error}</div>}

      <div className="space-y-4">
        {sortedSubmissions.length > 0 ? (
          sortedSubmissions.map((submission) => {
            const voteCount = submission.votes && submission.votes.length > 0 ? submission.votes[0].count : 0
            const hasVoted = userVotes[submission.id]

            return (
              <div
                key={submission.id}
                className={`p-5 rounded-lg border ${hasVoted ? "border-violet-500 bg-violet-900/20" : "border-gray-700 bg-gray-800"}`}
              >
                <p className="text-lg text-gray-200 mb-4">{submission.content}</p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    By: {submission.author_address.substring(0, 6)}...
                    {submission.author_address.substring(submission.author_address.length - 4)}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-violet-300 font-bold">
                      {voteCount} {voteCount === 1 ? "vote" : "votes"}
                    </div>

                    <button
                      onClick={() => onVote(submission.id)}
                      disabled={isVoting}
                      className={`px-4 py-2 rounded-md transition duration-300 ${
                        hasVoted
                          ? "bg-violet-700 text-white hover:bg-violet-600"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } disabled:opacity-50`}
                    >
                      {hasVoted ? "VOTED" : "VOTE"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-6 border border-gray-700 rounded-lg">
            <p className="text-lg text-gray-300">No submissions yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
