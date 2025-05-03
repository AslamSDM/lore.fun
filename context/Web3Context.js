"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

const Web3Context = createContext()

export function Web3Provider({ children }) {
  const [address, setAddress] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [loreBalance, setLoreBalance] = useState(null)
  const [hasLoreTokens, setHasLoreTokens] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("No Ethereum wallet found. Please install MetaMask or another wallet.")
      return false
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      const userAddress = accounts[0]

      // Create ethers provider and signer
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum)
      const ethersSigner = ethersProvider.getSigner()

      setAddress(userAddress)
      setProvider(ethersProvider)
      setSigner(ethersSigner)

      // Check token balance
      await checkTokenBalance(userAddress)

      return true
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError("Failed to connect wallet. Please try again.")
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setLoreBalance(null)
    setHasLoreTokens(false)
  }, [])

  const checkTokenBalance = useCallback(async (walletAddress) => {
    if (!walletAddress) return

    try {
      setLoreBalance(null) // Reset balance while loading

      const response = await fetch(`/api/token-balance?address=${walletAddress}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error checking token balance:", errorData.error)
        setLoreBalance("Error")
        setHasLoreTokens(false)
        return
      }

      const data = await response.json()
      setLoreBalance(data.balance)
      setHasLoreTokens(data.hasTokens)

      console.log(`Token balance for ${walletAddress}: ${data.balance}`)
    } catch (err) {
      console.error("Error checking token balance:", err)
      setLoreBalance("Error")
      setHasLoreTokens(false)
    }
  }, [])

  const signMessage = useCallback(
    async (message) => {
      if (!signer) {
        setError("Wallet not connected")
        return null
      }

      try {
        return await signer.signMessage(message)
      } catch (err) {
        console.error("Error signing message:", err)
        setError("Failed to sign message with wallet")
        return null
      }
    },
    [signer],
  )

  // Auto-connect wallet if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet()
      }
    }

    checkConnection()
  }, [connectWallet])

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnectWallet()
      } else if (accounts[0] !== address) {
        // User switched account
        setAddress(accounts[0])
        await checkTokenBalance(accounts[0])
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
    }
  }, [address, disconnectWallet, checkTokenBalance])

  const value = {
    address,
    provider,
    signer,
    loreBalance,
    hasLoreTokens,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    checkTokenBalance,
    signMessage,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  return useContext(Web3Context)
}
