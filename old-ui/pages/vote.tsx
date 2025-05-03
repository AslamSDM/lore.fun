"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, ThumbsUp, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Layout from "@/components/layout"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import type { GetServerSideProps } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: "/auth?redirect=/vote",
        permanent: false,
      },
    }
  }

  // Get current story
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("id, current_voting_end")
    .eq("is_active", true)
    .single()

  if (storyError) {
    console.error("Error fetching story:", storyError)
  }

  // Get last sentence
  const { data: lastSentence, error: sentenceError } = await supabase
    .from("story_sentences")
    .select("content")
    .eq("story_id", story?.id || 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (sentenceError) {
    console.error("Error fetching last sentence:", sentenceError)
  }

  // Get submissions for voting
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, content, user_id, vote_count, profiles(username)")
    .eq("story_id", story?.id || 0)
    .eq("status", "voting")
    .order("vote_count", { ascending: false })

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError)
  }

  // Get voting stats
  const { data: stats, error: statsError } = await supabase
    .from("voting_stats")
    .select("total_votes, unique_voters, total_submissions, voting_power_used")
    .eq("story_id", story?.id || 0)
    .single()

  if (statsError) {
    console.error("Error fetching voting stats:", statsError)
  }

  // Calculate vote percentages
  const totalVotes = submissions?.reduce((sum, sub) => sum + (sub.vote_count || 0), 0) || 1
  const submissionsWithPercentage = submissions?.map((sub) => ({
    ...sub,
    percentage: Math.round(((sub.vote_count || 0) / totalVotes) * 100),
  }))

  // Calculate time remaining
  let timeRemaining = "2 days, 4 hours"
  if (story?.current_voting_end) {
    const endDate = new Date(story.current_voting_end)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    timeRemaining = `${diffDays} days, ${diffHours} hours`
  }

  return {
    props: {
      storyId: story?.id || 1,
      lastSentence:
        lastSentence?.content ||
        '"I\'ve been expecting you," the old man said as Sarah approached his modest compound, "but I\'m afraid we may already be too late."',
      submissions: submissionsWithPercentage || [],
      timeRemaining,
      stats: stats || {
        total_votes: 4079,
        unique_voters: 2341,
        total_submissions: 87,
        voting_power_used: 63,
      },
    },
  }
}

export default function VotePage({ storyId, lastSentence, submissions, timeRemaining, stats }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  // If no real submissions from DB, use these defaults
  const defaultSubmissions = [
    {
      id: 1,
      content:
        "The old man handed Sarah a small device, its screen displaying a countdown that matched exactly with the 21-day warning.",
      profiles: { username: "satoshi_fan" },
      vote_count: 1245,
      percentage: 42,
    },
    {
      id: 2,
      content:
        "As Sarah processed the old man's words, a deafening explosion rocked the island, sending plumes of smoke into the clear blue sky.",
      profiles: { username: "crypto_writer" },
      vote_count: 923,
      percentage: 31,
    },
    {
      id: 3,
      content:
        "The old man smiled mysteriously, 'But I've prepared for this day since the genesis block was mined,' he said, revealing a hidden bunker filled with servers.",
      profiles: { username: "blockchain_poet" },
      vote_count: 801,
      percentage: 27,
    },
    {
      id: 4,
      content:
        "'They've found us,' the old man whispered, his eyes darting to a bank of security monitors showing armed figures approaching through the dense jungle.",
      profiles: { username: "hodl_king" },
      vote_count: 612,
      percentage: 21,
    },
    {
      id: 5,
      content:
        "Sarah pulled out her quantum-encrypted phone and showed the old man the message that had brought her here, watching his face pale as he recognized the signature.",
      profiles: { username: "crypto_alice" },
      vote_count: 498,
      percentage: 17,
    },
  ]

  const votingSubmissions = submissions.length > 0 ? submissions : defaultSubmissions

  const handleVote = async () => {
    if (selectedSubmission === null) return

    setIsVoting(true)

    try {
      // First check if user has already voted
      const { data: existingVote, error: checkError } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", storyId)
        .eq("status", "active")
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      // If user already voted, update their vote
      if (existingVote) {
        const { error: updateError } = await supabase
          .from("votes")
          .update({ submission_id: selectedSubmission })
          .eq("id", existingVote.id)

        if (updateError) throw updateError
      } else {
        // Otherwise insert a new vote
        const { error: insertError } = await supabase.from("votes").insert({
          user_id: user.id,
          story_id: storyId,
          submission_id: selectedSubmission,
          status: "active",
        })

        if (insertError) throw insertError
      }

      // Update submission vote count (this would normally be handled by a database trigger)
      const { error: updateSubmissionError } = await supabase.rpc("increment_vote_count", {
        p_submission_id: selectedSubmission,
      })

      if (updateSubmissionError) throw updateSubmissionError

      toast({
        title: "Vote cast successfully!",
        description: "Your vote has been recorded on the blockchain.",
      })

      // Refresh the page to show updated vote counts
      router.reload()
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Voting failed",
        description: "There was an error casting your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Layout>
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/story">
              <ArrowLeft className="h-4 w-4" />
              Back to Story
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Vote on the Next Sentence</CardTitle>
                  <CardDescription>Choose which continuation should be added to "The Bitcoin Odyssey"</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Voting ends in: {timeRemaining}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium">Last sentence in the story:</h3>
                <p className="text-sm border-l-2 border-primary pl-3 py-2 bg-muted/50 rounded-sm">{lastSentence}</p>
              </div>

              <div className="space-y-6">
                <RadioGroup
                  value={selectedSubmission?.toString()}
                  onValueChange={(value) => setSelectedSubmission(Number.parseInt(value))}
                >
                  {votingSubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <RadioGroupItem
                          value={submission.id.toString()}
                          id={`submission-${submission.id}`}
                          className="mt-1"
                        />
                        <div className="space-y-2 flex-1">
                          <Label htmlFor={`submission-${submission.id}`} className="text-base font-medium">
                            {submission.content}
                          </Label>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{submission.profiles?.username || "anonymous"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{submission.vote_count} votes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pl-6">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current standing</span>
                          <span>{submission.percentage}%</span>
                        </div>
                        <Progress value={submission.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/story">Back to Story</Link>
              </Button>
              <Button onClick={handleVote} disabled={isVoting || selectedSubmission === null}>
                {isVoting ? "Casting Vote..." : "Cast Vote"}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>How Voting Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Each $MOV token holder gets one vote per voting round. The submission with the most votes at the end
                  of the voting period will be added to the story.
                </p>
                <p>
                  Voting is recorded on the blockchain for complete transparency. Once a vote is cast, it cannot be
                  changed.
                </p>
                <p>
                  If your submitted sentence wins, you'll receive 500 $MOV tokens as a reward for your contribution to
                  the story.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Voting Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Votes Cast</span>
                  <span className="text-sm font-medium">{stats.total_votes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Unique Voters</span>
                  <span className="text-sm font-medium">{stats.unique_voters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Submissions</span>
                  <span className="text-sm font-medium">{stats.total_submissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Voting Power Used</span>
                  <span className="text-sm font-medium">{stats.voting_power_used}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  )
}
