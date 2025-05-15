import type { NextApiRequest, NextApiResponse } from "next";
import { withPrisma } from "../../../lib/middleware";
import { SubmissionService } from "../../../lib/data-service";

export default withPrisma(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma }
) {
  if (req.method === "POST") {
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
      });

      // Format the response to match the expected format
      const formattedSubmission = {
        ...submission,
        story_id: submission.storyId,
        submitted_by: submission.submittedBy,
        voting_round: submission.votingRound,
        is_winner: submission.isWinner,
        created_at: submission.createdAt.toISOString(),
      };

      return res.status(201).json(formattedSubmission);
    } catch (error) {
      console.error("Error creating submission:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
