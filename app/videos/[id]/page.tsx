import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import VideoPlayerClient from "@/app/components/VideoPlayerClient";

/**
 * @interface VideoDetailsPageProps
 * @description Props for the VideoDetailsPage component.
 * @property {object} params - An object containing the route parameters.
 * @property {string} params.id - The unique identifier of the video to be displayed.
 */
interface VideoDetailsPageProps {
  params: { id: string };
}

/**
 * @function VideoDetailsPage
 * @description A dynamic Next.js server page component responsible for fetching details
 * of a single video from the database based on its ID. It then passes these details
 * to a client component (`VideoPlayerClient`) for interactive video playback.
 * If the video is not found, it triggers a 404 response.
 * @param {VideoDetailsPageProps} { params } - Destructured props, containing the route parameters.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered `VideoPlayerClient`
 * with the fetched video data.
 */
export default async function VideoDetailsPage({
  params,
}: VideoDetailsPageProps) {
  // Extract the video ID from the URL parameters.
  const { id } = params;

  // Fetch video details directly from the database using Prisma's `findUnique` method.
  // This ensures that only the requested video's data is retrieved.
  const video = await prisma.video.findUnique({
    where: {
      id: id, // Match the video by its unique ID.
    },
  });

  // If no video record is found in the database for the given ID, trigger Next.js's 404 notFound function.
  if (!video) {
    notFound();
  }

  // Render the `VideoPlayerClient` component, passing the fetched video data to it.
  // The `VideoPlayerClient` is a client component that handles the interactive playback.
  return <VideoPlayerClient video={video} />;
}
