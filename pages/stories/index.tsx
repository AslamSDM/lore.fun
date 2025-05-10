"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Story } from "../../lib/types";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/stories");

        if (!res.ok) {
          throw new Error("Failed to fetch stories");
        }

        const data = await res.json();
        setStories(data);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Failed to load stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Stories</h1>
        <Link href="/create">
          <button className="btn-primary">Create New Story</button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400">{error}</p>
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link href={`/stories/${story.id}`} key={story.id}>
              <div className="card hover:border-primary transition-all cursor-pointer">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{story.title}</h2>
                  <p className="text-gray-400">
                    {story.subtitle || `A ${story.genre} story`}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.min(
                        Math.round(
                          (story.sentences_count / story.min_sentences) * 100
                        ),
                        100
                      )}
                      %
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-value"
                      style={{
                        width: `${Math.min(
                          Math.round(
                            (story.sentences_count / story.min_sentences) * 100
                          ),
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Sentences</p>
                    <p className="font-medium">{story.sentences_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Contributors</p>
                    <p className="font-medium">{story.contributors_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Genre</p>
                    <p className="font-medium">{story.genre}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created By</p>
                    <p className="font-medium">
                      {story.creator?.username || "Anonymous"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">
            No stories found. Be the first to create one!
          </p>
          <Link href="/create">
            <button className="btn-primary">Create New Story</button>
          </Link>
        </div>
      )}
    </div>
  );
}
