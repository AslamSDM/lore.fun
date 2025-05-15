import type { NextApiRequest, NextApiResponse } from "next";
import { withPrisma, withAuth } from "../../../lib/middleware";
import { StoryService } from "../../../lib/data-service";

// Public endpoint for GET, authenticated for POST
const handler = async function (
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma, user }: { prisma: any; user?: any }
) {
  if (req.method === "GET") {
    try {
      // Get all stories with related data
      const stories = await prisma.story.findMany({
        include: {
          creator: {
            select: {
              id: true,
              username: true,
            },
          },
          sentences: {
            select: {
              id: true,
              submittedBy: true,
            },
          },
          submissions: {
            distinct: ["submittedBy"],
            select: {
              submittedBy: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Process stories to get the expected format
      const processedData = stories.map((story) => {
        // Get unique contributors
        const uniqueContributors = new Set<string>();
        story.sentences.forEach((sentence) => {
          uniqueContributors.add(sentence.submittedBy);
        });

        // Format response to match expected structure
        return {
          id: story.id,
          title: story.title,
          subtitle: story.subtitle,
          genre: story.genre,
          first_sentence: story.firstSentence,
          created_by: story.createdById,
          min_sentences: story.minSentences,
          voting_period_days: story.votingPeriodDays,
          submission_period_hours: story.submissionPeriodHours,
          created_at: story.createdAt.toISOString(),
          updated_at: story.updatedAt.toISOString(),
          creator: story.creator,
          sentences_count: story.sentences.length,
          contributors_count: uniqueContributors.size,
        };
      });

      return res.status(200).json(processedData);
    } catch (error) {
      console.error("Error fetching stories:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  if (req.method === "POST") {
    const { title, subtitle, genre, first_sentence, created_by } = req.body;

    if (!title || !genre || !first_sentence || !created_by) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Create the story with StoryService
      const story = await StoryService.createStory({
        title,
        subtitle: subtitle || undefined,
        genre,
        firstSentence: first_sentence,
        createdById: created_by,
      });

      // Format the response to match expected structure
      const formattedStory = {
        ...story,
        first_sentence: story.firstSentence,
        created_by: story.createdById,
        min_sentences: story.minSentences,
        voting_period_days: story.votingPeriodDays,
        submission_period_hours: story.submissionPeriodHours,
        created_at: story.createdAt.toISOString(),
        updated_at: story.updatedAt.toISOString(),
      };

      return res.status(201).json(formattedStory);
    } catch (error) {
      console.error("Error creating story:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

// Export with different middleware based on request method
export default async function (req: NextApiRequest, res: NextApiResponse) {
  // For POST requests, use withAuth to require authentication
  if (req.method === "POST") {
    return withAuth(handler)(req, res);
  }

  // For all other requests, just use withPrisma
  return withPrisma(handler)(req, res);
}
