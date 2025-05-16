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
      className="card hover:border-primary transition-all block"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold">{story.title}</h2>
        <p className="text-gray-400">{story.subtitle || story.genre}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-value"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
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
    </Link>
  );
};
