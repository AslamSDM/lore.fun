import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../../lib/api-helpers";
import { SentenceService } from "../../../../lib/data-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id } = req.query;

    return runPrismaInApi(req, res, async (prisma) => {
      try {
        // Get the story to check voting period
        const story = await prisma.story.findUnique({
          where: { id: id as string },
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

        // Get submissions for the current round with their votes
        const submissions = await prisma.submission.findMany({
          where: {
            storyId: id as string,
            votingRound: currentRoundPosition,
          },
          include: {
            votes: true,
          },
        });

        // Calculate voting end date
        const storyCreatedDate = new Date(story.createdAt);
        // For the actual voting end date, we need to add the previous round duration
        // plus the current round voting period
        const lastSentenceDate =
          story.sentences.length > 0
            ? new Date(story.sentences[0].createdAt)
            : storyCreatedDate;

        // If there are no submissions, we don't end the round
        // Instead, we'll wait for submissions to come in
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

        // Find submission with the most votes
        let winningSubmission = submissions[0];
        let maxVotes = submissions[0].votes.length;

        for (const submission of submissions) {
          const votesCount = submission.votes.length;
          if (votesCount > maxVotes) {
            maxVotes = votesCount;
            winningSubmission = submission;
          }
        }

        // Handle tie by checking if we should wait for more votes or break the tie
        const tiedSubmissions = submissions.filter(
          (sub) => sub.votes.length === maxVotes
        );

        if (tiedSubmissions.length > 1) {
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
              tiedSubmissions: tiedSubmissions.map((sub) => ({
                id: sub.id,
                content: sub.content,
                votes: sub.votes.length,
              })),
              votingEndDate: votingEndDate.toISOString(),
              message: "Tie detected. Waiting for tie-breaking votes.",
            });
          }

          // If we're not waiting or if force=true, sort by creation date (earliest first) to break the tie
          tiedSubmissions.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
          );
          winningSubmission = tiedSubmissions[0];
        }

        // Add the winning submission as the next sentence
        const result = await SentenceService.addWinningSubmissionAsSentence(
          winningSubmission.id
        );

        if (!result.success) {
          return res.status(500).json({
            error: result.error || "Failed to add winning submission",
          });
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

  // Also allow GET requests to check if a round can be ended
  if (req.method === "GET") {
    const { id } = req.query;

    return runPrismaInApi(req, res, async (prisma) => {
      try {
        // Get the story to check voting period
        const story = await prisma.story.findUnique({
          where: { id: id as string },
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

        // Calculate voting end date
        const lastSentenceDate =
          story.sentences.length > 0
            ? new Date(story.sentences[0].createdAt)
            : new Date(story.createdAt);

        const votingEndDate = new Date(lastSentenceDate);
        votingEndDate.setDate(votingEndDate.getDate() + story.votingPeriodDays);

        // Check if voting period has ended
        const now = new Date();
        const canEndRound = now >= votingEndDate;

        // Calculate current round position
        const currentRoundPosition = story.sentences.length + 1;

        // Get submissions count for current round
        const submissionsCount = await prisma.submission.count({
          where: {
            storyId: id as string,
            votingRound: currentRoundPosition,
          },
        });

        return res.status(200).json({
          canEndRound,
          votingEndDate: votingEndDate.toISOString(),
          remainingTime: canEndRound
            ? 0
            : votingEndDate.getTime() - now.getTime(),
          submissionsCount,
          currentRound: currentRoundPosition,
        });
      } catch (error) {
        console.error("Error checking round status:", error);
        return res.status(500).json({ error: (error as Error).message });
      }
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
