"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useWeb3 } from "../context/Web3Context"

export default function CreateStory({ supabaseClient }) {
  const router = useRouter()
  const { address, hasLoreTokens, signMessage } = useWeb3()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    if (!address) {
      setError("Please connect your wallet to create a story")
      return
    }

    if (!hasLoreTokens) {
      setError("You need to hold $LORE tokens to create a story")
      return
    }

    if (!title || !description || !content) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Sign message to verify wallet ownership
      const message = `Create story: ${title}`
      const signature = await signMessage(message)

      if (!signature) {
        setError("Failed to sign message with wallet")
        setLoading(false)
        return
      }

      // Create story in database
      const { data: storyData, error: storyError } = await supabaseClient
        .from("stories")
        .insert([
          {
            title,
            description,
            content,
            image_url: image || null,
            creator_address: address,
            is_featured: false,
            contributor_count: 1,
          },
        ])
        .select()
        .single()

      if (storyError) {
        console.error("Error creating story:", storyError)
        setError("Failed to create story. Please try again.")
        setLoading(false)
        return
      }

      // Create first round for the story
      const roundEndDate = new Date()
      roundEndDate.setDate(roundEndDate.getDate() + 3) // 3 days from now

      const { error: roundError } = await supabaseClient.from("story_rounds").insert([
        {
          story_id: storyData.id,
          round_number: 1,
          phase: "submission",
          submission_ends_at: roundEndDate.toISOString(),
          voting_ends_at: null,
        },
      ])

      if (roundError) {
        console.error("Error creating round:", roundError)
        setError("Failed to initialize story rounds. Please try again.")
        setLoading(false)
        return
      }

      // Redirect to the new story page
      router.push(`/story/${storyData.id}`)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-medieval text-violet-400 mb-4">Connect Your Wallet</h1>
        <p className="text-gray-300 mb-8">You need to connect your wallet to create a story.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>Create Story | Lore.fun</title>
        <meta name="description" content="Create a new collaborative story on Lore.fun" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-violet-400 font-medieval">CREATE A NEW SAGA</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-medieval text-violet-300 mb-2">
                TITLE
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-white"
                placeholder="Enter a captivating title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-lg font-medieval text-violet-300 mb-2">
                DESCRIPTION
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-white h-24"
                placeholder="Provide a brief description of your story"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-lg font-medieval text-violet-300 mb-2">
                FIRST PARAGRAPH
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-white h-48"
                placeholder="Write the first paragraph of your story"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-lg font-medieval text-violet-300 mb-2">
                COVER IMAGE URL (OPTIONAL)
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {error && <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200">{error}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !hasLoreTokens}
                className="px-8 py-4 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING..." : "CREATE STORY"}
              </button>
            </div>

            {!hasLoreTokens && (
              <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded-md text-yellow-200">
                You need to hold $LORE tokens to create a story.
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
