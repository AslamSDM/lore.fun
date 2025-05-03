import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const { id } = req.query

  try {
    switch (req.method) {
      case "GET":
        // Get all sentences for a story
        const { data, error } = await supabase
          .from("story_sentences")
          .select("*")
          .eq("story_id", id)
          .order("created_at", { ascending: true })

        if (error) throw error

        return res.status(200).json(data)

      case "POST":
        // Add a winning sentence to the story (admin only)
        const { content, submission_id } = req.body

        // Check if user is admin (in a real app, you'd check a role)
        // For demo purposes, we'll just proceed

        // Start a transaction
        // In a real app, you'd use a database transaction

        // 1. Add the sentence
        const { data: newSentence, error: sentenceError } = await supabase
          .from("story_sentences")
          .insert({
            story_id: id,
            content,
            submission_id,
          })
          .select()

        if (sentenceError) throw sentenceError

        // 2. Update the submission status
        const { error: submissionError } = await supabase
          .from("submissions")
          .update({ status: "accepted" })
          .eq("id", submission_id)

        if (submissionError) throw submissionError

        // 3. Update other submissions for this round
        const { error: otherSubmissionsError } = await supabase
          .from("submissions")
          .update({ status: "rejected" })
          .eq("story_id", id)
          .eq("status", "voting")
          .neq("id", submission_id)

        if (otherSubmissionsError) throw otherSubmissionsError

        // 4. Increment the sentence count
        const { error: storyError } = await supabase.from("stories").update({
          sentence_count: supabase.rpc("increment_sentence_count", { p_story_id: id }),
          current_voting_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        })

        if (storyError) throw storyError

        // 5. Reset votes
        const { error: votesError } = await supabase
          .from("votes")
          .update({ status: "inactive" })
          .eq("story_id", id)
          .eq("status", "active")

        if (votesError) throw votesError

        return res.status(201).json(newSentence)

      default:
        res.setHeader("Allow", ["GET", "POST"])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("API error:", error)
    return res.status(500).json({ error: error.message })
  }
}
