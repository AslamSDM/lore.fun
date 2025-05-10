import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "../../../lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient()

  if (req.method === "POST") {
    const { submission_id, user_id } = req.body

    if (!submission_id || !user_id) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user already voted for this submission
    const { data: existingVote, error: checkError } = await supabase
      .from("votes")
      .select("id")
      .eq("submission_id", submission_id)
      .eq("user_id", user_id)

    if (checkError) {
      return res.status(500).json({ error: checkError.message })
    }

    if (existingVote && existingVote.length > 0) {
      return res.status(400).json({ error: "You have already voted for this submission" })
    }

    // Create the vote
    const { data, error } = await supabase
      .from("votes")
      .insert([
        {
          submission_id,
          user_id,
        },
      ])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data[0])
  }

  return res.status(405).json({ error: "Method not allowed" })
}
