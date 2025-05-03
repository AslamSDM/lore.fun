import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, ArrowLeft, ThumbsUp, MessageSquare, Share2 } from "lucide-react"

export default function StoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Film className="h-6 w-6" />
            <span className="text-xl font-bold">BlockBuster</span>
            <Badge variant="outline" className="ml-2">
              $MOV
            </Badge>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/story">Current Story</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/submit">Submit</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/vote">Vote</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/connect">Connect Wallet</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
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
                    <CardTitle className="text-2xl">The Bitcoin Odyssey</CardTitle>
                    <CardDescription>A decentralized story by the community</CardDescription>
                  </div>
                  <Badge>Working Title</Badge>
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                <p>
                  In the year 2031, ten years after the historic Bitcoin standard was adopted globally, a mysterious
                  figure known only as "Nakamoto" emerged from the shadows.
                </p>
                <p>
                  The world had changed dramatically since the collapse of the traditional banking system, with
                  decentralized networks now governing everything from finance to social interactions.
                </p>
                <p>
                  Sarah Chen, a brilliant cryptographer working for the Global Blockchain Consortium, received an
                  encrypted message that appeared to be signed with the original Satoshi private key.
                </p>
                <p>
                  "The system is compromised," the message read, "A fatal flaw in the consensus algorithm will trigger a
                  cascade failure in exactly 21 days."
                </p>
                <p>
                  As panic spread through the markets, Sarah assembled a team of the world's best blockchain engineers
                  to verify the claim and search for a solution.
                </p>
                <p>
                  Meanwhile, in a secure underground facility in Switzerland, the world's most powerful quantum computer
                  was being prepared for an unprecedented attack on the Bitcoin network.
                </p>
                <p>
                  The team discovered that the vulnerability was not in Bitcoin's code, but in the interconnected
                  systems that had been built upon it, creating a complex web of dependencies.
                </p>
                <p>
                  As governments scrambled to secure their digital reserves, a shadowy consortium of former central
                  bankers saw an opportunity to restore the old financial order.
                </p>
                <p>
                  Sarah realized that the only person who could help them was the original creator of Bitcoin, who had
                  remained silent for over two decades.
                </p>
                <p>
                  Using a series of clues hidden in the blockchain's earliest transactions, Sarah began a global hunt
                  for Satoshi Nakamoto, racing against time and powerful enemies.
                </p>
                <p>
                  The trail led her to a remote island in the Pacific, where an aging programmer had been living off the
                  grid, monitoring his creation from afar.
                </p>
                <p>
                  "I've been expecting you," the old man said as Sarah approached his modest compound, "but I'm afraid
                  we may already be too late."
                </p>
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Submission #1</span>
                    <span className="text-sm text-muted-foreground">42% (1,245 votes)</span>
                  </div>
                  <p className="text-sm border-l-2 border-primary pl-3 py-1">
                    "The old man handed Sarah a small device, its screen displaying a countdown that matched exactly
                    with the 21-day warning."
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Vote
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Submission #2</span>
                    <span className="text-sm text-muted-foreground">31% (923 votes)</span>
                  </div>
                  <p className="text-sm border-l-2 border-muted pl-3 py-1">
                    "As Sarah processed the old man's words, a deafening explosion rocked the island, sending plumes of
                    smoke into the clear blue sky."
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Vote
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Submission #3</span>
                    <span className="text-sm text-muted-foreground">27% (801 votes)</span>
                  </div>
                  <p className="text-sm border-l-2 border-muted pl-3 py-1">
                    "The old man smiled mysteriously, 'But I've prepared for this day since the genesis block was
                    mined,' he said, revealing a hidden bunker filled with servers."
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Vote
                  </Button>
                </div>
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
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Contributors</span>
                  <span className="text-sm font-medium">9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Votes Cast</span>
                  <span className="text-sm font-medium">24,567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Estimated Completion</span>
                  <span className="text-sm font-medium">3 months</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 BlockBuster. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground underline underline-offset-4">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
