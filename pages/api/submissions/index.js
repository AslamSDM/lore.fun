import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  // POST - Create a new submission
  if (req.method === "POST") {
    try {
      const { round_id, story_id, content, author_address } = req.body

      if (!round_id || !story_id || !content || !author_address) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Check if user already submitted for this round
      const { data: existingSubmission, error: checkError } = await supabase
        .from("submissions")
        .select("id")
        .eq("round_id", round_id)
        .eq("author_address", author_address)
        .limit(1)

      if (checkError) {
        console.error("Error checking existing submission:", checkError)
        return res.status(500).json({ error: "Failed to check existing submission" })
      }

      if (existingSubmission && existingSubmission.length > 0) {
        return res.status(400).json({ error: "You have already submitted for this round" })
      }

      // Create submission
      const { data, error } = await supabase
        .from("submissions")
        .insert([
          {
            round_id,
            story_id,
            content,
            author_address,
            is_selected: false,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating submission:", error)
        return res.status(500).json({ error: "Failed to create submission" })
      }

      return res.status(201).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // GET - Fetch submissions for a round
  else if (req.method === "GET") {
    try {
      const { round_id } = req.query

      if (!round_id) {
        return res.status(400).json({ error: "Round ID is required" })
      }

      const { data, error } = await supabase
        .from("submissions")
        .select("*, votes(count)")
        .eq("round_id", round_id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching submissions:", error)
        return res.status(500).json({ error: "Failed to fetch submissions" })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}
