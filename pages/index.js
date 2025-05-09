"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useWeb3 } from "../context/Web3Context";
import FeaturedStory from "../components/FeaturedStory";
import StoryCard from "../components/StoryCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export default function Home({ supabaseClient }) {
  const [featuredStory, setFeaturedStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address } = useWeb3();

  useEffect(() => {
    async function fetchStories() {
      try {
        // Fetch featured story (Bitcoin movie story)
        const { data: featuredData, error: featuredError } =
          await supabaseClient
            .from("stories")
            .select("*")
            .eq("is_featured", true)
            .single();

        if (featuredError && featuredError.code !== "PGRST116") {
          console.error("Error fetching featured story:", featuredError);
        } else {
          setFeaturedStory(featuredData);
        }

        // Fetch all stories
        const { data, error } = await supabaseClient
          .from("stories")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching stories:", error);
        } else {
          setStories(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, [supabaseClient]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Lore.fun | Collaborative Storytelling</title>
        <meta
          name="description"
          content="Collaborative storytelling platform powered by $LORE tokens"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-violet-400 font-medieval">
              LORE.FUN
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Join the first decentralized movie production. Submit storylines,
              vote on the best content, and bring stories to life.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-pulse w-full max-w-4xl h-64 bg-gray-800 rounded-lg"></div>
            </div>
          ) : featuredStory ? (
            <FeaturedStory story={featuredStory} />
          ) : (
            <div className="text-center p-8 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-medieval text-violet-400 mb-4">
                Featured Story Coming Soon
              </h3>
              <p className="text-gray-300">
                Our first Bitcoin movie story is in the works!
              </p>
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-violet-400 font-medieval">
              ONGOING SAGAS
            </h2>
            {address && (
              <Link href="/create-story">
                <div className="px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
                  CREATE NEW STORY
                </div>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse h-64 bg-gray-800 rounded-lg"
                ></div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-medieval text-violet-400 mb-4">
                No Stories Yet
              </h3>
              <p className="text-gray-300">
                Connect your wallet and create the first story!
              </p>
            </div>
          )}
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl font-medieval">
                How It Works
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our decentralized platform allows token holders to shape the
                future of storytelling
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-medieval text-sm">
                    1. Connect Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Hold $MOV tokens to participate in the storytelling process
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-medieval text-sm">
                    2. Submit Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Propose the next sentence in the Bitcoin movie storyline
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-medieval text-sm">
                    3. Vote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cast your vote for the best continuation of the story</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-medieval text-sm">
                    4. Earn Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Get rewarded when your submissions are selected by the
                    community
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
