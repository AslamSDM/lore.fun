"use client";
import { useRouter } from "next/router";
import Link from "next/link";

// Mock data for the story
const storyData = {
  id: "the-bitcoin-odyssey",
  title: "The Bitcoin Odyssey",
  subtitle: "A decentralized story by the community",
  status: "Working Title",
  content: [
    'In the year 2031, ten years after the historic Bitcoin standard was adopted globally, a mysterious figure known only as "Nakamoto" emerged from the shadows.',
    "The world had changed dramatically since the collapse of the traditional banking system, with decentralized networks now governing everything from finance to social interactions.",
    "Sarah Chen, a brilliant cryptographer working for the Global Blockchain Consortium, received an encrypted message that appeared to be signed with the original Satoshi private key.",
    '"The system is compromised," the message read, "A fatal flaw in the consensus algorithm will trigger a cascade failure in exactly 21 days."',
    "As panic spread through the markets, Sarah assembled a team of the world's best blockchain engineers to verify the claim and search for a solution.",
    "Meanwhile, in a secure underground facility in Switzerland, the world's most powerful quantum computer was being prepared for an unprecedented attack on the Bitcoin network.",
    '"I\'ve been expecting you," the old man said as Sarah approached his modest compound, "but I\'m afraid we may already be too late."',
  ],
  votingRound: {
    endsIn: "2 days, 4 hours",
    submissions: [
      {
        id: 1,
        text: "The old man handed Sarah a small device, its screen displaying a countdown that matched exactly with the 21-day warning.",
        author: "satoshi_fan",
        votes: 1245,
        percentage: 42,
      },
      {
        id: 2,
        text: "As Sarah processed the old man's words, a deafening explosion rocked the island, sending plumes of smoke into the clear blue sky.",
        author: "crypto_writer",
        votes: 923,
        percentage: 31,
      },
      {
        id: 3,
        text: "The old man smiled mysteriously, 'But I've prepared for this day since the genesis block was mined,' he said, revealing a hidden bunker filled with servers.",
        author: "blockchain_poet",
        votes: 801,
        percentage: 27,
      },
    ],
  },
};

export default function StoryPage() {
  const router = useRouter();
  const { id } = router.query;

  // In a real app, you would fetch the story data based on the ID
  const story = storyData;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/">
        <p className="flex items-center text-gray-400 hover:text-white mb-6">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </p>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{story.title}</h1>
                <p className="text-gray-400">{story.subtitle}</p>
              </div>
              <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">
                {story.status}
              </span>
            </div>

            <div className="space-y-6 mt-8">
              {story.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-2">Current Voting Round</h2>
            <p className="text-gray-400 mb-6">
              Vote closes in {story.votingRound.endsIn}
            </p>

            <div className="space-y-6">
              {story.votingRound.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium">
                      Submission #{submission.id}
                    </p>
                    <p className="text-sm text-gray-400">
                      {submission.percentage}% ({submission.votes} votes)
                    </p>
                  </div>
                  <blockquote className="border-l-4 border-primary pl-4 italic mb-4">
                    "{submission.text}"
                  </blockquote>
                  <Link href={`/stories/${id}/vote`}>
                    <p className="btn-primary text-center block w-full">Vote</p>
                  </Link>
                </div>
              ))}
            </div>

            <Link href={`/stories/${id}/vote`}>
              <p className="text-primary hover:underline block text-center mt-6">
                View All Submissions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
