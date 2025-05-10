import type { NextApiRequest, NextApiResponse } from "next"
import { createServerSupabaseClient } from "../../../../lib/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient()
  const { id } = req.query

  if (req.method === "GET") {
    // Get stories created by user
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        sentences_count:story_sentences(count),
        contributors_count:story_sentences(submitted_by)
      `)
      .eq("created_by", id)
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Process the data to get unique contributors count
    const processedData = data.map((story) => {
      const uniqueContributors = new Set()
      if (story.contributors_count) {
        story.contributors_count.forEach((item: any) => {
          uniqueContributors.add(item.submitted_by)
        })
      }

      return {
        ...story,
        sentences_count: story.sentences_count?.length || 0,
        contributors_count: uniqueContributors.size,
      }
    })

    return res.status(200).json(processedData)
  }

  return res.status(405).json({ error: "Method not allowed" })
}
