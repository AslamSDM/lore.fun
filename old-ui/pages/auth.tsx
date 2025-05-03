"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Layout from "@/components/layout"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { redirect } = router.query

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      const redirectPath = typeof redirect === "string" ? redirect : "/"
      router.push(redirectPath)
    }
  }, [user, router, redirect])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Signed in successfully!",
        description: "Welcome back to BlockBuster.",
      })

      // Redirect to the requested page or home
      const redirectPath = typeof redirect === "string" ? redirect : "/"
      router.push(redirectPath)
    } catch (error) {
      console.error("Error signing in:", error)
      toast({
        title: "Sign in failed",
        description: error.message || "There was an error signing in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split("@")[0],
          },
        },
      })

      if (error) throw error

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      })
    } catch (error) {
      console.error("Error signing up:", error)
      toast({
        title: "Sign up failed",
        description: error.message || "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <main className="flex-1 container py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect to BlockBuster</CardTitle>
              <CardDescription>
                Sign in or create an account to participate in the Bitcoin movie story creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    onClick={handleSignIn}
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleSignUp}
                    disabled={isLoading || !email || !password}
                  >
                    Sign Up
                  </Button>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Coming soon!" })}>
                  <img src="/placeholder.svg?height=24&width=24" alt="Google" className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Coming soon!" })}>
                  <img src="/placeholder.svg?height=24&width=24" alt="GitHub" className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">Why connect your account?</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Verify your $MOV token holdings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Submit your own story continuations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Vote on submissions from other contributors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span>Earn rewards when your submissions are selected</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </Layout>
  )
}
