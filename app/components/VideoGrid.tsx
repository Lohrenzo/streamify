"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import VideoCard from "./VideoCard";

/**
 * @interface VideoMetadata
 * @description Defines the structure for video metadata, fetched from the API.
 * @property {string} id - Unique identifier for the video.
 * @property {string} title - Display title of the video.
 * @property {string} manifestUrl - URL to the HLS manifest for streaming.
 * @property {string} uploadDate - ISO string of the upload date.
 * @property {string} thumbnailUrl - URL to the video's thumbnail image.
 */
interface VideoMetadata {
  id: string;
  title: string;
  manifestUrl: string;
  uploadDate: string;
  thumbnailUrl: string;
  userId: string;
}

/**
 * @interface VideoGridProps
 * @description Props for the VideoGrid component.
 * @property {number} refreshKey - A key that, when changed, triggers a re-fetch of the video list.
 *                                  Used to refresh the grid after a new video upload.
 */
interface VideoGridProps {
  refreshKey: number;
}

/**
 * @function VideoGrid
 * @description A React component that fetches and displays a grid of video cards.
 * It automatically refreshes its content when the `refreshKey` prop changes,
 * typically after a new video has been uploaded.
 * @param {VideoGridProps} props - The properties passed to the component, including `refreshKey`.
 * @returns {JSX.Element} A loading message, error message, no videos message, or the grid of `VideoCard` components.
 */
export default function VideoGrid({ refreshKey }: VideoGridProps) {
  // State to store the list of videos fetched from the API.
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  // State to manage the loading status while fetching videos.
  const [loading, setLoading] = useState(true);
  // State to store any error messages that occur during fetching.
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch videos when the component mounts or when `refreshKey` changes.
  useEffect(() => {
    /**
     * @async
     * @function fetchVideos
     * @description Fetches the list of video metadata from the `/api/videos` endpoint.
     * Handles loading states, errors, and updates the `videos` state.
     */
    const fetchVideos = async () => {
      setLoading(true); // Set loading to true at the start of fetching.
      setError(null); // Clear any previous errors.
      try {
        // Make a GET request to the video listing API.
        const response = await axios.get<VideoMetadata[]>("/api/videos");
        setVideos(response.data); // Update the videos state with the fetched data.
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos"); // Set an error message if fetching fails.
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (success or error).
      }
    };

    fetchVideos(); // Call the fetch function when the effect runs.
  }, [refreshKey]); // Re-run this effect whenever `refreshKey` changes.

  // Display a loading message while videos are being fetched.
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center">
        <div className="animate-spin rounded-full max-h-7 max-w-7 border-b-2 p-2 border-gray-400"></div>
      </div>
    );
  }

  // Display an error message if fetching failed.
  if (error) {
    return <p className="text-red-400">Error: {error}</p>;
  }

  // Display a message if no videos have been uploaded yet.
  if (videos.length === 0) {
    return <p className="text-gray-400 text-sm">No videos uploaded yet.</p>;
  }

  // Render the grid of VideoCard components if videos are available.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          uploadDate={video.uploadDate}
          thumbnailUrl={video.thumbnailUrl}
        />
      ))}
    </div>
  );
}
