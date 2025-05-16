import type { NextApiRequest, NextApiResponse } from "next";
import { StoryService, UserService } from "../../../lib/data-service";
import { runPrismaInApi } from "../../../lib/api-helpers";
import { randomUUID } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return runPrismaInApi(req, res, async (prisma) => {
      try {
        // Get all stories with related data
        const stories = await prisma.story.findMany({
          include: {
            creator: {
              select: {
                id: true,
                username: true,
              },
            },
            sentences: {
              select: {
                id: true,
                submittedBy: true,
              },
            },
            submissions: {
              distinct: ["submittedBy"],
              select: {
                submittedBy: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // Process stories to get the expected format
        const processedData = stories.map((story) => {
          // Get unique contributors
          const uniqueContributors = new Set<string>();
          story.sentences.forEach((sentence) => {
            uniqueContributors.add(sentence.submittedBy);
          });

          // Format response to match expected structure
          return {
            id: story.id,
            title: story.title,
            subtitle: story.subtitle,
            genre: story.genre,
            first_sentence: story.firstSentence,
            created_by: story.createdById,
            min_sentences: story.minSentences,
            voting_period_days: story.votingPeriodDays,
            submission_period_hours: story.submissionPeriodHours,
            created_at: story.createdAt.toISOString(),
            updated_at: story.updatedAt.toISOString(),
            creator: story.creator,
            sentences_count: story.sentences.length,
            contributors_count: uniqueContributors.size,
          };
        });

        return res.status(200).json(processedData);
      } catch (error) {
        console.error("Error fetching stories:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  if (req.method === "POST") {
    return runPrismaInApi(req, res, async (prisma) => {
      const { title, subtitle, genre, first_sentence, created_by } = req.body;

      if (!title || !genre || !first_sentence || !created_by) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Ensure user exists before creating story
      let userId = created_by;
      try {
        // Check if the provided created_by is a wallet address
        if (
          created_by &&
          typeof created_by === "string" &&
          created_by.length > 30
        ) {
          console.log(
            `Processing wallet address: ${created_by.substring(0, 10)}...`
          );

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { walletAddress: created_by },
          });

          if (existingUser) {
            console.log(`User found with ID: ${existingUser.id}`);
            userId = existingUser.id;
          } else {
            // Create new user
            console.log(
              `Creating new user for wallet: ${created_by.substring(0, 10)}...`
            );
            const newUser = await prisma.user.create({
              data: {
                id: randomUUID(),
                walletAddress: created_by,
                username: "Anonymous",
              },
            });
            console.log(`User created with ID: ${newUser.id}`);
            userId = newUser.id;
          }
        }
      } catch (error) {
        console.error("Error handling user creation:", error);
        return res.status(500).json({
          error: "Failed to process user data",
          details: (error as Error).message,
        });
      }

      try {
        // Create the story directly with Prisma
        const story = await prisma.story.create({
          data: {
            title,
            subtitle: subtitle || undefined,
            genre,
            firstSentence: first_sentence,
            createdById: userId,
            // Add the first sentence as well
            sentences: {
              create: {
                content: first_sentence,
                position: 1,
                submittedBy: userId,
              },
            },
          },
          include: {
            creator: true,
          },
        });

        // Format the response to match expected structure
        const formattedStory = {
          id: story.id,
          title: story.title,
          subtitle: story.subtitle,
          genre: story.genre,
          first_sentence: story.firstSentence,
          created_by: story.createdById,
          min_sentences: story.minSentences,
          voting_period_days: story.votingPeriodDays,
          submission_period_hours: story.submissionPeriodHours,
          created_at: story.createdAt.toISOString(),
          updated_at: story.updatedAt.toISOString(),
          creator: story.creator,
        };

        return res.status(201).json(formattedStory);
      } catch (error) {
        console.error("Error creating story:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
