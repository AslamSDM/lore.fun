import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createMiddlewareSupabaseClient({ req, res })

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    switch (req.method) {
      case "POST":
        // Cast a vote
        const { story_id, submission_id } = req.body

        if (!story_id || !submission_id) {
          return res.status(400).json({ error: "Missing required fields" })
        }

        // Check if user has already voted in this round
        const { data: existingVote, error: checkError } = await supabase
          .from("votes")
          .select("id")
          .eq("story_id", story_id)
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError
        }

        let voteResult

        if (existingVote) {
          // Update existing vote
          const { data, error } = await supabase
            .from("votes")
            .update({ submission_id })
            .eq("id", existingVote.id)
            .select()

          if (error) throw error
          voteResult = data
        } else {
          // Create new vote
          const { data, error } = await supabase
            .from("votes")
            .insert({
              story_id,
              user_id: user.id,
              submission_id,
              status: "active",
            })
            .select()

          if (error) throw error
          voteResult = data
        }

        // Update submission vote count (this would normally be handled by a database trigger)
        await supabase.rpc("increment_vote_count", {
          p_submission_id: submission_id,
        })

        return res.status(200).json(voteResult)

      default:
        res.setHeader("Allow", ["POST"])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("API error:", error)
    return res.status(500).json({ error: error.message })
  }
}
