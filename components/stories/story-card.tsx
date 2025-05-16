import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import type { Story } from "@/lib/types";

interface StoryCardProps {
  story: Story;
  index?: number;
}

export const StoryCard = ({ story, index = 0 }: StoryCardProps) => {
  // Calculate progress percentage based on sentences count and min_sentences
  const progress = Math.min(
    Math.round(
      ((story.sentences_count || 0) / (story.min_sentences || 100)) * 100
    ),
    100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px -15px rgba(124, 58, 237, 0.4)",
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Link href={`/stories/${story.id}`} className="block h-full">
        <Card className="h-full transition duration-300 hover:border-primary cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{story.title}</CardTitle>
                <CardDescription>
                  {story.subtitle || story.genre}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {story.genre}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>

          <CardFooter>
            <div className="grid grid-cols-2 gap-4 text-sm w-full">
              <div>
                <p className="text-gray-400">Sentences</p>
                <p className="font-medium">{story.sentences_count || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Contributors</p>
                <p className="font-medium">{story.contributors_count || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Genre</p>
                <p className="font-medium">{story.genre}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="font-medium">
                  {new Date(story.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
