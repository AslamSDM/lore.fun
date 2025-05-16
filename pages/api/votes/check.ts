import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return runPrismaInApi(req, res, async (prisma) => {
      // Get query params
      const { user_id, story_id, round } = req.query;
      
      // Validate required parameters
      if (!user_id || !story_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const roundNumber = round ? parseInt(round as string) : undefined;
      
      try {
        // Find any votes by this user for this story in the specified round
        const votes = await prisma.vote.findMany({
          where: {
            userId: user_id as string,
            submission: {
              storyId: story_id as string,
              ...(roundNumber ? { votingRound: roundNumber } : {}),
            },
          },
          include: {
            submission: {
              select: {
                id: true,
                content: true,
                votingRound: true,
              },
            },
          },
        });
        
        const hasVoted = votes.length > 0;
        
        return res.status(200).json({
          hasVoted,
          votes,
        });
      } catch (error) {
        console.error("Error checking vote status:", error);
        return res.status(500).json({ error: "Error checking vote status" });
      }
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
