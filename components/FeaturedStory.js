import Link from "next/link";
import Image from "next/image";

export default function FeaturedStory({ story }) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
      <div className="relative h-64 md:h-96">
        {story.image_url ? (
          <Image
            src={story.image_url || "/placeholder.svg"}
            alt={story.title}
            layout="fill"
            objectFit="cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900 to-gray-800 flex items-center justify-center">
            <span className="text-4xl font-medieval text-violet-300">
              LORE.FUN
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="inline-block px-3 py-1 bg-violet-700 text-white text-sm font-medieval rounded-md mb-4">
          FEATURED SAGA
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-violet-400 mb-4 font-medieval">
          {story.title}
        </h2>

        <p className="text-gray-300 mb-6 line-clamp-3">{story.description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="bg-gray-700/50 px-3 py-1 rounded-md text-sm">
            <span className="text-gray-400">Created by:</span>{" "}
            <span className="text-violet-300">
              {story.creator_address.substring(0, 6)}...
              {story.creator_address.substring(
                story.creator_address.length - 4
              )}
            </span>
          </div>
          <div className="bg-gray-700/50 px-3 py-1 rounded-md text-sm">
            <span className="text-gray-400">Contributors:</span>{" "}
            <span className="text-violet-300">
              {story.contributor_count || 0}
            </span>
          </div>
        </div>

        <Link href={`/story/${story.id}`}>
          <div className="inline-block px-6 py-3 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300">
            READ & CONTRIBUTE
          </div>
        </Link>
      </div>
    </div>
  );
}
