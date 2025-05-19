import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Basic in-memory cache with 5-minute expiration to reduce database load
let cachedResult: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add basic rate limiting
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");

  // Check cache first
  const now = Date.now();
  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
    return res.status(200).json(cachedResult.data);
  }
  try {
    // Get total story count first to handle empty database case
    const storyCount = await prisma.story.count();

    if (storyCount === 0) {
      // Return empty but valid response instead of error
      return res.status(200).json({
        featured: null,
        topStories: [],
      });
    }

    // Get stories with the most votes (we'll aggregate vote counts for submissions)
    const storiesWithVotes = await prisma.story.findMany({
      take: 8, // Get top 8 stories instead of just 5 to provide more variety
      orderBy: [
        { updatedAt: "desc" }, // First get the most recently updated stories
        { createdAt: "desc" }, // Then by creation date as secondary sort
      ],
      select: {
        id: true,
        title: true,
        subtitle: true,
        genre: true,
        firstSentence: true,
        createdById: true,
        minSentences: true,
        createdAt: true,
        creator: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            sentences: true,
            submissions: true,
          },
        },
        // Get submission stats to calculate votes
        submissions: {
          select: {
            id: true,
            votingRound: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
          // Limit the number of submissions we retrieve for performance
          take: 100,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Safely sort by vote count
    try {
      storiesWithVotes.sort((a, b) => {
        try {
          const aVotes = a.submissions.reduce(
            (sum, submission) => sum + (submission._count?.votes || 0),
            0
          );
          const bVotes = b.submissions.reduce(
            (sum, submission) => sum + (submission._count?.votes || 0),
            0
          );
          return bVotes - aVotes;
        } catch (error) {
          console.error("Error calculating votes during sort:", error);
          return 0; // Keep existing order if calculation fails
        }
      });
    } catch (error) {
      console.error("Error sorting stories by votes:", error);
      // Fall back to the default sorted order from the database query
    }

    // Get the top story (most voted)
    const featuredStory = storiesWithVotes[0];

    if (!featuredStory) {
      // Return empty but valid response instead of 404 error
      return res.status(200).json({
        featured: null,
        topStories: [],
      });
    }

    // Transform the featured stories into the right format
    const topStories = await Promise.all(
      storiesWithVotes.map(async (story) => {
        try {
          // Calculate current progress percentage
          const progress = Math.min(
            Math.round(
              ((story._count.sentences || 0) / (story.minSentences || 100)) *
                100
            ),
            100
          );

          // Calculate total votes for this story
          const totalVotes = story.submissions.reduce(
            (sum, submission) => sum + (submission._count?.votes || 0),
            0
          );

          // Get the current voting round (max voting round)
          const currentRound =
            story.submissions.length > 0
              ? Math.max(
                  ...story.submissions.map((sub) => sub.votingRound || 1)
                )
              : 1;

          let contributorCount = 0;

          try {
            // Calculate contributors count (unique users who submitted or voted)
            // First, get all users who submitted to this story
            const submitters = await prisma.submission.findMany({
              where: { storyId: story.id },
              select: { submittedBy: true },
              distinct: ["submittedBy"],
            });

            // Next, get all users who voted on submissions for this story
            const voters = await prisma.vote.findMany({
              where: {
                submission: {
                  storyId: story.id,
                },
              },
              select: { userId: true },
              distinct: ["userId"],
            });

            // Combine both sets and count unique users
            const submitterIds = new Set(submitters.map((s) => s.submittedBy));
            const voterIds = new Set(voters.map((v) => v.userId));
            const allContributorIds = new Set([...submitterIds, ...voterIds]);
            contributorCount = allContributorIds.size;
          } catch (error) {
            console.error(
              `Error counting contributors for story ${story.id}:`,
              error
            );
            // Default to a safe fallback if contributor counting fails
            contributorCount = story.submissions.length || 1;
          }

          // Estimate time remaining for voting (3 days from creation as default)
          const now = new Date();
          const estimatedVotingEndsAt = new Date(story.createdAt);
          estimatedVotingEndsAt.setDate(estimatedVotingEndsAt.getDate() + 3);

          // Calculate days remaining or hours/minutes if less than a day
          let timeRemaining = "No active voting";
          if (estimatedVotingEndsAt > now) {
            const diffTime = Math.abs(
              estimatedVotingEndsAt.getTime() - now.getTime()
            );
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(
              (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const diffMinutes = Math.floor(
              (diffTime % (1000 * 60 * 60)) / (1000 * 60)
            );

            if (diffDays > 0) {
              timeRemaining = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
            } else if (diffHours > 0) {
              timeRemaining = `${diffHours} hour${diffHours > 1 ? "s" : ""}`;

              // For better UX, add minutes if less than 5 hours
              if (diffHours < 5 && diffMinutes > 0) {
                timeRemaining += ` ${diffMinutes} min`;
              }
            } else {
              // Minutes only
              timeRemaining = `${diffMinutes} minute${
                diffMinutes > 1 ? "s" : ""
              }`;
            }
          }

          // Calculate LORE tokens based on contributors (real implementation would query blockchain)
          const loreTokens = (contributorCount * 0.005).toFixed(4);

          return {
            id: story.id,
            title: story.title,
            subtitle: story.subtitle,
            genre: story.genre,
            description: story.firstSentence,
            author: story.creator?.username || "Anonymous",
            createdAt: story.createdAt,
            progress,
            sentencesCount: story._count.sentences || 0,
            contributorsCount: contributorCount,
            submissionsCount: story._count.submissions || 0,
            currentRound,
            timeRemaining,
            loreTokens,
            totalVotes,
          };
        } catch (error) {
          console.error(`Error processing story ${story.id}:`, error);
          // Return a minimal valid story object if we encounter an error
          return {
            id: story.id || "unknown-id",
            title: story.title || "Error Loading Story",
            subtitle: "",
            genre: story.genre || "Unknown",
            description: "There was an error loading this story.",
            author: story.creator?.username || "Anonymous",
            createdAt: story.createdAt || new Date(),
            progress: 0,
            sentencesCount: 0,
            contributorsCount: 0,
            submissionsCount: 0,
            currentRound: 1,
            timeRemaining: "Unknown",
            loreTokens: "0",
            totalVotes: 0,
            _hasError: true,
          };
        }
      })
    );

    // Prepare response data
    const responseData = {
      featured: topStories[0],
      topStories: topStories,
    };

    // Store in cache
    cachedResult = {
      data: responseData,
      timestamp: Date.now(),
    };

    // Return both the featured story and all top stories for the carousel
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching featured story:", error);

    // If we have a stale cache and hit an error, return the stale data with an indication
    if (cachedResult) {
      console.log("Returning stale cached data after error");
      const staleData = {
        ...cachedResult.data,
        _staleData: true,
      };
      return res.status(200).json(staleData);
    }

    return res.status(500).json({ error: "Failed to fetch featured story" });
  }
}
