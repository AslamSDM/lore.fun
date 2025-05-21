import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Helper function to generate a random Solana-like wallet address
function generateWalletAddress() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

// Helper function to generate a random username
function generateUsername() {
  const adjectives = [
    "Mystic",
    "Cosmic",
    "Eternal",
    "Epic",
    "Ancient",
    "Dreamy",
    "Curious",
    "Noble",
    "Solar",
    "Lunar",
    "Stellar",
    "Phantom",
    "Magic",
    "Shadow",
    "Golden",
  ];

  const nouns = [
    "Wizard",
    "Writer",
    "Scribe",
    "Creator",
    "Explorer",
    "Storyteller",
    "Knight",
    "Sage",
    "Oracle",
    "Phoenix",
    "Mage",
    "Dragon",
    "Elf",
    "Raven",
    "Wolf",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNum}`;
}

// Helper function to generate a random story title
function generateStoryTitle() {
  const beginnings = [
    "The",
    "Chronicles of",
    "Legend of",
    "Tale of",
    "Mystery of",
    "Secret of",
    "Journey to",
    "Quest for",
    "Rise of",
    "Fall of",
    "Shadows of",
    "Legacy of",
  ];

  const middles = [
    "Lost",
    "Hidden",
    "Forgotten",
    "Ancient",
    "Mystic",
    "Eternal",
    "Cosmic",
    "Dark",
    "Enchanted",
    "Sacred",
    "Haunted",
    "Divine",
    "Imperial",
    "Celestial",
  ];

  const endings = [
    "Kingdom",
    "Realm",
    "World",
    "Artifact",
    "Crown",
    "Sword",
    "Castle",
    "Forest",
    "Temple",
    "Tower",
    "Prophecy",
    "City",
    "Lands",
    "Mountains",
    "Caverns",
  ];

  const beginning = beginnings[Math.floor(Math.random() * beginnings.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const ending = endings[Math.floor(Math.random() * endings.length)];

  return `${beginning} ${middle} ${ending}`;
}

// Helper function to generate genre
function generateGenre() {
  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Adventure",
    "Horror",
    "Romance",
    "Historical Fiction",
    "Thriller",
    "Comedy",
    "Drama",
    "Fable",
    "Fairy Tale",
    "Mythology",
    "Dystopian",
    "Steampunk",
  ];

  return genres[Math.floor(Math.random() * genres.length)];
}

// Helper function to generate a story sentence
function generateSentence(theme = "") {
  const introductions = [
    "The wind whispered",
    "Stars illuminated",
    "Magic flowed through",
    "Darkness enveloped",
    "Light cascaded over",
    "Time stopped as",
    "The ancient runes glowed",
    "Shadows danced across",
    "Rivers flowed beneath",
    "Mountains towered above",
    "The enchanted forest concealed",
    "The kingdom awaited",
  ];

  const middles = [
    "the hidden pathways",
    "a forgotten secret",
    "the sacred grove",
    "mysterious travelers",
    "ancient guardians",
    "the lost artifact",
    "brave adventurers",
    "the prophecy's meaning",
    "unexpected allies",
    "the hero's journey",
    "magical creatures",
    "the royal court",
  ];

  const endings = [
    "revealing a startling truth.",
    "changing everything forever.",
    "as destiny unfolded.",
    "beyond mortal understanding.",
    "awakening ancient powers.",
    "leading to new discoveries.",
    "bringing hope to the realm.",
    "challenging all expectations.",
    "setting a new course.",
    "fulfilling the ancient prophecy.",
    "opening doors to other worlds.",
    "beginning a legendary quest.",
  ];

  const introduction =
    introductions[Math.floor(Math.random() * introductions.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const ending = endings[Math.floor(Math.random() * endings.length)];

  return `${introduction} ${middle} ${ending}`;
}

// Seed function with enhanced data generation
async function main() {
  try {
    console.log("Starting enhanced seed process...");

    // Clear existing data for a fresh start (optional)
    console.log("Clearing existing data...");
    await prisma.vote.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.storySentence.deleteMany({});
    await prisma.story.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users (15 users)
    console.log("Creating users...");
    const userCount = 15;
    const users = [];

    for (let i = 0; i < userCount; i++) {
      const walletAddress = generateWalletAddress();
      const username = generateUsername();

      const user = await prisma.user.create({
        data: {
          walletAddress,
          username,
        },
      });

      users.push(user);
      console.log(`Created user: ${username}`);
    }

    // Create stories (5 stories)
    console.log("\nCreating stories...");
    const storyCount = 5;
    const stories = [];

    for (let i = 0; i < storyCount; i++) {
      const title = generateStoryTitle();
      const genre = generateGenre();
      const creatorIndex = Math.floor(Math.random() * users.length);
      const creator = users[creatorIndex];
      const firstSentence = generateSentence();

      const story = await prisma.story.create({
        data: {
          title,
          subtitle: `A ${genre} tale by ${creator.username}`,
          genre,
          firstSentence,
          createdById: creator.id,
          minSentences: 10 + Math.floor(Math.random() * 15), // Between 10-25 sentences
          votingPeriodDays: 1 + Math.floor(Math.random() * 3), // 1-3 days
          submissionPeriodHours: 6 + Math.floor(Math.random() * 18), // 6-24 hours
        },
      });

      stories.push(story);
      console.log(`Created story: ${title}`);

      // Add first sentence to each story
      await prisma.storySentence.create({
        data: {
          storyId: story.id,
          content: firstSentence,
          position: 1,
          submittedBy: creator.id,
        },
      });

      // Randomly add more sentences to some stories
      const additionalSentences = Math.floor(Math.random() * 5); // 0-4 additional sentences

      for (let j = 0; j < additionalSentences; j++) {
        const authorIndex = Math.floor(Math.random() * users.length);
        const author = users[authorIndex];
        const sentenceContent = generateSentence();

        await prisma.storySentence.create({
          data: {
            storyId: story.id,
            content: sentenceContent,
            position: j + 2, // Position starts from 2 (after the first sentence)
            submittedBy: author.id,
          },
        });

        console.log(`Added sentence ${j + 2} to story: ${title}`);
      }

      // Current position for submissions will be the sentence count + 1
      const currentPosition = additionalSentences + 2;

      // Add submissions for each story's current round
      const submissionCount = 3 + Math.floor(Math.random() * 4); // 3-6 submissions
      const submissions = [];

      for (let j = 0; j < submissionCount; j++) {
        const submitterIndex = Math.floor(Math.random() * users.length);
        const submitter = users[submitterIndex];
        const submissionContent = generateSentence();

        const submission = await prisma.submission.create({
          data: {
            storyId: story.id,
            content: submissionContent,
            submittedBy: submitter.id,
            votingRound: currentPosition,
            isWinner: false, // None are winners yet
          },
        });

        submissions.push(submission);
        console.log(`Added submission to story: ${title}`);
      }

      // Add votes for each submission
      for (const submission of submissions) {
        // Each submission gets a random number of votes
        const voterCount = Math.floor(Math.random() * (users.length - 2)) + 1; // At least 1 vote
        const voters = [...users]
          .sort(() => Math.random() - 0.5)
          .slice(0, voterCount);

        for (const voter of voters) {
          try {
            await prisma.vote.create({
              data: {
                submissionId: submission.id,
                userId: voter.id,
              },
            });

            console.log(
              `Added vote from ${voter.username} to submission in story: ${title}`
            );
          } catch (error) {
            // Ignore unique constraint errors (user already voted for this submission)
            console.log(
              `Vote already exists for user ${voter.username} on this submission`
            );
          }
        }
      }

      // Randomly make one submission a winner for some stories
      if (Math.random() > 0.5 && submissions.length > 0) {
        const winnerIndex = Math.floor(Math.random() * submissions.length);
        const winner = submissions[winnerIndex];

        await prisma.submission.update({
          where: { id: winner.id },
          data: { isWinner: true },
        });

        console.log(`Set a winning submission for story: ${title}`);
      }
    }

    // Provide some statistics
    const userStats = await prisma.user.count();
    const storyStats = await prisma.story.count();
    const sentenceStats = await prisma.storySentence.count();
    const submissionStats = await prisma.submission.count();
    const voteStats = await prisma.vote.count();

    console.log("\n--- Seeding Complete ---");
    console.log(`Created ${userStats} users`);
    console.log(`Created ${storyStats} stories`);
    console.log(`Created ${sentenceStats} sentences`);
    console.log(`Created ${submissionStats} submissions`);
    console.log(`Created ${voteStats} votes`);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
