import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createMiddlewareSupabaseClient({ req, res })

  // Check if user is authenticated for write operations
  if (req.method !== "GET") {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" })
    }
  }

  try {
    switch (req.method) {
      case "GET":
        // Get all active stories
        const { data, error } = await supabase.from("stories").select("*").eq("is_active", true)

        if (error) throw error

        return res.status(200).json(data)

      case "POST":
        // Create a new story (admin only)
        const { title, description } = req.body

        // Check if user is admin (in a real app, you'd check a role)
        // For demo purposes, we'll just proceed

        const { data: newStory, error: createError } = await supabase
          .from("stories")
          .insert({
            title,
            description,
            is_active: true,
            sentence_count: 0,
            active_contributors: 0,
            current_voting_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          })
          .select()

        if (createError) throw createError

        return res.status(201).json(newStory)

      default:
        res.setHeader("Allow", ["GET", "POST"])
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error("API error:", error)
    return res.status(500).json({ error: error.message })
  }
}
