"use server";

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "./prisma";

// This file is kept for backwards compatibility
// New code should import directly from lib/middleware.ts and lib/prisma.ts

export const createServerSupabaseClient = async (
  req?: NextApiRequest,
  res?: NextApiResponse
) => {
  console.warn(
    "createServerSupabaseClient is deprecated. Use withPrisma middleware instead."
  );
  // Return a compatibility layer that wraps prisma
  return {
    // Add basic compatibility for simple queries
    from: (table: string) => {
      let model: any;

      // Map table names to Prisma models
      switch (table) {
        case "users":
          model = prisma.user;
          break;
        case "stories":
          model = prisma.story;
          break;
        case "story_sentences":
          model = prisma.storySentence;
          break;
        case "submissions":
          model = prisma.submission;
          break;
        case "votes":
          model = prisma.vote;
          break;
        default:
          throw new Error(
            `Table ${table} not supported in compatibility layer`
          );
      }

      console.warn(
        `Using Supabase compatibility layer for table ${table}. ` +
          `Please update your code to use Prisma directly.`
      );

      return {
        select: () => {
          throw new Error(
            "Supabase compatibility layer does not support complex queries. Please update your code to use Prisma directly."
          );
        },
        insert: () => {
          throw new Error(
            "Supabase compatibility layer does not support complex queries. Please update your code to use Prisma directly."
          );
        },
        update: () => {
          throw new Error(
            "Supabase compatibility layer does not support complex queries. Please update your code to use Prisma directly."
          );
        },
        delete: () => {
          throw new Error(
            "Supabase compatibility layer does not support complex queries. Please update your code to use Prisma directly."
          );
        },
      };
    },
  };
};
