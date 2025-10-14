import Link from "next/link";

/**
 * @interface VideoCardProps
 * @description Props for the VideoCard component.
 * @property {string} id - The unique identifier of the video, used for navigation.
 * @property {string} title - The title of the video to be displayed.
 * @property {string} uploadDate - The date when the video was uploaded, displayed in a human-readable format.
 * @property {string} thumbnailUrl - The URL of the video's thumbnail image.
 */
interface VideoCardProps {
  id: string;
  title: string;
  uploadDate: string;
  thumbnailUrl: string;
}

/**
 * @function VideoCard
 * @description A React component that displays a single video as a card in a grid. It shows a thumbnail,
 * title, and upload date, and acts as a link to the video's detail page.
 * @param {VideoCardProps} props - The properties passed to the component.
 * @returns {JSX.Element} A link wrapping a div that displays video information.
 */
export default function VideoCard({
  id,
  title,
  uploadDate,
  thumbnailUrl,
}: VideoCardProps) {
  return (
    <Link href={`/videos/${id}`}>
      <div className="app-card cursor-pointer overflow-hidden group">
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-70 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="text-xs text-gray-400">
              {new Date(uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
