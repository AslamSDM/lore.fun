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
  
  // Parse id as integer since Story model uses Int for id
  const storyId = parseInt(id as string, 10);
  
  // Validate that it's a valid number
  if (isNaN(storyId)) {
    return res.status(400).json({ error: "Invalid story ID format" });
  }

  // For GET requests, check if we can use the cache to avoid database query
  if (req.method === "GET") {
    const cacheKey = storyId.toString();
    const cached = storyCache[cacheKey];
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
            storyId: storyId,
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

        // Find the winning submission
        let winningSubmission;
        let maxVotes = -1;

        for (const submission of submissions) {
          const votesCount = submission.votes.length;
          if (votesCount > maxVotes) {
            maxVotes = votesCount;
            winningSubmission = submission;
          }
        }

        if (!winningSubmission) {
          return res.status(400).json({
            error: "Could not determine a winning submission",
            canEnd: false,
          });
        }

        // Mark the winning submission
        await tx.submission.update({
          where: { id: winningSubmission.id },
          data: { isWinner: true },
        });

        // Add the winning submission as the next sentence
        await SentenceService.addSentence(
          tx,
          storyId,
          winningSubmission.content,
          currentRoundPosition,
          winningSubmission.submittedBy
        );

        // Check if we've reached the minimum number of sentences
        const isComplete = currentRoundPosition >= story.minSentences;

        // Return success
        const result = {
          success: true,
          message: "Round ended successfully",
          story_id: storyId,
          winning_submission: {
            id: winningSubmission.id,
            content: winningSubmission.content,
            votes_count: maxVotes,
          },
          is_complete: isComplete,
        };

        // Store in cache if it's a reasonable response size
        if (JSON.stringify(result).length < 10000) {
          storyCache[storyId.toString()] = {
            data: result,
            timestamp: Date.now(),
          };
        }

        // Log performance in development
        if (process.env.NODE_ENV !== "production") {
          const executionTime = performance.now() - startTime;
          if (executionTime > 200) {
            console.warn(
              `SLOW OPERATION: End round for story ${storyId} took ${executionTime.toFixed(
                2
              )}ms`
            );
          }
        }

        return res.status(200).json(result);
      } catch (error) {
        console.error("Error ending round:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  // Handle GET request to check if round can be ended
  if (req.method === "GET") {
    return runPrismaTransaction(req, res, async (tx) => {
      try {
        // Start performance timer
        const startTime = performance.now();

        // Get story details
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

        // Get submissions count
        const submissionsCount = await tx.submission.count({
          where: {
            storyId: storyId,
            votingRound: currentRoundPosition,
          },
        });

        // Calculate voting end date
        const lastSentenceDate =
          story.sentences.length > 0
            ? new Date(story.sentences[0].createdAt)
            : new Date(story.createdAt);

        // Calculate submission end date
        const submissionEndDate = new Date(lastSentenceDate);
        submissionEndDate.setHours(
          submissionEndDate.getHours() + story.submissionPeriodHours
        );

        // Calculate voting end date
        const votingEndDate = new Date(lastSentenceDate);
        votingEndDate.setDate(votingEndDate.getDate() + story.votingPeriodDays);

        // Check current status
        const now = new Date();
        const isSubmissionPeriod = now < submissionEndDate;
        const isVotingPeriod = now >= submissionEndDate && now < votingEndDate;
        const votingEnded = now >= votingEndDate;

        // Calculate time remaining
        let timeRemaining;
        if (isSubmissionPeriod) {
          timeRemaining = submissionEndDate.getTime() - now.getTime();
        } else if (isVotingPeriod) {
          timeRemaining = votingEndDate.getTime() - now.getTime();
        } else {
          timeRemaining = 0;
        }

        // Format the response
        const result = {
          story_id: storyId,
          current_round: currentRoundPosition,
          submissions_count: submissionsCount,
          can_end_round: votingEnded && submissionsCount > 0,
          waiting_for_submissions: submissionsCount === 0,
          is_submission_period: isSubmissionPeriod,
          is_voting_period: isVotingPeriod,
          voting_ended: votingEnded,
          submission_end_date: submissionEndDate.toISOString(),
          voting_end_date: votingEndDate.toISOString(),
          time_remaining: timeRemaining,
          min_sentences: story.minSentences,
          is_complete: currentRoundPosition >= story.minSentences,
        };

        // Store in cache
        storyCache[storyId.toString()] = {
          data: result,
          timestamp: Date.now(),
        };

        // Log performance in development
        if (process.env.NODE_ENV !== "production") {
          const executionTime = performance.now() - startTime;
          if (executionTime > 100) {
            console.warn(
              `SLOW QUERY: GET /api/stories/${storyId}/end-round took ${executionTime.toFixed(
                2
              )}ms`
            );
          }
        }

        return res.status(200).json(result);
      } catch (error) {
        console.error("Error checking round status:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
