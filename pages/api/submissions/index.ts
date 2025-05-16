import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return runPrismaInApi(req, res, async (prisma) => {
      const { story_id, content, submitted_by } = req.body;

      if (!story_id || !content || !submitted_by) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      try {
        // Get the latest sentence position for this story
        const latestSentence = await prisma.storySentence.findFirst({
          where: { storyId: story_id },
          orderBy: { position: "desc" },
          select: { position: true },
        });

        const currentRound = latestSentence ? latestSentence.position + 1 : 1;

        // Create the submission
        const submission = await prisma.submission.create({
          data: {
            storyId: story_id,
            content,
            submittedBy: submitted_by,
            votingRound: currentRound,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Format the response to match the expected structure
        const formattedSubmission = {
          id: submission.id,
          story_id: submission.storyId,
          content: submission.content,
          submitted_by: submission.submittedBy,
          voting_round: submission.votingRound,
          is_winner: submission.isWinner,
          created_at: submission.createdAt.toISOString(),
          author: submission.author,
        };

        return res.status(201).json(formattedSubmission);
      } catch (error) {
        console.error("Error creating submission:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
