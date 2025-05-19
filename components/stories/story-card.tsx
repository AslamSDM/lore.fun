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
    <Link
      href={`/stories/${story.id}`}
      key={story.id}
      className="block no-underline"
    >
      <Card className="hover:border-primary transition-all h-full">
        <CardHeader className="pb-2">
          <CardTitle>{story.title}</CardTitle>
          <CardDescription>{story.subtitle || story.genre}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
              <span className="text-base font-medium mb-1">
                {story.sentences_count || 0}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Sentences
              </span>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
              <span className="text-base font-medium mb-1">
                {story.contributors_count || 0}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Contributors
              </span>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
              <span className="text-base font-medium mb-1">{story.genre}</span>
              <span className="text-xs text-muted-foreground text-center">
                Genre
              </span>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex flex-col items-center">
              <span className="text-base font-medium mb-1">
                {new Date(story.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Created
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
