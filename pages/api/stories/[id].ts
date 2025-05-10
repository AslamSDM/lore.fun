import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "../../../lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient()
  const { id } = req.query

  if (req.method === "GET") {
    // Get story details
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select(`
        *,
        creator:users!stories_created_by_fkey(id, username)
      `)
      .eq("id", id)
      .single()

    if (storyError) {
      return res.status(404).json({ error: "Story not found" })
    }

    // Get story sentences
    const { data: sentences, error: sentencesError } = await supabase
      .from("story_sentences")
      .select(`
        *,
        author:users!story_sentences_submitted_by_fkey(id, username)
      `)
      .eq("story_id", id)
      .order("position", { ascending: true })

    if (sentencesError) {
      return res.status(500).json({ error: sentencesError.message })
    }

    // Get current voting round submissions
    const latestPosition = sentences.length > 0 ? sentences[sentences.length - 1].position : 0
    const currentRound = latestPosition + 1

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        *,
        author:users!submissions_submitted_by_fkey(id, username),
        votes:votes(id)
      `)
      .eq("story_id", id)
      .eq("voting_round", currentRound)
      .eq("is_winner", false)

    if (submissionsError) {
      return res.status(500).json({ error: submissionsError.message })
    }

    // Process submissions to include vote counts and percentages
    const totalVotes = submissions.reduce((sum: number, sub: any) => sum + (sub.votes?.length || 0), 0)

    const processedSubmissions = submissions.map((sub: any) => {
      const votesCount = sub.votes?.length || 0
      const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0

      return {
        ...sub,
        votes_count: votesCount,
        percentage,
      }
    })

    return res.status(200).json({
      story,
      sentences,
      current_round: {
        position: currentRound,
        submissions: processedSubmissions,
        total_votes: totalVotes,
      },
    })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
