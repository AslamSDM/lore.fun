"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "../hooks/use-wallet"
import { useRouter } from "next/router"
import type { Story, UserStats } from "../lib/types"

export default function ProfilePage() {
  const { user, loading } = useWallet()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch user stats
        const statsRes = await fetch(`/api/users/${user.id}/stats`)
        const statsData = await statsRes.json()

        // Fetch user stories
        const storiesRes = await fetch(`/api/users/${user.id}/stories`)
        const storiesData = await storiesRes.json()

        setStats(statsData)
        setStories(storiesData)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold">
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{user.username || "Anonymous"}</h2>
                <p className="text-gray-400 text-sm truncate w-48">{user.wallet_address}</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-gray-400 text-sm">Member since</p>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Activity Stats</h2>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stories Created</span>
                  <span className="font-medium">{stats.stories_created_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submissions</span>
                  <span className="font-medium">{stats.submissions_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winning Submissions</span>
                  <span className="font-medium">{stats.winning_submissions_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Votes Cast</span>
                  <span className="font-medium">{stats.votes_cast_count}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Failed to load stats</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Stories</h2>
              <Link href="/create">
                <button className="btn-primary">Create New Story</button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              </div>
            ) : stories.length > 0 ? (
              <div className="space-y-4">
                {stories.map((story) => (
                  <Link href={`/stories/${story.id}`} key={story.id}>
                    <div className="border border-gray-700 rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                      <h3 className="text-lg font-medium mb-1">{story.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{story.subtitle || story.genre}</p>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Sentences</p>
                          <p>{story.sentences_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Contributors</p>
                          <p>{story.contributors_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Created</p>
                          <p>{new Date(story.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">You haven't created any stories yet.</p>
                <Link href="/create">
                  <button className="btn-primary">Create Your First Story</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
