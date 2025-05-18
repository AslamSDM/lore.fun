"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FaUsers, FaScroll, FaVoteYea, FaCoins, FaLink } from "react-icons/fa";

const fadeIn = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
};

export default function Home() {
  const { connect, connected } = useWallet();
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(false);
  const [howItWorksInView, setHowItWorksInView] = useState(false);

  const featuredStory = {
    title: "The Great Adventure",
    author: "Mystic Wizard",
    description: "A thrilling journey through the enchanted forest.",
    id: "story-1",
  };

  useEffect(() => {
    const observerHero = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    const observerHowItWorks = new IntersectionObserver(
      ([entry]) => {
        setHowItWorksInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) {
      observerHero.observe(heroRef.current);
    }

    if (howItWorksRef.current) {
      observerHowItWorks.observe(howItWorksRef.current);
    }

    return () => {
      if (heroRef.current) {
        observerHero.unobserve(heroRef.current);
      }
      if (howItWorksRef.current) {
        observerHowItWorks.unobserve(howItWorksRef.current);
      }
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="py-16 md:py-24"
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={fadeIn()}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn(0.2)}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-medieval2 text-primary-foreground">
                Collaborative Storytelling on the Blockchain
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join the first decentralized story production. Submit
                storylines, vote on the best content, and join the creators of
                the story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="primary">
                  <Link href={`/stories/${featuredStory.id}`}>
                    Read Current Story
                  </Link>
                </Button>
                {!connected && (
                  <Button onClick={connect} variant="secondary">
                    Connect Wallet <FaLink className="ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Featured Story - {featuredStory.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    {featuredStory.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Image
                            src="/logo.svg"
                            width={20}
                            height={20}
                            alt="Story icon"
                          />
                          <span className="ml-2 text-sm">
                            Story Progress: 15%
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          12 sentences
                        </span>
                      </div>
                      <Progress value={15} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUsers className="w-5 h-5 text-muted-foreground" />
                        <span className="ml-2 text-sm">
                          Active Contributors
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">237</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaScroll className="w-5 h-5 text-muted-foreground" />
                        <span className="ml-2 text-sm">
                          Current Voting Round
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Ends in 2 days
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCoins className="w-5 h-5 text-muted-foreground" />
                        <span className="ml-2 text-sm">$LORE Token Price</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        0.0015 SOL
                      </span>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/submit">Submit Next Sentence</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        ref={howItWorksRef}
        className="py-16 bg-secondary"
        initial="initial"
        animate={howItWorksInView ? "animate" : "initial"}
        variants={fadeIn()}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            variants={fadeIn(0.2)}
            className="text-4xl font-bold text-center mb-4 font-medieval text-secondary-foreground"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeIn(0.4)}
            className="text-xl text-muted-foreground text-center mb-12"
          >
            Our decentralized platform allows token holders to shape the future
            of storytelling
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants}>
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    1. Connect Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hold $LORE tokens to participate in the storytelling process
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.1 }}>
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    2. Submit Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Propose the next sentence in the $LORE story storyline
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.2 }}>
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">3. Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cast your vote for the best continuation of the story
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.3 }}>
              <Card className="bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    4. Earn Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get rewarded when your submissions are selected by the
                    community
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
