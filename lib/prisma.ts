import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Make sure database URL is properly configured
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL environment variable is not set or empty.");
}

// Function to create the PrismaClient with proper error handling and performance optimizations
function createPrismaClient() {
  try {
    const isProd = process.env.NODE_ENV === "production";

    return new PrismaClient({
      log: isProd ? ["error", "warn"] : ["query", "error", "warn"],
      // Only log errors and warnings in production for better performance
    });
  } catch (error) {
    console.error("Failed to create PrismaClient:", error);
    throw error;
  }
}

// Create or reuse the PrismaClient instance
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Save the client to the global object in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
