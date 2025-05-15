import { prisma } from "./prisma";

export class UserService {
  // Get a user by wallet address
  static async getUserByWalletAddress(walletAddress: string) {
    return prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  // Create a new user
  static async createUser(walletAddress: string, username?: string) {
    return prisma.user.create({
      data: {
        walletAddress,
        username,
      },
    });
  }

  // Get or create a user
  static async getOrCreateUser(walletAddress: string) {
    try {
      let user = await this.getUserByWalletAddress(walletAddress);
      let isNew = false;

      if (!user) {
        user = await this.createUser(walletAddress);
        isNew = true;
      }

      return { user, isNew, error: null };
    } catch (error) {
      return { user: null, isNew: false, error: (error as Error).message };
    }
  }

  // Update username
  static async updateUsername(userId: string, username: string) {
    try {
      // Check if username is already taken
      const existing = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId },
        },
      });

      if (existing) {
        return { success: false, error: "Username already taken" };
      }

      await prisma.user.update({
        where: { id: userId },
        data: { username },
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Get user stats
  static async getUserStats(userId: string) {
    const submissionsCount = await prisma.submission.count({
      where: { submittedBy: userId },
    });

    const winningSubmissionsCount = await prisma.submission.count({
      where: {
        submittedBy: userId,
        isWinner: true,
      },
    });

    const votesCount = await prisma.vote.count({
      where: { userId },
    });

    const storiesCount = await prisma.story.count({
      where: { createdById: userId },
    });

    return {
      submissions_count: submissionsCount,
      winning_submissions_count: winningSubmissionsCount,
      votes_cast_count: votesCount,
      stories_created_count: storiesCount,
    };
  }
}

export class StoryService {
  // Get all stories
  static async getAllStories() {
    return prisma.story.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        sentences: {
          select: { id: true },
        },
        submissions: {
          distinct: ["submittedBy"],
          select: { submittedBy: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Create a new story
  static async createStory(storyData: {
    title: string;
    subtitle?: string;
    genre: string;
    firstSentence: string;
    createdById: string;
    minSentences?: number;
    votingPeriodDays?: number;
    submissionPeriodHours?: number;
  }) {
    return prisma.story.create({
      data: {
        ...storyData,
        sentences: {
          create: {
            content: storyData.firstSentence,
            position: 1,
            submittedBy: storyData.createdById,
          },
        },
      },
    });
  }

  // Get story by ID
  static async getStoryById(id: string) {
    return prisma.story.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}

export class SubmissionService {
  // Create a new submission
  static async createSubmission(data: {
    storyId: string;
    content: string;
    submittedBy: string;
    votingRound: number;
  }) {
    return prisma.submission.create({
      data,
    });
  }

  // Get submissions for a voting round
  static async getSubmissionsForVotingRound(storyId: string, round: number) {
    return prisma.submission.findMany({
      where: {
        storyId,
        votingRound: round,
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
  }

  // Set a submission as winner
  static async setSubmissionAsWinner(id: string) {
    return prisma.submission.update({
      where: { id },
      data: { isWinner: true },
    });
  }
}

export class VoteService {
  // Cast a vote
  static async castVote(submissionId: string, userId: string) {
    // Check if user has already voted for a submission in this round
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    // Check if user has already voted in this round
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        submission: {
          storyId: submission.storyId,
          votingRound: submission.votingRound,
        },
      },
    });

    if (existingVote) {
      // If voted for the same submission, remove the vote
      if (existingVote.submissionId === submissionId) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
        return { success: true, action: "removed" };
      }

      // If voted for a different submission, update the vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { submissionId },
      });

      return { success: true, action: "changed" };
    }

    // Create a new vote
    await prisma.vote.create({
      data: {
        submissionId,
        userId,
      },
    });

    return { success: true, action: "added" };
  }
}

export class SentenceService {
  // Add a winning submission as the next sentence
  static async addWinningSubmissionAsSentence(submissionId: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        story: {
          include: {
            sentences: {
              orderBy: { position: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    const nextPosition =
      submission.story.sentences.length > 0
        ? submission.story.sentences[0].position + 1
        : 1;

    const sentence = await prisma.storySentence.create({
      data: {
        storyId: submission.storyId,
        content: submission.content,
        position: nextPosition,
        submittedBy: submission.submittedBy,
      },
    });

    // Mark submission as winner
    await prisma.submission.update({
      where: { id: submissionId },
      data: { isWinner: true },
    });

    return { success: true, sentence };
  }
}
