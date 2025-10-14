import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import VideoPlayerClient from "@/app/components/VideoPlayerClient";

interface VideoDetailsPageProps {
  params: { id: string };
}

/**
 * @interface VideoMetadata
 * @description Defines the structure for video metadata, consistent with what's stored in the database.
 * @property {string} id - Unique identifier for the video.
 * @property {string} title - Display title of the video.
 * @property {string} manifestUrl - URL to the HLS manifest for streaming.
 * @property {Date} uploadDate - The date when the video was uploaded.
 * @property {string} thumbnailUrl - URL to the video's thumbnail image.
 */
/**
 * @function VideoDetailsPage
 * @description A dynamic Next.js page component for displaying and playing a single video.
 * It fetches video details based on the `id` parameter from the URL using Prisma
 * and uses `hls.js` for smooth client-side streaming.
 * @param {VideoDetailsPageProps} { params } - Destructured props, containing the route parameters.
 * @returns {JSX.Element} The rendered video details page with video player, title, and upload date.
 */
export default async function VideoDetailsPage({
  params,
}: VideoDetailsPageProps) {
  const { id } = params;

  // Fetch video details directly from the database using Prisma.
  const video = await prisma.video.findUnique({
    where: {
      id: id,
    },
  });

  // If no video is found, render a 404 page.
  if (!video) {
    notFound();
  }

  return <VideoPlayerClient video={video} />;
}
