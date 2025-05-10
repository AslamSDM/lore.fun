import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "../../../lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient()

  if (req.method === "POST") {
    const { story_id, content, submitted_by } = req.body

    if (!story_id || !content || !submitted_by) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Get the latest sentence position for this story
    const { data: latestSentence, error: sentenceError } = await supabase
      .from("story_sentences")
      .select("position")
      .eq("story_id", story_id)
      .order("position", { ascending: false })
      .limit(1)
      .single()

    if (sentenceError && sentenceError.code !== "PGRST116") {
      return res.status(500).json({ error: sentenceError.message })
    }

    const currentRound = latestSentence ? latestSentence.position + 1 : 1

    // Create the submission
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          story_id,
          content,
          submitted_by,
          voting_round: currentRound,
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
