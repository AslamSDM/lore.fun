import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export class UserService {
  // Get a user by wallet address
  static async getUserByWalletAddress(
    prisma: PrismaClient,
    walletAddress: string
  ) {
    return prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  // Create a new user
  static async createUser(
    prisma: PrismaClient,
    walletAddress: string,
    username?: string
  ) {
    return prisma.user.create({
      data: {
        walletAddress,
        username,
      },
    });
  }

  // Get or create a user
  static async getOrCreateUser(prisma: PrismaClient, walletAddress: string) {
    try {
      // Try to find user with retry logic
      let attempts = 0;
      let user = null;
      let isNew = false;

      while (attempts < 2) {
        try {
          user = await this.getUserByWalletAddress(prisma, walletAddress);
          break; // If successful, exit the loop
        } catch (findError) {
          console.warn(
            `Attempt ${attempts + 1} failed to find user:`,
            findError
          );
          attempts++;
          if (attempts >= 2) throw findError; // Re-throw on last attempt
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retry
        }
      }

      // If user doesn't exist, create one
      if (!user) {
        try {
          user = await this.createUser(prisma, walletAddress);
          isNew = true;
        } catch (createError) {
          console.error("Failed to create user:", createError);
          throw createError;
        }
      }

      return { user, isNew, error: null };
    } catch (error) {
      console.error("Error in getOrCreateUser:", error);
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
  // Cast a vote - optimized with transaction
  static async castVote(submissionId: string, userId: string) {
    const startTime = performance.now();

    try {
      // Use transaction for atomicity and better performance
      return await prisma.$transaction(
        async (tx) => {
          // Check if submission exists
          const submission = await tx.submission.findUnique({
            where: { id: submissionId },
            select: { id: true, storyId: true, votingRound: true }, // Optimize by selecting only needed fields
          });

          if (!submission) {
            return { success: false, error: "Submission not found" };
          }

          // Check if user has already voted in this round using an optimized query
          const existingVote = await tx.vote.findFirst({
            where: {
              userId,
              submission: {
                storyId: submission.storyId,
                votingRound: submission.votingRound,
              },
            },
            select: { id: true, submissionId: true }, // Only select needed fields
          });

          let action;
          if (existingVote) {
            // If voted for the same submission, remove the vote
            if (existingVote.submissionId === submissionId) {
              await tx.vote.delete({ where: { id: existingVote.id } });
              action = "removed";
            } else {
              // If voted for a different submission, update the vote
              await tx.vote.update({
                where: { id: existingVote.id },
                data: { submissionId },
              });
              action = "changed";
            }
          } else {
            // Create a new vote
            await tx.vote.create({
              data: {
                submissionId,
                userId,
              },
            });
            action = "added";
          }

          return { success: true, action };
        },
        {
          // Configure transaction settings
          timeout: 10000, // 10 seconds
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );
    } catch (error) {
      console.error("Error in castVote:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      // Log performance for slow operations
      if (process.env.NODE_ENV !== "production") {
        const executionTime = performance.now() - startTime;
        if (executionTime > 100) {
          console.warn(
            `SLOW OPERATION: castVote took ${executionTime.toFixed(2)}ms`
          );
        }
      }
    }
  }
}

export class SentenceService {
  // Add a winning submission as the next sentence using transaction for atomicity and performance
  static async addWinningSubmissionAsSentence(submissionId: string) {
    // Start a performance timer
    const startTime = performance.now();

    try {
      // Use a transaction for atomicity and better performance
      return await prisma.$transaction(
        async (tx) => {
          // Get submission with story data in a single query
          const submission = await tx.submission.findUnique({
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

          // Create new sentence and mark submission as winner in a single transaction
          const sentence = await tx.storySentence.create({
            data: {
              storyId: submission.storyId,
              content: submission.content,
              position: nextPosition,
              submittedBy: submission.submittedBy,
            },
          });

          // Mark submission as winner in the same transaction
          await tx.submission.update({
            where: { id: submissionId },
            data: { isWinner: true },
          });

          return { success: true, sentence };
        },
        {
          // Set reasonable timeout and isolation level
          timeout: 10000, // 10 seconds
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );
    } catch (error) {
      console.error("Error in addWinningSubmissionAsSentence:", error);
      return { success: false, error: (error as Error).message };
    } finally {
      // Log performance in development
      if (process.env.NODE_ENV !== "production") {
        const executionTime = performance.now() - startTime;
        if (executionTime > 100) {
          console.warn(
            `SLOW OPERATION: addWinningSubmissionAsSentence took ${executionTime.toFixed(
              2
            )}ms`
          );
        }
      }
    }
  }
}
