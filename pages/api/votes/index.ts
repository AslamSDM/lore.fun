import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return runPrismaInApi(req, res, async (prisma) => {
      const { submission_id, user_id } = req.body;

      if (!submission_id || !user_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      try {
        // Check if user already voted for this submission
        const existingVote = await prisma.vote.findFirst({
          where: {
            submissionId: submission_id,
            userId: user_id,
          },
        });

        if (existingVote) {
          return res
            .status(400)
            .json({ error: "You have already voted for this submission" });
        }

        // Create the vote
        const vote = await prisma.vote.create({
          data: {
            submissionId: submission_id,
            userId: user_id,
          },
        });

        // Format the response to match the expected structure
        const formattedVote = {
          ...vote,
          submission_id: vote.submissionId,
          user_id: vote.userId,
          created_at: vote.createdAt.toISOString(),
        };

        return res.status(201).json(formattedVote);
      } catch (error) {
        console.error("Error processing vote:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
