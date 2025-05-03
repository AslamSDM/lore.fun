"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, ArrowLeft, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function SubmitPage() {
  const [submission, setSubmission] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submission.trim().length < 10) {
      toast({
        title: "Submission too short",
        description: "Your submission must be at least 10 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Submission received!",
        description: "Your story continuation has been submitted for voting.",
      })
      setSubmission("")
      setIsSubmitting(false)
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

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Continuation</CardTitle>
              <CardDescription>Propose the next sentence in "The Bitcoin Odyssey"</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Last sentence in the story:</h3>
                    <p className="text-sm border-l-2 border-primary pl-3 py-2 bg-muted/50 rounded-sm">
                      "I've been expecting you," the old man said as Sarah approached his modest compound, "but I'm
                      afraid we may already be too late."
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission Guidelines</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 text-sm space-y-1 mt-2">
                        <li>Your submission should be a single sentence that continues the story</li>
                        <li>Keep it between 10-50 words</li>
                        <li>Stay consistent with the established tone and plot</li>
                        <li>You must hold at least 100 $MOV tokens to submit</li>
                        <li>Submissions close in 12 hours</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label htmlFor="submission" className="text-sm font-medium">
                      Your submission:
                    </label>
                    <Textarea
                      id="submission"
                      placeholder="Type your continuation here..."
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {submission.length} characters | {submission.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href="/story">Cancel</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || submission.trim().length < 10}>
                {isSubmitting ? "Submitting..." : "Submit for Voting"}
              </Button>
            </CardFooter>
          </Card>
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
