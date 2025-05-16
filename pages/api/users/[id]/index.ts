import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // GET endpoint to retrieve a user
  if (req.method === "GET") {
    return runPrismaInApi(req, res, async (prisma) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: id as string },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Format the response
        const formattedUser = {
          id: user.id,
          wallet_address: user.walletAddress,
          username: user.username || null,
          created_at: user.createdAt.toISOString(),
          updated_at: user.updatedAt.toISOString(),
        };

        return res.status(200).json(formattedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  // PUT endpoint to update a user's username
  if (req.method === "PUT") {
    return runPrismaInApi(req, res, async (prisma) => {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      try {
        // Check if username is already taken
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            id: { not: id as string },
          },
        });

        if (existingUser) {
          return res.status(400).json({ error: "Username already taken" });
        }

        // Update the username
        const updatedUser = await prisma.user.update({
          where: { id: id as string },
          data: { username },
        });

        // Format the response
        const formattedUser = {
          id: updatedUser.id,
          wallet_address: updatedUser.walletAddress,
          username: updatedUser.username || null,
          created_at: updatedUser.createdAt.toISOString(),
          updated_at: updatedUser.updatedAt.toISOString(),
        };

        return res.status(200).json({
          success: true,
          user: formattedUser,
        });
      } catch (error) {
        console.error("Error updating username:", error);
        return res.status(500).json({
          success: false,
          error: (error as Error).message,
        });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
