import Link from "next/link";
import Image from "next/image";

export default function StoryCard({ story }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-violet-500 transition-colors duration-300">
      <div className="relative h-48">
        {story.image_url ? (
          <Image
            src={story.image_url || "/placeholder.svg"}
            alt={story.title}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-gray-800 flex items-center justify-center">
            <span className="text-2xl font-medieval text-violet-300">
              LORE.FUN
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-violet-400 mb-2 font-medieval line-clamp-1">
          {story.title}
        </h3>

        <p className="text-gray-300 mb-4 text-sm line-clamp-2">
          {story.description}
        </p>

        <div className="flex justify-between items-center text-sm mb-4">
          <div className="text-gray-400">
            <span className="text-violet-300">
              {story.contributor_count || 0}
            </span>{" "}
            contributors
          </div>
          <div className="text-gray-400">
            {new Date(story.created_at).toLocaleDateString()}
          </div>
        </div>

        <Link href={`/story/${story.id}`}>
          <div className="block w-full text-center px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
            VIEW STORY
          </div>
        </Link>
      </div>
    </div>
  );
}
