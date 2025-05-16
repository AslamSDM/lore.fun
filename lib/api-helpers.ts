import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Helper to ensure Prisma queries are only run in API routes.
 * This function creates a scoped Prisma client for each API request.
 */
export async function runPrismaInApi<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  action: (prisma: PrismaClient) => Promise<T>
): Promise<T | void> {
  // Check if running on server-side in an API route
  if (typeof window !== "undefined") {
    console.error("Attempted to run Prisma query on client-side");
    return res
      .status(500)
      .json({
        error: "Database operations cannot be performed on client-side",
      });
  }

  try {
    // Create a connection to the database
    const result = await action(prisma);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database operation failed",
      details:
        process.env.NODE_ENV !== "production"
          ? (error as Error).message
          : undefined,
    });
  }
}
