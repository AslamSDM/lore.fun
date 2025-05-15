import type { NextApiRequest, NextApiResponse } from "next";
import { withPrisma } from "../../../../lib/middleware";
import { UserService } from "../../../../lib/data-service";

export default withPrisma(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma }
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const stats = await UserService.getUserStats(id as string);

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
