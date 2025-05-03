import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Film, Users, Vote } from "lucide-react"
import Layout from "@/components/layout"
import type { GetServerSideProps } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)

  // Get current story stats
  const { data: storyStats, error: storyError } = await supabase
    .from("stories")
    .select("id, title, sentence_count, active_contributors, current_voting_end")
    .eq("is_active", true)
    .single()

  if (storyError) {
    console.error("Error fetching story stats:", storyError)
  }

  return {
    props: {
      storyStats: storyStats || null,
    },
  }
}

export default function Home({ storyStats }) {
  return (
    <Layout>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Collaborative Storytelling on the Blockchain
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join the first decentralized movie production. Submit storylines, vote on the best content, and help
                    create a Bitcoin-themed movie.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/story">Read Current Story</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/auth">Connect Wallet to Participate</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Current Progress</CardTitle>
                    <CardDescription>The Bitcoin movie story is evolving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Film className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">
                          Story Progress:{" "}
                          {storyStats?.sentence_count
                            ? Math.min(Math.round((storyStats.sentence_count / 80) * 100), 100)
                            : 15}
                          %
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          {storyStats?.sentence_count || 12} sentences
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${storyStats?.sentence_count ? Math.min(Math.round((storyStats.sentence_count / 80) * 100), 100) : 15}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">Active Contributors</div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          {storyStats?.active_contributors || 237}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Vote className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">Current Voting Round</div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          {storyStats?.current_voting_end
                            ? `Ends in ${Math.max(0, Math.ceil((new Date(storyStats.current_voting_end) - new Date()) / (1000 * 60 * 60 * 24)))} days`
                            : "Ends in 2 days"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <div className="font-medium">$MOV Token Price</div>
                        <div className="ml-auto text-sm text-muted-foreground">0.0015 BTC</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href="/submit">Submit Next Sentence</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our decentralized platform allows token holders to shape the future of storytelling
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Connect Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Hold $MOV tokens to participate in the storytelling process</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Submit Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Propose the next sentence in the Bitcoin movie storyline</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cast your vote for the best continuation of the story</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>4. Earn Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Get rewarded when your submissions are selected by the community</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
