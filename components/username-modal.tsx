"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "../hooks/use-wallet"

interface UsernameModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setUsername: saveUsername } = useWallet()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    setIsSubmitting(true)
    setError("")

    const { success, error } = await saveUsername(username)

    if (!success && error) {
      setError(error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Lore.Fun!</h2>
        <p className="text-gray-300 mb-6">Please choose a username to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Choose a unique username"
              disabled={isSubmitting}
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary w-full ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Saving..." : "Save Username"}
          </button>
        </form>
      </div>
    </div>
  )
}
