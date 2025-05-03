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
      case "GET":
        // Get submissions with optional filters
        const { story_id, status, user_id } = req.query

        let query = supabase.from("submissions").select("*, profiles(username)")

        if (story_id) query = query.eq("story_id", story_id)
        if (status) query = query.eq("status", status)
        if (user_id) query = query.eq("user_id", user_id)

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) throw error

        return res.status(200).json(data)

      case "POST":
        // Create a new submission
        const { story_id: reqStoryId, content } = req.body

        if (!reqStoryId || !content) {
          return res.status(400).json({ error: "Missing required fields" })
        }

        // Check if user has already submitted for this story's current round
        const { data: existingSubmission, error: checkError } = await supabase
          .from("submissions")
          .select("id")
          .eq("story_id", reqStoryId)
          .eq("user_id", user.id)
          .eq("status", "voting")
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError
        }

        if (existingSubmission) {
          return res.status(400).json({ error: "You have already submitted for this round" })
        }

        // Create the submission
        const { data: newSubmission, error: createError } = await supabase
          .from("submissions")
          .insert({
            story_id: reqStoryId,
            user_id: user.id,
            content,
            status: "voting",
            vote_count: 0,
          })
          .select()

        if (createError) throw createError

        return res.status(201).json(newSubmission)

      default:
        res.setHeader("Allow", ["GET", "POST"])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("API error:", error)
    return res.status(500).json({ error: error.message })
  }
}
