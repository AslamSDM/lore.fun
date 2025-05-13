"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"
import { getOrCreateUser, updateUsername } from "../lib/solana"
import type { User } from "../lib/types"
import UsernameModal from "./username-modal"

interface WalletContextType {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  balance: number
  user: User | null
  loading: boolean
  setUsername: (username: string) => Promise<{ success: boolean; error: string | null }>
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
  balance: 0,
  user: null,
  loading: true,
  setUsername: async () => ({ success: false, error: null }),
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, connecting, connect: connectSolana, disconnect: disconnectSolana } = useSolanaWallet()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [balance, setBalance] = useState(0)

  // Handle wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true)
          const walletAddress = publicKey.toString()

          // Get or create user from database
          const { user: dbUser, isNew, error } = await getOrCreateUser(walletAddress)

          if (error) {
            console.error("Error getting/creating user:", error)
            return
          }

          setUser(dbUser)

          // If new user or no username, show username modal
          if (isNew || (dbUser && !dbUser.username)) {
            setShowUsernameModal(true)
          }

          // Mock balance for now
          setBalance(250)
        } catch (error) {
          console.error("Error handling wallet connection:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    }

    handleWalletConnection()
  }, [connected, publicKey])

  const connect = async () => {
    try {
      await connectSolana()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const disconnect = () => {
    disconnectSolana()
    setUser(null)
  }

  const handleSetUsername = async (username: string): Promise<{ success: boolean; error: string | null }> => {
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const result = await updateUsername(user.id, username)

    if (result.success) {
      setUser((prev) => (prev ? { ...prev, username } : null))
      setShowUsernameModal(false)
    }

    return result
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        publicKey: publicKey?.toString() || null,
        connect,
        disconnect,
        balance,
        user,
        loading,
        setUsername: handleSetUsername,
      }}
    >
      {children}
      {showUsernameModal && <UsernameModal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)} />}
    </WalletContext.Provider>
  )
}
