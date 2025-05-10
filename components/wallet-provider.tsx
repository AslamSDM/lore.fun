"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"

interface WalletContextType {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  balance: number
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
  balance: 0,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  // Mock wallet connection for demo purposes
  const connect = async () => {
    try {
      setConnecting(true)
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setConnected(true)
      setPublicKey("8xH5f7MQVAMVjWxDJAJyp4HYzJXGn9JeKPdMvFKKgDxD")
      setBalance(250)
      setConnecting(false)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setConnected(false)
    setPublicKey(null)
    setBalance(0)
  }

  // Check if wallet was previously connected
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem("walletConnected") === "true"
      if (wasConnected) {
        await connect()
      }
    }

    checkConnection()
  }, [])

  // Save connection state
  useEffect(() => {
    if (connected) {
      localStorage.setItem("walletConnected", "true")
    } else {
      localStorage.removeItem("walletConnected")
    }
  }, [connected])

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        publicKey,
        connect,
        disconnect,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
