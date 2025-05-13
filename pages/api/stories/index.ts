import { createServerSupabaseClient } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = await createServerSupabaseClient(req, res);

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("stories")
      .select(
        `
        *,
        creator:users!stories_created_by_fkey(id, username),
        sentences_count:story_sentences(count),
        contributors_count:story_sentences(submitted_by)
      `
      )
      .order("created_at", { ascending: false });
    console.log("error", error);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Process the data to get unique contributors count
    const processedData = data.map((story) => {
      const uniqueContributors = new Set();
      if (story.contributors_count) {
        story.contributors_count.forEach((item: any) => {
          uniqueContributors.add(item.submitted_by);
        });
      }

      return {
        ...story,
        sentences_count: story.sentences_count?.length || 0,
        contributors_count: uniqueContributors.size,
      };
    });

    return res.status(200).json(processedData);
  }

  if (req.method === "POST") {
    const { title, subtitle, genre, first_sentence, created_by } = req.body;

    if (!title || !genre || !first_sentence || !created_by) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the story
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert([
        {
          title,
          subtitle,
          genre,
          first_sentence,
          created_by,
        },
      ])
      .select()
      .single();
    console.log("error", storyError);

    if (storyError) {
      return res.status(500).json({ error: storyError.message });
    }

    // Add the first sentence to story_sentences
    const { error: sentenceError } = await supabase
      .from("story_sentences")
      .insert([
        {
          story_id: story.id,
          content: first_sentence,
          position: 1,
          submitted_by: created_by,
        },
      ]);
    console.log("error", sentenceError);

    if (sentenceError) {
      return res.status(500).json({ error: sentenceError.message });
    }

    return res.status(201).json(story);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
