import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting seed...");

    // Create test users
    console.log("Creating test users...");
    const user1 = await prisma.user.upsert({
      where: { walletAddress: "11111111111111111111111111111111" },
      update: {},
      create: {
        walletAddress: "11111111111111111111111111111111",
        username: "StoryTeller1",
      },
    });

    const user2 = await prisma.user.upsert({
      where: { walletAddress: "22222222222222222222222222222222" },
      update: {},
      create: {
        walletAddress: "22222222222222222222222222222222",
        username: "StoryTeller2",
      },
    });

    const user3 = await prisma.user.upsert({
      where: { walletAddress: "33333333333333333333333333333333" },
      update: {},
      create: {
        walletAddress: "33333333333333333333333333333333",
        username: "StoryTeller3",
      },
    });

    console.log("Created users:", { user1, user2, user3 });

    // Create a test story
    console.log("Creating test story...");
    const story = await prisma.story.create({
      data: {
        title: "The Mysterious Forest",
        subtitle: "A tale of adventure and discovery",
        genre: "Fantasy",
        firstSentence:
          "Once upon a time, in a land far away, there was an ancient forest shrouded in mystery.",
        createdById: user1.id,
        minSentences: 10,
        votingPeriodDays: 3,
        submissionPeriodHours: 24,
      },
    });

    console.log("Created story:", story);

    // Add first sentence to the story
    console.log("Adding first sentence...");
    const sentence1 = await prisma.storySentence.create({
      data: {
        storyId: story.id,
        content:
          "Once upon a time, in a land far away, there was an ancient forest shrouded in mystery.",
        position: 1,
        submittedBy: user1.id,
      },
    });

    console.log("First sentence added:", sentence1);

    // Create submissions for the next round
    console.log("Creating submissions...");
    const submission1 = await prisma.submission.create({
      data: {
        storyId: story.id,
        content:
          "The trees whispered secrets to those brave enough to listen, but few ever ventured deep enough to hear them.",
        submittedBy: user2.id,
        votingRound: 2,
      },
    });

    const submission2 = await prisma.submission.create({
      data: {
        storyId: story.id,
        content:
          "Locals believed that the forest was home to magical creatures that guarded an ancient treasure.",
        submittedBy: user3.id,
        votingRound: 2,
      },
    });

    console.log("Created submissions:", { submission1, submission2 });

    // Add some votes
    console.log("Adding votes...");
    const vote1 = await prisma.vote.create({
      data: {
        submissionId: submission1.id,
        userId: user1.id,
      },
    });

    const vote2 = await prisma.vote.create({
      data: {
        submissionId: submission1.id,
        userId: user3.id,
      },
    });

    console.log("Added votes:", { vote1, vote2 });

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
