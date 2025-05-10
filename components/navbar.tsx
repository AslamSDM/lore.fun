"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useWallet } from "../hooks/use-wallet"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import UsernameModal from "./username-modal"

export default function Navbar() {
  const { user, loading, checkUsername } = useWallet()
  const [showUsernameModal, setShowUsernameModal] = useState(false)

  // Check if username is set when user connects
  useEffect(() => {
    const checkUserUsername = async () => {
      if (user && !loading) {
        const hasUsername = await checkUsername()
        if (!hasUsername) {
          setShowUsernameModal(true)
        }
      }
    }

    checkUserUsername()
  }, [user, loading, checkUsername])

  return (
    <nav className="border-b border-gray-800 bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="relative w-8 h-8">
                <Image src="/logo.svg" alt="Lore.Fun Logo" layout="fill" />
              </div>
              <span className="text-xl font-bold">Lore.Fun</span>
            </div>
          </Link>
          <div className="ml-4 px-2 py-1 bg-opacity-20 bg-primary rounded-full text-sm">$LORE</div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/stories">
            <span className="text-gray-300 hover:text-white cursor-pointer">Current Story</span>
          </Link>
          <Link href="/submit">
            <span className="text-gray-300 hover:text-white cursor-pointer">Submit</span>
          </Link>
          <Link href="/vote">
            <span className="text-gray-300 hover:text-white cursor-pointer">Vote</span>
          </Link>

          {user && (
            <Link href="/profile">
              <span className="text-gray-300 hover:text-white cursor-pointer">Profile</span>
            </Link>
          )}

          <WalletMultiButton />
        </div>
      </div>

      <UsernameModal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)} />
    </nav>
  )
}
