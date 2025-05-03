import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req, res) {
  // POST - Create a new vote
  if (req.method === "POST") {
    try {
      const { round_id, story_id, submission_id, voter_address } = req.body

      if (!round_id || !story_id || !submission_id || !voter_address) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Check if user already voted for this submission
      const { data: existingVote, error: checkError } = await supabase
        .from("votes")
        .select("id")
        .eq("round_id", round_id)
        .eq("submission_id", submission_id)
        .eq("voter_address", voter_address)
        .limit(1)

      if (checkError) {
        console.error("Error checking existing vote:", checkError)
        return res.status(500).json({ error: "Failed to check existing vote" })
      }

      if (existingVote && existingVote.length > 0) {
        // Remove vote if it exists
        const { error: deleteError } = await supabase.from("votes").delete().eq("id", existingVote[0].id)

        if (deleteError) {
          console.error("Error removing vote:", deleteError)
          return res.status(500).json({ error: "Failed to remove vote" })
        }

        return res.status(200).json({ message: "Vote removed successfully" })
      }

      // Create vote
      const { data, error } = await supabase
        .from("votes")
        .insert([
          {
            round_id,
            story_id,
            submission_id,
            voter_address,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating vote:", error)
        return res.status(500).json({ error: "Failed to create vote" })
      }

      return res.status(201).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // GET - Fetch votes for a user in a round
  else if (req.method === "GET") {
    try {
      const { round_id, voter_address } = req.query

      if (!round_id || !voter_address) {
        return res.status(400).json({ error: "Round ID and voter address are required" })
      }

      const { data, error } = await supabase
        .from("votes")
        .select("submission_id")
        .eq("round_id", round_id)
        .eq("voter_address", voter_address)

      if (error) {
        console.error("Error fetching votes:", error)
        return res.status(500).json({ error: "Failed to fetch votes" })
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
