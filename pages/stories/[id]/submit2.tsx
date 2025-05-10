"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useWallet } from "../../../hooks/use-wallet"
import type { Story, StorySentence } from "../../../lib/types"

interface StoryData {
  story: Story
  sentences: StorySentence[]
  current_round: {
    position: number
    submissions: any[]
    total_votes: number
  }
}

export default function SubmitPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: walletLoading } = useWallet()
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [submission, setSubmission] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const res = await fetch(`/api/stories/${id}`)
        
        if (!res.ok) {
          throw new Error('Failed to fetch story')
        }
        
        const data = await res.json()
        setStoryData(data)
      } catch (err) {
        console.error('Error fetching story:', err)
        setError('Failed to load story. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchStory()          
  }, [id])  

  return (
    <div>SubmitPage</div>   
    
  )