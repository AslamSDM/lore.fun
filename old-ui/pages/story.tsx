import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ThumbsUp, MessageSquare, Share2 } from "lucide-react"
import Layout from "@/components/layout"
import type { GetServerSideProps } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)

  // Get current story
  const { data: story, error: storyError } = await supabase
    .from("stories")
    .select("id, title, working_title")
    .eq("is_active", true)
    .single()

  if (storyError) {
    console.error("Error fetching story:", storyError)
  }

  // Get story sentences
  const { data: sentences, error: sentencesError } = await supabase
    .from("story_sentences")
    .select("id, content, created_at")
    .eq("story_id", story?.id || 0)
    .order("created_at", { ascending: true })

  if (sentencesError) {
    console.error("Error fetching sentences:", sentencesError)
  }

  // Get current submissions for voting
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, content, user_id, vote_count, profiles(username)")
    .eq("story_id", story?.id || 0)
    .eq("status", "voting")
    .order("vote_count", { ascending: false })
    .limit(3)

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError)
  }

  // Get story stats
  const { data: stats, error: statsError } = await supabase
    .from("stories")
    .select("sentence_count, contributor_count, total_votes, estimated_completion")
    .eq("id", story?.id || 0)
    .single()

  if (statsError) {
    console.error("Error fetching stats:", statsError)
  }

  // Calculate vote percentages
  const totalVotes = submissions?.reduce((sum, sub) => sum + (sub.vote_count || 0), 0) || 1
  const submissionsWithPercentage = submissions?.map((sub) => ({
    ...sub,
    percentage: Math.round(((sub.vote_count || 0) / totalVotes) * 100),
  }))

  return {
    props: {
      story: story || { title: "The Bitcoin Odyssey", working_title: true },
      sentences: sentences || [],
      submissions: submissionsWithPercentage || [],
      stats: stats || {
        sentence_count: 12,
        contributor_count: 9,
        total_votes: 24567,
        estimated_completion: "3 months",
      },
    },
  }
}

export default function StoryPage({ story, sentences, submissions, stats }) {
  // If no real sentences from DB, use these defaults
  const defaultSentences = [
    'In the year 2031, ten years after the historic Bitcoin standard was adopted globally, a mysterious figure known only as "Nakamoto" emerged from the shadows.',
    "The world had changed dramatically since the collapse of the traditional banking system, with decentralized networks now governing everything from finance to social interactions.",
    "Sarah Chen, a brilliant cryptographer working for the Global Blockchain Consortium, received an encrypted message that appeared to be signed with the original Satoshi private key.",
    '"The system is compromised," the message read, "A fatal flaw in the consensus algorithm will trigger a cascade failure in exactly 21 days."',
    "As panic spread through the markets, Sarah assembled a team of the world's best blockchain engineers to verify the claim and search for a solution.",
    "Meanwhile, in a secure underground facility in Switzerland, the world's most powerful quantum computer was being prepared for an unprecedented attack on the Bitcoin network.",
    "The team discovered that the vulnerability was not in Bitcoin's code, but in the interconnected systems that had been built upon it, creating a complex web of dependencies.",
    "As governments scrambled to secure their digital reserves, a shadowy consortium of former central bankers saw an opportunity to restore the old financial order.",
    "Sarah realized that the only person who could help them was the original creator of Bitcoin, who had remained silent for over two decades.",
    "Using a series of clues hidden in the blockchain's earliest transactions, Sarah began a global hunt for Satoshi Nakamoto, racing against time and powerful enemies.",
    "The trail led her to a remote island in the Pacific, where an aging programmer had been living off the grid, monitoring his creation from afar.",
    '"I\'ve been expecting you," the old man said as Sarah approached his modest compound, "but I\'m afraid we may already be too late."',
  ]

  const storyContent = sentences.length > 0 ? sentences.map((s) => s.content) : defaultSentences

  // If no real submissions from DB, use these defaults
  const defaultSubmissions = [
    {
      id: 1,
      content:
        "The old man handed Sarah a small device, its screen displaying a countdown that matched exactly with the 21-day warning.",
      profiles: { username: "satoshi_fan" },
      vote_count: 1245,
      percentage: 42,
    },
    {
      id: 2,
      content:
        "As Sarah processed the old man's words, a deafening explosion rocked the island, sending plumes of smoke into the clear blue sky.",
      profiles: { username: "crypto_writer" },
      vote_count: 923,
      percentage: 31,
    },
    {
      id: 3,
      content:
        "The old man smiled mysteriously, 'But I've prepared for this day since the genesis block was mined,' he said, revealing a hidden bunker filled with servers.",
      profiles: { username: "blockchain_poet" },
      vote_count: 801,
      percentage: 27,
    },
  ]

  const votingSubmissions = submissions.length > 0 ? submissions : defaultSubmissions

  return (
    <Layout>
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">{story.title}</CardTitle>
                    <CardDescription>A decentralized story by the community</CardDescription>
                  </div>
                  {story.working_title && <Badge>Working Title</Badge>}
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                {storyContent.map((sentence, index) => (
                  <p key={index}>{sentence}</p>
                ))}
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>1.2k</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Comments</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
                <Button asChild>
                  <Link href="/submit">Submit Next Line</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Voting Round</CardTitle>
                <CardDescription>Vote closes in 2 days, 4 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {votingSubmissions.map((submission, index) => (
                  <div key={submission.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Submission #{index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {submission.percentage}% ({submission.vote_count} votes)
                      </span>
                    </div>
                    <p className={`text-sm border-l-2 ${index === 0 ? "border-primary" : "border-muted"} pl-3 py-1`}>
                      "{submission.content}"
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Vote
                    </Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full" asChild>
                  <Link href="/vote">View All Submissions</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Story Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Sentences</span>
                  <span className="text-sm font-medium">{stats.sentence_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Contributors</span>
                  <span className="text-sm font-medium">{stats.contributor_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Votes Cast</span>
                  <span className="text-sm font-medium">{stats.total_votes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Estimated Completion</span>
                  <span className="text-sm font-medium">{stats.estimated_completion}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  )
}
