import Link from "next/link";

// Mock data for stories
const storiesData = [
  {
    id: "the-bitcoin-odyssey",
    title: "The Bitcoin Odyssey",
    subtitle: "A decentralized story by the community",
    progress: 15,
    sentences: 12,
    contributors: 237,
    genre: "Crypto Fiction",
    votingEndsIn: "2 days",
  },
  {
    id: "ethereal-dreams",
    title: "Ethereal Dreams",
    subtitle: "A journey through the metaverse",
    progress: 42,
    sentences: 38,
    contributors: 156,
    genre: "Science Fiction",
    votingEndsIn: "1 day",
  },
  {
    id: "defi-detective",
    title: "DeFi Detective",
    subtitle: "Solving crimes in a tokenized world",
    progress: 27,
    sentences: 24,
    contributors: 89,
    genre: "Mystery",
    votingEndsIn: "12 hours",
  },
];

export default function StoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Stories</h1>
        <Link href="/create">
          <p className="btn-primary">Create New Story</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storiesData.map((story) => (
          <Link href={`/stories/${story.id}`} key={story.id}>
            <p className="card hover:border-primary transition-all">
              <div className="mb-4">
                <h2 className="text-xl font-bold">{story.title}</h2>
                <p className="text-gray-400">{story.subtitle}</p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{story.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-value"
                    style={{ width: `${story.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Sentences</p>
                  <p className="font-medium">{story.sentences}</p>
                </div>
                <div>
                  <p className="text-gray-400">Contributors</p>
                  <p className="font-medium">{story.contributors}</p>
                </div>
                <div>
                  <p className="text-gray-400">Genre</p>
                  <p className="font-medium">{story.genre}</p>
                </div>
                <div>
                  <p className="text-gray-400">Voting Ends</p>
                  <p className="font-medium">{story.votingEndsIn}</p>
                </div>
              </div>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
