import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./prisma";
import { UserService } from "./data-service";

// Extended context with user
type ExtendedContext = {
  prisma: typeof prisma;
  user?: any;
};

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  context: ExtendedContext
) => Promise<void | NextApiResponse> | void | NextApiResponse;

/**
 * Middleware to add Prisma to API context
 */
export function withPrisma(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Verify Prisma client is ready before passing it
      try {
        // Perform a simple query to check connection
        await prisma.$queryRaw`SELECT 1`;
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        return res.status(503).json({
          error: "Database connection error",
          details:
            process.env.NODE_ENV !== "production"
              ? (dbError as Error).message
              : undefined,
        });
      }

      // Pass prisma client to the handler
      return await handler(req, res, { prisma });
    } catch (error) {
      console.error("API handler error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details:
          process.env.NODE_ENV !== "production"
            ? (error as Error).message
            : undefined,
      });
    }
  };
}

/**
 * Middleware to authenticate user and add them to API context
 */
export function withAuth(handler: ApiHandler) {
  return withPrisma(
    async (
      req: NextApiRequest,
      res: NextApiResponse,
      context: ExtendedContext
    ) => {
      try {
        // Get wallet address from authorization header or body
        let walletAddress = req.headers.authorization?.split(" ")[1];

        // If no auth header, try to get from body for POST requests
        if (
          !walletAddress &&
          req.method === "POST" &&
          req.body?.walletAddress
        ) {
          walletAddress = req.body.walletAddress;
        }

        if (!walletAddress) {
          return res
            .status(401)
            .json({ error: "Unauthorized: No wallet address provided" });
        }

        // Get user by wallet address
        const user = await UserService.getUserByWalletAddress(walletAddress);

        if (!user) {
          return res
            .status(401)
            .json({ error: "Unauthorized: User not found" });
        }

        // Add user to context
        context.user = user;

        return await handler(req, res, context);
      } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );
}
