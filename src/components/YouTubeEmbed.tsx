/**
 * Responsive YouTube embed used in MDX pages.
 * Accepts a video `id` and optional `title` for the iframe's accessible label.
 */

export function YouTubeEmbed({
  id,
  title = "YouTube video",
}: {
  id: string;
  title?: string;
}) {
  return (
    <div className="akg-video not-prose">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default YouTubeEmbed;
