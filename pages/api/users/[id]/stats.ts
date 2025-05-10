import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "../../../../lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient()
  const { id } = req.query

  if (req.method === "GET") {
    // Get submissions count
    const { count: submissionsCount, error: submissionsError } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("submitted_by", id)

    if (submissionsError) {
      return res.status(500).json({ error: submissionsError.message })
    }

    // Get winning submissions count
    const { count: winningCount, error: winningError } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("submitted_by", id)
      .eq("is_winner", true)

    if (winningError) {
      return res.status(500).json({ error: winningError.message })
    }

    // Get votes cast count
    const { count: votesCount, error: votesError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)

    if (votesError) {
      return res.status(500).json({ error: votesError.message })
    }

    // Get stories created count
    const { count: storiesCount, error: storiesError } = await supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("created_by", id)

    if (storiesError) {
      return res.status(500).json({ error: storiesError.message })
    }

    return res.status(200).json({
      submissions_count: submissionsCount || 0,
      winning_submissions_count: winningCount || 0,
      votes_cast_count: votesCount || 0,
      stories_created_count: storiesCount || 0,
    })
  }

  return res.status(405).json({ error: "Method not allowed" })
}
