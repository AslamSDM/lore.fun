import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: "Story ID is required" })
  }

  // GET - Fetch a single story
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase.from("stories").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching story:", error)
        return res.status(404).json({ error: "Story not found" })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // PUT - Update a story
  else if (req.method === "PUT") {
    try {
      const { title, description, content, image_url } = req.body

      const updates = {}
      if (title) updates.title = title
      if (description !== undefined) updates.description = description
      if (content) updates.content = content
      if (image_url !== undefined) updates.image_url = image_url

      const { data, error } = await supabase.from("stories").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating story:", error)
        return res.status(500).json({ error: "Failed to update story" })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // DELETE - Delete a story
  else if (req.method === "DELETE") {
    try {
      // Delete related rounds first (cascade delete will handle submissions and votes)
      const { error: roundsError } = await supabase.from("story_rounds").delete().eq("story_id", id)

      if (roundsError) {
        console.error("Error deleting story rounds:", roundsError)
        return res.status(500).json({ error: "Failed to delete story rounds" })
      }

      // Delete the story
      const { error } = await supabase.from("stories").delete().eq("id", id)

      if (error) {
        console.error("Error deleting story:", error)
        return res.status(500).json({ error: "Failed to delete story" })
      }

      return res.status(200).json({ message: "Story deleted successfully" })
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}
