"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, ArrowLeft, Clock, ThumbsUp, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const submissions = [
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
  {
    id: 4,
    text: "'They've found us,' the old man whispered, his eyes darting to a bank of security monitors showing armed figures approaching through the dense jungle.",
    author: "hodl_king",
    votes: 612,
    percentage: 21,
  },
  {
    id: 5,
    text: "Sarah pulled out her quantum-encrypted phone and showed the old man the message that had brought her here, watching his face pale as he recognized the signature.",
    author: "crypto_alice",
    votes: 498,
    percentage: 17,
  },
]

export default function VotePage() {
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()

  const handleVote = async () => {
    if (selectedSubmission === null) return

    setIsVoting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Vote cast successfully!",
        description: "Your vote has been recorded on the blockchain.",
      })
      setIsVoting(false)
    }, 1500)
  }

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
            <Link href="/story">
              <ArrowLeft className="h-4 w-4" />
              Back to Story
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle>Vote on the Next Sentence</CardTitle>
                  <CardDescription>Choose which continuation should be added to "The Bitcoin Odyssey"</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Voting ends in: 2 days, 4 hours</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium">Last sentence in the story:</h3>
                <p className="text-sm border-l-2 border-primary pl-3 py-2 bg-muted/50 rounded-sm">
                  "I've been expecting you," the old man said as Sarah approached his modest compound, "but I'm afraid
                  we may already be too late."
                </p>
              </div>

              <div className="space-y-6">
                <RadioGroup
                  value={selectedSubmission?.toString()}
                  onValueChange={(value) => setSelectedSubmission(Number.parseInt(value))}
                >
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <RadioGroupItem
                          value={submission.id.toString()}
                          id={`submission-${submission.id}`}
                          className="mt-1"
                        />
                        <div className="space-y-2 flex-1">
                          <Label htmlFor={`submission-${submission.id}`} className="text-base font-medium">
                            {submission.text}
                          </Label>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{submission.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>{submission.votes} votes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pl-6">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current standing</span>
                          <span>{submission.percentage}%</span>
                        </div>
                        <Progress value={submission.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/story">Back to Story</Link>
              </Button>
              <Button onClick={handleVote} disabled={isVoting || selectedSubmission === null}>
                {isVoting ? "Casting Vote..." : "Cast Vote"}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>How Voting Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Each $MOV token holder gets one vote per voting round. The submission with the most votes at the end
                  of the voting period will be added to the story.
                </p>
                <p>
                  Voting is recorded on the blockchain for complete transparency. Once a vote is cast, it cannot be
                  changed.
                </p>
                <p>
                  If your submitted sentence wins, you'll receive 500 $MOV tokens as a reward for your contribution to
                  the story.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Voting Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Votes Cast</span>
                  <span className="text-sm font-medium">4,079</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Unique Voters</span>
                  <span className="text-sm font-medium">2,341</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Submissions</span>
                  <span className="text-sm font-medium">87</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Voting Power Used</span>
                  <span className="text-sm font-medium">63%</span>
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
