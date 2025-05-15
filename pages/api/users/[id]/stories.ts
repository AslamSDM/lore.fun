import type { NextApiRequest, NextApiResponse } from "next";
import { withPrisma } from "../../../../lib/middleware";

export default withPrisma(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma }
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Get stories created by user with sentence counts
      const stories = await prisma.story.findMany({
        where: { createdById: id as string },
        include: {
          sentences: {
            select: {
              id: true,
              submittedBy: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Process the data to get unique contributors count
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
          sentences_count: story.sentences.length,
          contributors_count: uniqueContributors.size,
        };
      });

      return res.status(200).json(processedData);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
