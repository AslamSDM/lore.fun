import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
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
    return res.status(500).json({
      error: "Database operations cannot be performed on client-side",
    });
  }

  try {
    // Start a timer to measure query performance
    const startTime = performance.now();

    // Create a connection to the database
    const result = await action(prisma);

    // Log performance for slow queries (only in development)
    if (process.env.NODE_ENV !== "production") {
      const executionTime = performance.now() - startTime;
      if (executionTime > 100) {
        // Log queries taking more than 100ms
        console.warn(
          `SLOW QUERY: ${req.url} took ${executionTime.toFixed(2)}ms`
        );
      }
    }

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

/**
 * Helper to run Prisma queries in a transaction for better performance and atomicity.
 * This allows batching multiple database operations into a single transaction.
 */
export async function runPrismaTransaction<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  action: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T | void> {
  // Check if running on server-side in an API route
  if (typeof window !== "undefined") {
    console.error("Attempted to run Prisma query on client-side");
    return res.status(500).json({
      error: "Database operations cannot be performed on client-side",
    });
  }

  try {
    // Start a timer to measure query performance
    const startTime = performance.now();

    // Run the operations in a transaction
    const result = await prisma.$transaction(
      async (tx) => {
        return await action(tx);
      },
      {
        // Set transaction timeout to avoid long-running transactions (default is 5000ms)
        timeout: 10000, // 10 seconds
        // Set isolation level for better performance when appropriate
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    // Log performance for slow queries (only in development)
    if (process.env.NODE_ENV !== "production") {
      const executionTime = performance.now() - startTime;
      if (executionTime > 100) {
        // Log queries taking more than 100ms
        console.warn(
          `SLOW TRANSACTION: ${req.url} took ${executionTime.toFixed(2)}ms`
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({
      error: "Database transaction failed",
      details:
        process.env.NODE_ENV !== "production"
          ? (error as Error).message
          : undefined,
    });
  }
}
