import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaTransaction } from "../../../../lib/api-helpers";
import { SentenceService } from "../../../../lib/data-service";

// In-memory cache for story data to avoid frequent repeated queries
// Key is storyId, value is cached data with timestamp
const storyCache: Record<string, { data: any; timestamp: number }> = {};
// Cache expiration time in milliseconds (10 seconds)
const CACHE_TTL = 10000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const storyId = id as string;

  // For GET requests, check if we can use the cache to avoid database query
  if (req.method === "GET" && storyId) {
    const cached = storyCache[storyId];
    const now = Date.now();

    // Return cached data if it's fresh (within TTL)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }
  }

  if (req.method === "POST") {
    return runPrismaTransaction(req, res, async (tx) => {
      try {
        // Start performance timer
        const startTime = performance.now();

        // Get story details with related data in a single optimized query
        const story = await tx.story.findUnique({
          where: { id: storyId },
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

        // Calculate the current round
        const currentRoundPosition = story.sentences.length + 1;

        // Get submissions with optimized query - select only what we need
        const submissions = await tx.submission.findMany({
          where: {
            storyId,
            votingRound: currentRoundPosition,
          },
          include: {
            votes: true,
            _count: {
              select: { votes: true },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        // Calculate voting end date
        const lastSentenceDate =
          story.sentences.length > 0
            ? new Date(story.sentences[0].createdAt)
            : new Date(story.createdAt);

        // If there are no submissions, we don't end the round
        if (submissions.length === 0) {
          return res.status(400).json({
            error:
              "No submissions for the current round. Waiting for submissions before ending the round.",
            canEnd: false,
            waitingForSubmissions: true,
          });
        }

        const votingEndDate = new Date(lastSentenceDate);
        votingEndDate.setDate(votingEndDate.getDate() + story.votingPeriodDays);

        // Check if voting period has ended
        const now = new Date();
        const canEndRound = now >= votingEndDate;

        if (!canEndRound && !req.body.force) {
          return res.status(400).json({
            error: "Voting period has not ended yet",
            canEnd: false,
            votingEndDate: votingEndDate.toISOString(),
            remainingTime: votingEndDate.getTime() - now.getTime(),
          });
        }

        // Find submission with the most votes - optimize by using _count directly
        let maxVotes = submissions.length > 0 ? submissions[0]._count.votes : 0;
        let winningSubmissions = submissions.filter(
          (sub) => sub._count.votes === maxVotes
        );

        // Find max votes in a single pass through the array
        for (const sub of submissions) {
          const voteCount = sub._count.votes;
          if (voteCount > maxVotes) {
            maxVotes = voteCount;
            winningSubmissions = [sub];
          } else if (
            voteCount === maxVotes &&
            voteCount > 0 &&
            sub.id !== winningSubmissions[0]?.id
          ) {
            winningSubmissions.push(sub);
          }
        }

        // Handle tie by checking if we should wait for more votes or break the tie
        if (winningSubmissions.length > 1) {
          // If the voting period has just ended (within the last day) and we have a tie,
          // optionally wait for a tie-breaking vote before automatically resolving
          const justEnded =
            now.getTime() - votingEndDate.getTime() < 24 * 60 * 60 * 1000;
          const shouldWaitForTieBreak =
            justEnded && !req.body.force && req.body.waitForTieBreak !== false;

          if (shouldWaitForTieBreak) {
            return res.status(202).json({
              canEnd: true,
              hasTie: true,
              waitingForTieBreak: true,
              tiedSubmissions: winningSubmissions.map((sub) => ({
                id: sub.id,
                content: sub.content,
                votes: sub._count.votes,
              })),
              votingEndDate: votingEndDate.toISOString(),
              message: "Tie detected. Waiting for tie-breaking votes.",
            });
          }

          // If we're already ordered by creation date, just take the first one
          winningSubmissions.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
        }

        // Add the winning submission as the next sentence
        const result = await SentenceService.addWinningSubmissionAsSentence(
          winningSubmissions.length > 0
            ? winningSubmissions[0].id
            : submissions[0].id
        );

        if (!result.success) {
          return res.status(500).json({
            error: result.error || "Failed to add winning submission",
          });
        }

        // Log performance metrics
        const executionTime = performance.now() - startTime;
        if (executionTime > 100) {
          console.warn(
            `POST /stories/${storyId}/end-round took ${executionTime.toFixed(
              2
            )}ms`
          );
        }

        return res.status(200).json({
          success: true,
          message: "Round ended successfully",
          winningSentence: result.sentence,
        });
      } catch (error) {
        console.error("Error ending round:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  // Also allow GET requests to check if a round can be ended - using transaction for efficiency
  if (req.method === "GET") {
    return runPrismaTransaction(req, res, async (tx) => {
      try {
        // Start performance timer
        const startTime = performance.now();

        // Get story details - optimize query by selecting only needed fields
        const story = await tx.story.findUnique({
          where: { id: storyId },
          select: {
            id: true,
            votingPeriodDays: true,
            createdAt: true,
            sentences: {
              orderBy: { position: "desc" },
              take: 1,
              select: {
                position: true,
                createdAt: true,
              },
            },
          },
        });

        if (!story) {
          return res.status(404).json({ error: "Story not found" });
        }

        // Calculate current round position
        const currentRoundPosition = story.sentences.length + 1;

        // Get submissions count for current round
        const submissionsCount = await tx.submission.count({
          where: {
            storyId,
            votingRound: currentRoundPosition,
          },
        });

        // Calculate voting end date and check if voting period has ended
        const lastSentenceDate =
          story.sentences.length > 0
            ? new Date(story.sentences[0].createdAt)
            : new Date(story.createdAt);

        const votingEndDate = new Date(lastSentenceDate);
        votingEndDate.setDate(votingEndDate.getDate() + story.votingPeriodDays);

        const now = new Date();
        const canEndRound = now >= votingEndDate;

        // Create response
        const response = {
          canEndRound,
          votingEndDate: votingEndDate.toISOString(),
          remainingTime: canEndRound
            ? 0
            : votingEndDate.getTime() - now.getTime(),
          submissionsCount,
          currentRound: currentRoundPosition,
        };

        // Cache the result to avoid repeated identical queries
        storyCache[storyId] = {
          data: response,
          timestamp: Date.now(),
        };

        // Log performance metrics
        const executionTime = performance.now() - startTime;
        if (executionTime > 100) {
          console.warn(
            `GET /stories/${storyId}/end-round took ${executionTime.toFixed(
              2
            )}ms`
          );
        }

        return res.status(200).json(response);
      } catch (error) {
        console.error("Error checking round status:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
