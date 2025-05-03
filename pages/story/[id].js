"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useWeb3 } from "../../context/Web3Context"
import SubmissionForm from "../../components/SubmissionForm"
import VotingSection from "../../components/VotingSection"
import StoryContent from "../../components/StoryContent"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function StoryDetail({ supabaseClient }) {
  const router = useRouter()
  const { id } = router.query
  const { address, hasLoreTokens, checkTokenBalance } = useWeb3()

  const [story, setStory] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [currentRound, setCurrentRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [votingEndsAt, setVotingEndsAt] = useState(null)
  const [isVotingPhase, setIsVotingPhase] = useState(false)
  const [userHasSubmitted, setUserHasSubmitted] = useState(false)
  const [userVotes, setUserVotes] = useState({})

  useEffect(() => {
    if (!id) return

    async function fetchStoryData() {
      try {
        // Fetch story details
        const { data: storyData, error: storyError } = await supabaseClient
          .from("stories")
          .select("*")
          .eq("id", id)
          .single()

        if (storyError) {
          console.error("Error fetching story:", storyError)
          return
        }

        setStory(storyData)

        // Fetch current round
        const { data: roundData, error: roundError } = await supabaseClient
          .from("story_rounds")
          .select("*")
          .eq("story_id", id)
          .order("round_number", { ascending: false })
          .limit(1)
          .single()

        if (roundError && roundError.code !== "PGRST116") {
          console.error("Error fetching current round:", roundError)
        } else if (roundData) {
          setCurrentRound(roundData)
          setVotingEndsAt(new Date(roundData.voting_ends_at))
          setIsVotingPhase(roundData.phase === "voting")

          // Fetch submissions for current round
          const { data: submissionsData, error: submissionsError } = await supabaseClient
            .from("submissions")
            .select("*, votes(count)")
            .eq("round_id", roundData.id)
            .order("created_at", { ascending: true })

          if (submissionsError) {
            console.error("Error fetching submissions:", submissionsError)
          } else {
            setSubmissions(submissionsData || [])
          }

          // Check if user has submitted
          if (address) {
            const { data: userSubmission, error: userSubmissionError } = await supabaseClient
              .from("submissions")
              .select("id")
              .eq("round_id", roundData.id)
              .eq("author_address", address)
              .limit(1)

            if (!userSubmissionError) {
              setUserHasSubmitted(userSubmission && userSubmission.length > 0)
            }

            // Fetch user votes
            const { data: userVotesData, error: userVotesError } = await supabaseClient
              .from("votes")
              .select("submission_id")
              .eq("round_id", roundData.id)
              .eq("voter_address", address)

            if (!userVotesError && userVotesData) {
              const votesMap = {}
              userVotesData.forEach((vote) => {
                votesMap[vote.submission_id] = true
              })
              setUserVotes(votesMap)
            }
          }
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStoryData()

    // Check token balance
    if (address) {
      checkTokenBalance(address)
    }
  }, [id, supabaseClient, address, checkTokenBalance])

  async function handleSubmit(content) {
    if (!address || !hasLoreTokens || !currentRound) return

    try {
      const { data, error } = await supabaseClient
        .from("submissions")
        .insert([
          {
            round_id: currentRound.id,
            story_id: id,
            content,
            author_address: address,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error submitting content:", error)
        return false
      }

      // Update submissions list
      setSubmissions([...submissions, data])
      setUserHasSubmitted(true)
      return true
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  }

  async function handleVote(submissionId) {
    if (!address || !hasLoreTokens || !currentRound) return

    try {
      // Check if user already voted for this submission
      if (userVotes[submissionId]) {
        // Remove vote
        const { error } = await supabaseClient
          .from("votes")
          .delete()
          .eq("submission_id", submissionId)
          .eq("voter_address", address)

        if (error) {
          console.error("Error removing vote:", error)
          return false
        }

        // Update user votes
        const newUserVotes = { ...userVotes }
        delete newUserVotes[submissionId]
        setUserVotes(newUserVotes)
      } else {
        // Add vote
        const { error } = await supabaseClient.from("votes").insert([
          {
            round_id: currentRound.id,
            story_id: id,
            submission_id: submissionId,
            voter_address: address,
          },
        ])

        if (error) {
          console.error("Error adding vote:", error)
          return false
        }

        // Update user votes
        setUserVotes({ ...userVotes, [submissionId]: true })
      }

      // Refresh submissions to update vote counts
      const { data, error } = await supabaseClient
        .from("submissions")
        .select("*, votes(count)")
        .eq("round_id", currentRound.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error refreshing submissions:", error)
      } else {
        setSubmissions(data || [])
      }

      return true
    } catch (error) {
      console.error("Error:", error)
      return false
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-medieval text-violet-400 mb-4">Story Not Found</h1>
        <p className="text-gray-300 mb-8">The story you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300"
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>{story.title} | Lore.fun</title>
        <meta name="description" content={`${story.description || "A collaborative story on Lore.fun"}`} />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-violet-400 font-medieval">{story.title}</h1>
            <p className="text-xl text-gray-300 mb-6">{story.description}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-gray-800 px-4 py-2 rounded-md">
                <span className="text-gray-400">Created by:</span>{" "}
                <span className="text-violet-300">
                  {story.creator_address.substring(0, 6)}...
                  {story.creator_address.substring(story.creator_address.length - 4)}
                </span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-md">
                <span className="text-gray-400">Contributors:</span>{" "}
                <span className="text-violet-300">{story.contributor_count || 0}</span>
              </div>
              {currentRound && (
                <div className="bg-gray-800 px-4 py-2 rounded-md">
                  <span className="text-gray-400">Round:</span>{" "}
                  <span className="text-violet-300">{currentRound.round_number}</span>
                </div>
              )}
            </div>
          </div>

          <StoryContent story={story} />

          {currentRound && (
            <div className="mt-12 border-t border-gray-700 pt-8">
              <h2 className="text-3xl font-bold text-violet-400 mb-6 font-medieval">
                {isVotingPhase ? "VOTE FOR THE NEXT LINE" : "SUBMIT THE NEXT LINE"}
              </h2>

              {isVotingPhase ? (
                <VotingSection
                  submissions={submissions}
                  userVotes={userVotes}
                  handleVote={handleVote}
                  votingEndsAt={votingEndsAt}
                  hasLoreTokens={hasLoreTokens}
                  address={address}
                />
              ) : (
                <SubmissionForm
                  handleSubmit={handleSubmit}
                  hasLoreTokens={hasLoreTokens}
                  userHasSubmitted={userHasSubmitted}
                  address={address}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
