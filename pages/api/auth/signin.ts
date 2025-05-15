import type { NextApiRequest, NextApiResponse } from "next";
import { withPrisma } from "../../../lib/middleware";
import { AuthService } from "../../../lib/auth-service";

export default withPrisma(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  { prisma }
) {
  if (req.method === "POST") {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { authenticated, user, isNewUser, error } =
        await AuthService.authenticateWithSignature(walletAddress, signature);

      if (!authenticated || error) {
        console.error("Authentication failed:", error);
        return res
          .status(401)
          .json({ error: error || "Authentication failed" });
      }

      // Set headers for browser to know this is an authenticated response
      res.setHeader("Cache-Control", "no-store");

      return res.status(200).json({
        user,
        isNewUser,
      });
    } catch (error) {
      console.error("Error authenticating user:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
