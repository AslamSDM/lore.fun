import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaTransaction } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  // Parse id as integer since Story model uses Int for id
  const storyId = parseInt(id as string, 10);

  // Validate that it's a valid number
  if (isNaN(storyId)) {
    return res.status(400).json({ error: "Invalid story ID format" });
  }

  if (req.method === "GET") {
    return runPrismaTransaction(req, res, async (tx) => {
      try {
        // Start a timer to measure query performance
        const startTime = performance.now();

        // First get story and sentences to determine the current round
        const [story, sentences] = await Promise.all([
          // Get story details with creator
          tx.story.findUnique({
            where: { id: storyId },
            include: {
              creator: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          }),

          // Get story sentences with authors in one query
          tx.storySentence.findMany({
            where: { storyId: storyId },
            orderBy: { position: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          }),
        ]);

        if (!story) {
          return res.status(404).json({ error: "Story not found" });
        }

        // Calculate current voting round before querying submissions
        const currentRoundPosition = sentences.length + 1;

        // Get submissions with votes and efficient vote counting
        const submissionsWithVotes = await tx.submission.findMany({
          where: {
            storyId: storyId,
            votingRound: currentRoundPosition,
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
            votes: true, // Need the actual votes for detailed processing
            _count: {
              select: { votes: true }, // Also get efficient count
            },
          },
        });

        // Count total votes for this round
        const totalVotes = submissionsWithVotes.reduce(
          (sum, sub) => sum + sub.votes.length,
          0
        );

        // Calculate percentage for each submission
        const processedSubmissions = submissionsWithVotes.map((sub) => {
          const votesCount = sub.votes.length;
          const percentage =
            totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

          return {
            id: sub.id,
            story_id: sub.storyId,
            content: sub.content,
            submitted_by: sub.submittedBy,
            voting_round: sub.votingRound,
            is_winner: sub.isWinner,
            created_at: sub.createdAt.toISOString(),
            author: sub.author,
            votes_count: votesCount,
            percentage,
          };
        });

        // Format sentences
        const formattedSentences = sentences.map((sentence) => ({
          id: sentence.id,
          story_id: sentence.storyId,
          content: sentence.content,
          position: sentence.position,
          submitted_by: sentence.submittedBy,
          created_at: sentence.createdAt.toISOString(),
          author: sentence.author,
        }));

        // Format story
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

        // Log performance metrics in development
        if (process.env.NODE_ENV !== "production") {
          const executionTime = performance.now() - startTime;
          if (executionTime > 100) {
            console.warn(
              `SLOW ENDPOINT: GET /api/stories/${storyId} took ${executionTime.toFixed(
                2
              )}ms`
            );
          }
        }

        // Return formatted data
        return res.status(200).json({
          story: formattedStory,
          sentences: formattedSentences,
          current_round: {
            position: currentRoundPosition,
            submissions: processedSubmissions,
            total_votes: totalVotes,
          },
        });
      } catch (error) {
        console.error("Error fetching story:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
