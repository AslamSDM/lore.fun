import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  // GET - Fetch all stories
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching stories:", error)
        return res.status(500).json({ error: "Failed to fetch stories" })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // POST - Create a new story
  else if (req.method === "POST") {
    try {
      const { title, description, content, image_url, creator_address } = req.body

      if (!title || !content || !creator_address) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Create story
      const { data, error } = await supabase
        .from("stories")
        .insert([
          {
            title,
            description,
            content,
            image_url,
            creator_address,
            is_featured: false,
            contributor_count: 1,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating story:", error)
        return res.status(500).json({ error: "Failed to create story" })
      }

      // Create first round
      const roundEndDate = new Date()
      roundEndDate.setDate(roundEndDate.getDate() + 3) // 3 days from now

      const { error: roundError } = await supabase.from("story_rounds").insert([
        {
          story_id: data.id,
          round_number: 1,
          phase: "submission",
          submission_ends_at: roundEndDate.toISOString(),
          voting_ends_at: null,
        },
      ])

      if (roundError) {
        console.error("Error creating round:", roundError)
        return res.status(500).json({ error: "Failed to initialize story rounds" })
      }

      return res.status(201).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}
