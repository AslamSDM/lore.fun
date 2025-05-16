import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    return runPrismaInApi(req, res, async (prisma) => {
      try {
        // Calculate user statistics directly with Prisma
        const submissionsCount = await prisma.submission.count({
          where: { submittedBy: id as string },
        });

        const winningSubmissionsCount = await prisma.submission.count({
          where: {
            submittedBy: id as string,
            isWinner: true,
          },
        });

        const votesCount = await prisma.vote.count({
          where: { userId: id as string },
        });

        const storiesCount = await prisma.story.count({
          where: { createdById: id as string },
        });

        const stats = {
          submissions_count: submissionsCount,
          winning_submissions_count: winningSubmissionsCount,
          votes_cast_count: votesCount,
          stories_created_count: storiesCount,
        };

        return res.status(200).json(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
