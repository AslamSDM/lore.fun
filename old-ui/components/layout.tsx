"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Film } from "lucide-react"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/router"
import { useToast } from "@/hooks/use-toast"

export default function Layout({ children }) {
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
      })
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Link href="/" className="flex gap-2 items-center">
              <Film className="h-6 w-6" />
              <span className="text-xl font-bold">BlockBuster</span>
            </Link>
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
              {user ? (
                <Button variant="default" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Button asChild variant="default">
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {children}

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
