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
import dynamic from "next/dynamic";

// Dynamically import Spline component to avoid SSR issues
const SplineBackground = dynamic(
  () => import("@/components/3d/spline-background"),
  { ssr: false }
);

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
        className="min-h-screen py-32 md:py-48 relative overflow-hidden"
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={fadeIn()}
      >
        {/* Spline 3D Background */}
        <SplineBackground splineUrl="https://prod.spline.design/kLz0GUSm0Jnn5bbz/scene.splinecode" />

        {/* Content overlay */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeIn(0.2)}
              className="backdrop-blur-md bg-background/30 p-8 rounded-xl shadow-2xl border border-primary/20"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-medieval2 text-primary-foreground">
                Collaborative Storytelling on the Blockchain
              </h1>
              <p className="text-xl text-foreground mb-8">
                Join the first decentralized story production. Submit
                storylines, vote on the best content, and join the creators of
                the story.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="bg-primary hover:bg-primary/80 shadow-lg"
                >
                  <Link href={`/stories/${featuredStory.id}`}>
                    Read Current Story
                  </Link>
                </Button>
                {!connected && (
                  <Button
                    onClick={connect}
                    variant="secondary"
                    size="lg"
                    className="shadow-lg"
                  >
                    Connect Wallet <FaLink className="ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="backdrop-blur-md bg-card/40 text-card-foreground shadow-xl border-primary/30 border">
                <CardHeader className="backdrop-blur-md bg-card/50 rounded-t-lg border-b border-primary/20">
                  <CardTitle className="text-2xl font-bold text-primary-foreground">
                    Featured Story - {featuredStory.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <p className="text-foreground/90">
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
        className="py-24 relative mt-24"
        initial="initial"
        animate={howItWorksInView ? "animate" : "initial"}
        variants={fadeIn()}
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn(0.2)}
            className="backdrop-blur-md bg-background/30 p-8 rounded-xl border border-primary/20 mb-12"
          >
            <motion.h2
              variants={fadeIn(0.2)}
              className="text-4xl font-bold text-center mb-4 font-medieval text-primary"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeIn(0.4)}
              className="text-xl text-foreground text-center"
            >
              Our decentralized platform allows token holders to shape the
              future of storytelling
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants}>
              <Card className="backdrop-blur-md bg-card/40 text-card-foreground shadow-lg border-primary/20 border h-full">
                <CardHeader className="pb-2">
                  <FaLink className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-xl font-bold text-foreground">
                    1. Connect Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">
                    Hold $LORE tokens to participate in the storytelling process
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.1 }}>
              <Card className="backdrop-blur-md bg-card/40 text-card-foreground shadow-lg border-primary/20 border h-full">
                <CardHeader className="pb-2">
                  <FaScroll className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-xl font-bold text-foreground">
                    2. Submit Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">
                    Propose the next sentence in the $LORE story storyline
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.2 }}>
              <Card className="backdrop-blur-md bg-card/40 text-card-foreground shadow-lg border-primary/20 border h-full">
                <CardHeader className="pb-2">
                  <FaVoteYea className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-xl font-bold text-foreground">
                    3. Vote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">
                    Cast your vote for the best continuation of the story
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} transition={{ delay: 0.3 }}>
              <Card className="backdrop-blur-md bg-card/40 text-card-foreground shadow-lg border-primary/20 border h-full">
                <CardHeader className="pb-2">
                  <FaCoins className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-xl font-bold text-foreground">
                    4. Earn Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">
                    Get rewarded when your submissions are selected by the
                    community
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Ecosystem Section */}
      <motion.section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="backdrop-blur-md bg-background/30 p-8 rounded-xl border border-primary/20 mb-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4 font-medieval text-primary">
              Lore Ecosystem
            </h2>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              Discover how our collaborative storytelling platform is creating a
              new paradigm for creative content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="backdrop-blur-md bg-card/30 p-6 rounded-lg border border-primary/20 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <FaScroll className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Story NFTs</h3>
              <p className="text-foreground/90">
                Each completed story becomes an NFT with royalties distributed
                to all contributors based on their participation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="backdrop-blur-md bg-card/30 p-6 rounded-lg border border-primary/20 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <FaVoteYea className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">DAO Governance</h3>
              <p className="text-foreground/90">
                $LORE holders vote on platform features, story themes, and
                treasury funds allocation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="backdrop-blur-md bg-card/30 p-6 rounded-lg border border-primary/20 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <FaCoins className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Token Economy</h3>
              <p className="text-foreground/90">
                Earn $LORE tokens through active participation, story
                contributions, and voting in the ecosystem
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Token Utility & Staking Section */}
      <motion.section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="backdrop-blur-md bg-background/30 p-8 rounded-xl border border-primary/20 mb-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 font-medieval text-primary">
                $LORE Token Utility
              </h2>
              <p className="text-xl text-foreground max-w-3xl mx-auto">
                Hold $LORE tokens to participate in our ecosystem and earn rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="backdrop-blur-sm bg-background/20 p-8 rounded-lg border border-primary/20 h-full">
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Token Requirements
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaVoteYea className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">Vote on Stories</span>
                      <span className="text-foreground/90">
                        Hold at least <span className="text-primary font-bold">10 $LORE</span> to vote on story 
                        continuations and help shape the narrative direction
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaScroll className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">Submit Content</span>
                      <span className="text-foreground/90">
                        Hold at least <span className="text-primary font-bold">25 $LORE</span> to submit your own 
                        story continuations to ongoing narratives
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaUsers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">Create New Stories</span>
                      <span className="text-foreground/90">
                        Hold at least <span className="text-primary font-bold">100 $LORE</span> to create entirely 
                        new story worlds and themes for the community
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="backdrop-blur-sm bg-background/20 p-8 rounded-lg border border-primary/20 h-full">
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Staking & Rewards
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaCoins className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">Token Staking</span>
                      <span className="text-foreground/90">
                        Stake your $LORE tokens to earn passive rewards from platform fees 
                        and increase your voting power in governance decisions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaScroll className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">Winning Submissions</span>
                      <span className="text-foreground/90">
                        When your story contribution wins a voting round, you'll earn 
                        <span className="text-primary font-bold"> 50 $LORE</span> plus a percentage of future 
                        royalties from the completed story
                      </span>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-lg bg-primary/10 p-4 rounded-lg border border-primary/30 mt-6">
                    <h4 className="font-bold text-lg mb-2 text-foreground">Coming Soon:</h4>
                    <p className="text-foreground/90">
                      Enhanced staking rewards with tiered benefits, royalty sharing for story NFTs,
                      and exclusive access to premium features based on staking duration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Join the Community Section */}
      <motion.section
        className="py-24 relative mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="backdrop-blur-xl bg-primary/10 p-12 rounded-xl border border-primary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold mb-6 font-medieval text-primary">
                  Join Our Community
                </h2>
                <p className="text-xl text-foreground mb-8">
                  Be part of the future of decentralized storytelling. Connect your
                  wallet today to start earning and contributing to the next
                  great story.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Button
                    onClick={connect}
                    variant="default"
                    size="lg"
                    className="bg-primary hover:bg-primary/80 shadow-lg text-lg"
                  >
                    Connect Wallet <FaLink className="ml-2" />
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="shadow-lg text-lg"
                  >
                    <Link href="/docs">Read Documentation</Link>
                  </Button>
                </div>
              </div>
              
              <div className="backdrop-blur-lg bg-background/30 p-6 rounded-lg border border-primary/20">
                <h3 className="text-2xl font-bold mb-4 text-primary text-center">Get Started in 3 Steps</h3>
                <ol className="space-y-5">
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      1
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">Connect your wallet</span>
                      <span className="text-foreground/90">
                        Link your Solana wallet to access the full platform features
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">Get $LORE tokens</span>
                      <span className="text-foreground/90">
                        Acquire tokens through our partners or by participating in the platform
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      3
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">Start earning rewards</span>
                      <span className="text-foreground/90">
                        Submit stories, vote on content, and earn rewards for quality contributions
                      </span>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
