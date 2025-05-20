"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FaUsers,
  FaScroll,
  FaVoteYea,
  FaCoins,
  FaLink,
  FaFire,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import { useNotifications } from "@/hooks/use-notifications";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useTokenRequirements } from "@/lib/token-requirements";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FeaturedStory } from "@/lib/types";

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

// Animation variants for container elements
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

// Animation variants for items within containers
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Home() {
  const { connect, connected } = useWallet();
  const { balance } = useTokenBalance();
  const tokenReqs = useTokenRequirements();
  const { notifyWarning, notifyError, notifyInfo } = useNotifications();
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [heroInView, setHeroInView] = useState(false);
  const [howItWorksInView, setHowItWorksInView] = useState(false);
  const [featuredStory, setFeaturedStory] = useState<FeaturedStory>({
    loading: true,
  });

  const [topStories, setTopStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [autoPlayEnabled] = useState(true); // Always enabled, removed toggle
  const [autoRefreshEnabled] = useState(true);

  // Fetch featured story data
  const fetchFeaturedStory = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/stories/featured");
      if (!response.ok) {
        throw new Error("Failed to fetch featured story");
      }
      const data = await response.json();

      // Data freshness check no longer needed
      // Auto-refresh is always enabled

      // The API now returns both featured and topStories
      if (data.featured) {
        setFeaturedStory({
          ...data.featured,
          loading: false,
        });
      } else {
        console.warn("No featured story found in API response");
        // Keep default featured story but mark as not loading
        setFeaturedStory((prevState) => ({
          ...prevState,
          loading: false,
        }));
      }

      if (data.topStories && data.topStories.length > 0) {
        setTopStories(data.topStories);
      } else {
        console.warn("No top stories found in API response");
        // If no stories returned, create a fallback story
        // This prevents the carousel from breaking when empty
        setTopStories([
          {
            id: "fallback-story-1",
            title: "Create The First Story",
            author: "LoreFun Team",
            description:
              "Be the first to create a story on LoreFun and start the decentralized storytelling journey.",
            progress: 0,
            sentencesCount: 0,
            contributorsCount: 0,
            timeRemaining: "N/A",
            loreTokens: "0",
            totalVotes: 0,
          },
        ]);
      }

      if (showLoading) {
        setLoading(false);
      }
      return true;
    } catch (error) {
      console.error("Error fetching featured story:", error);
      setFeaturedStory((prevState) => ({
        ...prevState,
        loading: false,
      }));
      // Provide fallback data in case of error
      setTopStories([
        {
          id: "fallback-story-1",
          title: "Error Loading Stories",
          author: "LoreFun Team",
          description:
            "We encountered an error while loading stories. Please try again later.",
          progress: 0,
          sentencesCount: 0,
          contributorsCount: 0,
          timeRemaining: "N/A",
          loreTokens: "0",
          totalVotes: 0,
        },
      ]);
      if (showLoading) {
        setLoading(false);
      }
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFeaturedStory();
  }, []);

  // Set up an auto-refresh interval
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const refreshInterval = setInterval(() => {
      // Silently refresh data without showing loading state
      fetchFeaturedStory(false);
    }, 60000); // Refresh every 60 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [autoRefreshEnabled]);

  // Auto-play functionality for the carousel with adaptive timing based on screen size
  useEffect(() => {
    if (!api) return; // Wait until API is available

    // Get appropriate delay based on screen size for better UX
    const getAutoPlayDelay = () => {
      if (typeof window === "undefined") return 5000; // Default for SSR
      const width = window.innerWidth;
      if (width < 640) return 7000; // More time on mobile
      if (width < 1024) return 6000; // Medium time on tablets
      return 5000; // Normal time on desktops
    };

    let autoPlayDelay = getAutoPlayDelay();
    let autoPlayInterval: NodeJS.Timeout;

    // Function to start auto-play with current delay
    const startAutoPlay = () => {
      if (autoPlayInterval) clearInterval(autoPlayInterval);

      autoPlayInterval = setInterval(() => {
        api.scrollNext();
      }, autoPlayDelay);
    };

    // Start auto-play initially
    startAutoPlay();

    // Handle window resize to adjust timing
    const handleResize = () => {
      autoPlayDelay = getAutoPlayDelay();
      startAutoPlay(); // Restart with new delay
    };

    // Debounced resize handler to prevent excessive recalculation
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 500);
    };

    window.addEventListener("resize", debouncedResize);

    // Stop the interval when component unmounts
    return () => {
      clearInterval(autoPlayInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [api]); // Only depend on the carousel API

  // Track current slide
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Cleanup
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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
                  <Link href={`/stories`}>Read Current Stories</Link>
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
                {featuredStory.loading ? (
                  <>
                    <CardHeader className="backdrop-blur-md bg-card/50 rounded-t-lg border-b border-primary/20">
                      <CardTitle className="text-2xl font-bold text-primary-foreground">
                        Featured Story - {featuredStory.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <p className="text-foreground/90">
                        {featuredStory.description}
                      </p>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Image
                                src="/logo.svg"
                                width={24}
                                height={24}
                                alt="Story icon"
                                className="opacity-80"
                              />
                              <span className="ml-3 text-base font-medium">
                                Story Progress
                              </span>
                            </div>
                            <span className="text-base font-medium text-primary">
                              {featuredStory.progress}%
                            </span>
                          </div>
                          <Progress
                            value={featuredStory.progress}
                            className="h-2"
                          />
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-muted-foreground">
                              {featuredStory.sentencesCount} sentences completed
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-2 rounded-lg transition-all hover:bg-primary/5">
                              <FaUsers className="w-5 h-5 text-primary mb-2" />
                              <span className="text-lg font-medium">
                                {featuredStory.loading
                                  ? "..."
                                  : featuredStory.contributorsCount}
                              </span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Contributors
                              </span>
                            </div>

                            <div className="flex flex-col items-center border-l border-r border-primary/10 px-2 rounded-lg transition-all hover:bg-primary/5">
                              <FaScroll className="w-5 h-5 text-primary mb-2" />
                              <span className="text-lg font-medium">
                                {featuredStory.loading
                                  ? "..."
                                  : featuredStory.timeRemaining}
                              </span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Until voting ends
                              </span>
                            </div>

                            <div className="flex flex-col items-center p-2 rounded-lg transition-all hover:bg-primary/5">
                              <FaCoins className="w-5 h-5 text-primary mb-2" />
                              <span className="text-lg font-medium">
                                {featuredStory.loading
                                  ? "..."
                                  : featuredStory.loreTokens}
                              </span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                $LORE (SOL)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          if (!connected) {
                            notifyWarning(
                              "Please connect your wallet first",
                              "Wallet Required"
                            );
                            return;
                          }
                          // Check if user has enough tokens to submit
                          if (
                            tokenReqs.checkAction("submit", balance, () => {
                              notifyInfo(
                                `You need at least ${tokenReqs.minTokensToSubmit} LORE tokens to submit a new sentence.`
                              );
                            })
                          ) {
                            window.location.href = `/submit?story=${featuredStory.id}`;
                          }
                        }}
                      >
                        Submit Next Sentence
                      </Button>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12">
                    <h2 className="text-2xl font-bold text-primary font-medieval">
                      {" "}
                      No Featured Story
                    </h2>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Top Stories Carousel - Full Width */}
          </div>
        </div>
      </motion.section>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={fadeIn(0.4)}
          className="mt-12 w-full backdrop-blur-md bg-background/30 rounded-xl border border-primary/20"
        >
          <motion.div
            className="flex items-center justify-center mb-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="flex items-center">
              <FaFire className="h-6 w-6 text-primary mr-2" />
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-primary font-medieval">
                  Featured Stories
                </h2>
              </div>
            </motion.div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              {/* Skeleton loader with animation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-64 rounded-lg bg-primary/5 overflow-hidden relative"
                    initial={{ opacity: 0.5 }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      transition: {
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      },
                    }}
                  >
                    <div className="h-2 bg-primary/10 w-full mb-4" />
                    <div className="space-y-2 p-4">
                      <div className="h-5 bg-primary/10 rounded w-3/4" />
                      <div className="h-4 bg-primary/10 rounded w-full" />
                      <div className="h-4 bg-primary/10 rounded w-5/6" />
                      <div className="h-4 bg-primary/10 rounded w-2/3 mt-4" />

                      <div className="flex justify-between mt-6 pt-2 border-t border-primary/5">
                        <div className="h-3 bg-primary/10 rounded w-1/4" />
                        <div className="h-3 bg-primary/10 rounded w-1/5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : topStories.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center p-8 border border-dashed border-primary/20 rounded-lg"
            >
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  className="w-16 h-16 text-primary/20 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-lg text-muted-foreground mb-2">
                  No stories found.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Be the first to create a story on the blockchain!
                </p>
                <Button variant="default" size="lg" className="mt-2" asChild>
                  <Link href="/create">Create Your Story</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className=" p-4"
            >
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  containScroll: "trimSnaps",
                  dragFree: true, // Allows smoother scrolling
                  watchDrag: false, // Better for automatic scrolling
                }}
                setApi={setApi}
                className="w-full m-2"
              >
                <CarouselContent className="-ml-2 -mr-2">
                  {topStories.map((story, index) => (
                    <CarouselItem
                      key={story.id}
                      className="pl-2 pr-2 xs:basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{
                          scale: 1.03,
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="h-full relative group cursor-pointer"
                        role="article"
                        aria-label={`Story: ${story.title} by ${story.author}`}
                      >
                        {/* Touch hint overlay */}
                        <motion.div
                          className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none z-0 hidden sm:block"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />

                        <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all h-full bg-card/80 backdrop-blur-sm shadow-md group-hover:shadow-xl">
                          {/* Progress bar with genre badge */}
                          <div className="relative">
                            <motion.div
                              className="h-2 w-full bg-primary/10"
                              layout
                            >
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${story.progress}%` }}
                                transition={{
                                  duration: 1,
                                  delay: index * 0.2,
                                }}
                              />
                            </motion.div>
                            {story.genre && (
                              <div className="absolute top-3 right-3 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-primary-foreground">
                                {story.genre}
                              </div>
                            )}
                          </div>

                          <CardContent className="p-4">
                            <div className="flex flex-col gap-2 h-full">
                              <Link
                                href={`/stories/${story.id}`}
                                className="group"
                              >
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                                  {story.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                {story.description}
                              </p>

                              <motion.div
                                className="grid grid-cols-2 gap-2 my-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                              >
                                <div
                                  className="flex items-center"
                                  title={`${story.contributorsCount} contributors`}
                                >
                                  <FaUsers className="w-3 h-3 text-primary mr-1" />
                                  <span className="text-xs">
                                    {story.contributorsCount}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center"
                                  title={`${story.sentencesCount} sentences completed`}
                                >
                                  <FaScroll className="w-3 h-3 text-primary mr-1" />
                                  <span className="text-xs">
                                    {story.sentencesCount}
                                  </span>
                                </div>
                              </motion.div>

                              {/* Time remaining indicator */}
                              {story.timeRemaining &&
                                story.timeRemaining !== "No active voting" && (
                                  <div className="flex items-center text-xs text-amber-400 my-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse mr-1"></span>
                                    <span>{story.timeRemaining} remaining</span>
                                  </div>
                                )}

                              <div className="flex justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-primary/5">
                                <span
                                  className="truncate max-w-[60%]"
                                  title={story.author}
                                >
                                  By {story.author}
                                </span>
                                <motion.span
                                  className="font-medium text-primary flex items-center"
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                  {story.totalVotes || 0} votes
                                </motion.span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Mobile swipe hint that appears briefly */}
                <motion.div
                  className="sm:hidden flex items-center justify-center mt-2 text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3,
                    times: [0, 0.2, 0.8, 1],
                    delay: 1,
                    repeat: 1,
                    repeatDelay: 15,
                  }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 16L18 12M18 12L14 8M18 12L6 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Swipe to explore stories
                </motion.div>

                {topStories.length > 4 && (
                  <div className="flex justify-center mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex items-center"
                      asChild
                    >
                      <Link href="/stories">
                        View All Stories
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </Button>
                  </div>
                )}
              </Carousel>
            </motion.div>
          )}
        </motion.div>
      </div>

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
                Hold $LORE tokens to participate in our ecosystem and earn
                rewards
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
                      <span className="font-bold text-lg block text-foreground">
                        Vote on Stories
                      </span>
                      <span className="text-foreground/90">
                        Hold at least{" "}
                        <span className="text-primary font-bold">10 $LORE</span>{" "}
                        to vote on story continuations and help shape the
                        narrative direction
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaScroll className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">
                        Submit Content
                      </span>
                      <span className="text-foreground/90">
                        Hold at least{" "}
                        <span className="text-primary font-bold">25 $LORE</span>{" "}
                        to submit your own story continuations to ongoing
                        narratives
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaUsers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">
                        Create New Stories
                      </span>
                      <span className="text-foreground/90">
                        Hold at least{" "}
                        <span className="text-primary font-bold">
                          100 $LORE
                        </span>{" "}
                        to create entirely new story worlds and themes for the
                        community
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
                      <span className="font-bold text-lg block text-foreground">
                        Token Staking
                      </span>
                      <span className="text-foreground/90">
                        Stake your $LORE tokens to earn passive rewards from
                        platform fees and increase your voting power in
                        governance decisions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="min-w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <FaScroll className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-lg block text-foreground">
                        Winning Submissions
                      </span>
                      <span className="text-foreground/90">
                        When your story contribution wins a voting round, you'll
                        earn
                        <span className="text-primary font-bold">
                          {" "}
                          50 $LORE
                        </span>{" "}
                        plus a percentage of future royalties from the completed
                        story
                      </span>
                    </div>
                  </div>

                  <div className="backdrop-blur-lg bg-primary/10 p-4 rounded-lg border border-primary/30 mt-6">
                    <h4 className="font-bold text-lg mb-2 text-foreground">
                      Coming Soon:
                    </h4>
                    <p className="text-foreground/90">
                      Enhanced staking rewards with tiered benefits, royalty
                      sharing for story NFTs, and exclusive access to premium
                      features based on staking duration.
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
                  Be part of the future of decentralized storytelling. Connect
                  your wallet today to start earning and contributing to the
                  next great story.
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
                <h3 className="text-2xl font-bold mb-4 text-primary text-center">
                  Get Started in 3 Steps
                </h3>
                <ol className="space-y-5">
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      1
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">
                        Connect your wallet
                      </span>
                      <span className="text-foreground/90">
                        Link your Solana wallet to access the full platform
                        features
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">
                        Get $LORE tokens
                      </span>
                      <span className="text-foreground/90">
                        Acquire tokens through our partners or by participating
                        in the platform
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="min-w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4 text-lg font-bold text-primary-foreground">
                      3
                    </div>
                    <div>
                      <span className="font-bold block text-foreground">
                        Start earning rewards
                      </span>
                      <span className="text-foreground/90">
                        Submit stories, vote on content, and earn rewards for
                        quality contributions
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
