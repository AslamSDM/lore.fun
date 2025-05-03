"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Layout from "@/components/layout"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import type { GetServerSideProps } from "next"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: "/auth?redirect=/submit",
        permanent: false,
      },
    }
  }

  // Get current story
  const { data: story, error: storyError } = await supabase.from("stories").select("id").eq("is_active", true).single()

  if (storyError) {
    console.error("Error fetching story:", storyError)
  }

  // Get last sentence
  const { data: lastSentence, error: sentenceError } = await supabase
    .from("story_sentences")
    .select("content")
    .eq("story_id", story?.id || 0)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (sentenceError) {
    console.error("Error fetching last sentence:", sentenceError)
  }

  return {
    props: {
      storyId: story?.id || 1,
      lastSentence:
        lastSentence?.content ||
        '"I\'ve been expecting you," the old man said as Sarah approached his modest compound, "but I\'m afraid we may already be too late."',
    },
  }
}

export default function SubmitPage({ storyId, lastSentence }) {
  const [submission, setSubmission] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const handleSubmit = async (e) => {
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

    try {
      // Insert submission into database
      const { data, error } = await supabase
        .from("submissions")
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: submission.trim(),
          status: "voting",
          vote_count: 0,
        })
        .select()

      if (error) throw error

      toast({
        title: "Submission received!",
        description: "Your story continuation has been submitted for voting.",
      })

      // Redirect to voting page
      router.push("/vote")
    } catch (error) {
      console.error("Error submitting:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your continuation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
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
                    <p className="text-sm border-l-2 border-primary pl-3 py-2 bg-muted/50 rounded-sm">{lastSentence}</p>
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
    </Layout>
  )
}
