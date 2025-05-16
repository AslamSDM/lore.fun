import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../lib/api-helpers";
import { generateSignMessage, verifySignature } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    return runPrismaInApi(req, res, async (prisma) => {
      try {
        // Generate the message that should have been signed
        const message = generateSignMessage(walletAddress);

        // Verify the signature
        const isValid = await verifySignature(
          walletAddress,
          message,
          signature
        );

        if (!isValid) {
          return res.status(401).json({
            error: "Invalid signature",
          });
        }

        // Look up or create the user
        let user = await prisma.user.findUnique({
          where: { walletAddress },
        });

        let isNewUser = false;

        // Create the user if they don't exist
        if (!user) {
          isNewUser = true;
          user = await prisma.user.create({
            data: {
              walletAddress,
              username: null, // They'll set username later
            },
          });
        }

        // Format user for response
        const formattedUser = {
          id: user.id,
          wallet_address: user.walletAddress,
          username: user.username || null,
          created_at: user.createdAt.toISOString(),
          updated_at: user.updatedAt.toISOString(),
        };

        // Set headers for browser to know this is an authenticated response
        res.setHeader("Cache-Control", "no-store");

        return res.status(200).json({
          authenticated: true,
          user: formattedUser,
          isNewUser,
        });
      } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({
          error: "Authentication failed",
          details: (error as Error).message,
        });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
