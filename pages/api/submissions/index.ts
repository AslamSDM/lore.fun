import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi, runPrismaTransaction } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return runPrismaTransaction(req, res, async (tx) => {
      const { story_id, content, submitted_by } = req.body;

      if (!story_id || !content || !submitted_by) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Start performance timer
      const startTime = performance.now();

      try {
        // Get the story with sentences to check round status using transaction
        const story = await tx.story.findUnique({
          where: { id: story_id },
          include: {
            sentences: {
              orderBy: { position: "desc" },
              take: 1,
            },
          },
        });

        if (!story) {
          return res.status(404).json({ error: "Story not found" });
        }

        // Calculate current round
        const latestSentence = story.sentences[0];
        const currentRound = latestSentence ? latestSentence.position + 1 : 1;

        // Check if voting period for the previous round has ended
        // If the voting period hasn't ended yet, we should notify the user
        if (latestSentence) {
          const lastSentenceDate = new Date(latestSentence.createdAt);
          const votingEndDate = new Date(lastSentenceDate);
          votingEndDate.setDate(
            votingEndDate.getDate() + story.votingPeriodDays
          );

          const now = new Date();

          if (now < votingEndDate) {
            // Previous round's voting is still ongoing
            // We'll still allow submissions but warn the client
            // This is just a warning - we continue processing the submission
            console.warn(
              `Submission created while voting for round ${latestSentence.position} is still ongoing.`
            );
          }
        }

        // Check if this is the first submission for this round
        // If it is, note this as it may trigger a voting period start
        const existingSubmissionCount = await tx.submission.count({
          where: {
            storyId: story_id,
            votingRound: currentRound,
          },
        });

        const isFirstSubmission = existingSubmissionCount === 0;

        // Create the submission using the transaction
        const submission = await tx.submission.create({
          data: {
            storyId: story_id,
            content,
            submittedBy: submitted_by,
            votingRound: currentRound,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Format the response to match the expected structure
        const formattedSubmission = {
          id: submission.id,
          story_id: submission.storyId,
          content: submission.content,
          submitted_by: submission.submittedBy,
          voting_round: submission.votingRound,
          is_winner: submission.isWinner,
          created_at: submission.createdAt.toISOString(),
          author: submission.author,
        };

        // Log performance metrics in development mode
        if (process.env.NODE_ENV !== "production") {
          const executionTime = performance.now() - startTime;
          if (executionTime > 100) {
            console.warn(
              `SLOW OPERATION: Submission creation took ${executionTime.toFixed(
                2
              )}ms`
            );
          }
        }

        // Add additional information if this is the first submission
        return res.status(201).json({
          ...formattedSubmission,
          isFirstSubmission,
          currentRound,
        });
      } catch (error) {
        console.error("Error creating submission:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
