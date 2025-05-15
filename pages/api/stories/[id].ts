import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Get story details with creator
      const story = await prisma.story.findUnique({
        where: { id: id as string },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      // Get story sentences with authors
      const sentences = await prisma.storySentence.findMany({
        where: { storyId: id as string },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { position: "asc" },
      });

      // Get current voting round submissions
      const latestPosition =
        sentences.length > 0 ? sentences[sentences.length - 1].position : 0;
      const currentRound = latestPosition + 1;

      const submissions = await prisma.submission.findMany({
        where: {
          storyId: id as string,
          votingRound: currentRound,
          isWinner: false,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          votes: true,
        },
      });

      // Process submissions to include vote counts and percentages
      const totalVotes = submissions.reduce(
        (sum: number, sub: any) => sum + (sub.votes?.length || 0),
        0
      );

      const processedSubmissions = submissions.map((sub: any) => {
        const votesCount = sub.votes?.length || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;

        return {
          ...sub,
          votes_count: votesCount,
          percentage,
        };
      });

      // Format response to match the expected structure
      const formattedStory = {
        ...story,
        created_by: story.createdById,
        first_sentence: story.firstSentence,
        min_sentences: story.minSentences,
        voting_period_days: story.votingPeriodDays,
        submission_period_hours: story.submissionPeriodHours,
        created_at: story.createdAt.toISOString(),
        updated_at: story.updatedAt.toISOString(),
        creator: story.creator,
      };

      const formattedSentences = sentences.map((sentence) => ({
        ...sentence,
        story_id: sentence.storyId,
        submitted_by: sentence.submittedBy,
        created_at: sentence.createdAt.toISOString(),
        author: sentence.author,
      }));

      return res.status(200).json({
        story: formattedStory,
        sentences: formattedSentences,
        current_round: {
          position: currentRound,
          submissions: processedSubmissions,
          total_votes: totalVotes,
        },
      });
    } catch (error) {
      console.error("Error fetching story:", error);
      return res.status(500).json({ error: "Failed to fetch story data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
