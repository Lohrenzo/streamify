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
      <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
        <h3 className="text-lg font-semibold text-purple-300">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">
          Uploaded: {new Date(uploadDate).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
