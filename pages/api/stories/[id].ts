import type { NextApiRequest, NextApiResponse } from "next";
import { runPrismaInApi } from "../../../lib/api-helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    return runPrismaInApi(req, res, async (prisma) => {
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
          orderBy: { position: "asc" },
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Get the current voting round - next position after last sentence
        const currentRoundPosition = sentences.length + 1;

        // Get submissions for the current round
        const submissions = await prisma.submission.findMany({
          where: {
            storyId: id as string,
            votingRound: currentRoundPosition,
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

        // Count total votes for this round
        const totalVotes = submissions.reduce(
          (sum, sub) => sum + sub.votes.length,
          0
        );

        // Calculate percentage for each submission
        const processedSubmissions = submissions.map((sub) => {
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
