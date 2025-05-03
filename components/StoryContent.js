export default function StoryContent({ story }) {
  // Split content by paragraphs
  const paragraphs = story.content.split("\n").filter((p) => p.trim() !== "")

  return (
    <div className="prose prose-invert prose-violet max-w-none">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-lg leading-relaxed mb-6">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
