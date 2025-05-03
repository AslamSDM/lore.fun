"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, ArrowLeft, Wallet, ShieldCheck, Coins } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConnectPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
      toast({
        title: "Wallet connected!",
        description: "Your wallet has been successfully connected.",
      })
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
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Connect your wallet to participate in the Bitcoin movie story creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isConnected ? (
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address</span>
                      <span className="font-mono">0x71C...F29b</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network</span>
                      <span>Ethereum Mainnet</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">$MOV Balance</span>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        <span>1,250 $MOV</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <img src="/placeholder.svg?height=32&width=32" alt="MetaMask" className="h-8 w-8" />
                    <div className="flex-1">
                      <h3 className="font-medium">MetaMask</h3>
                      <p className="text-xs text-muted-foreground">Connect to your MetaMask wallet</p>
                    </div>
                    <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <img src="/placeholder.svg?height=32&width=32" alt="Coinbase Wallet" className="h-8 w-8" />
                    <div className="flex-1">
                      <h3 className="font-medium">Coinbase Wallet</h3>
                      <p className="text-xs text-muted-foreground">Connect to your Coinbase wallet</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <img src="/placeholder.svg?height=32&width=32" alt="WalletConnect" className="h-8 w-8" />
                    <div className="flex-1">
                      <h3 className="font-medium">WalletConnect</h3>
                      <p className="text-xs text-muted-foreground">Connect using WalletConnect</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">Why connect your wallet?</h3>
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
              {isConnected ? (
                <>
                  <Button variant="outline" onClick={() => setIsConnected(false)}>
                    Disconnect
                  </Button>
                  <Button asChild>
                    <Link href="/story">Continue to Story</Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              )}
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
