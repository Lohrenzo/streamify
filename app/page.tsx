"use client";

import { useState } from "react";
import VideoGrid from "./components/VideoGrid";
import VideoUpload from "./components/VideoUpload";
import { useSession } from "next-auth/react";

/**
 * @function Home
 * @description The main home page component for the streaming application. It displays a video upload
 * component and a grid of uploaded videos. It manages the state for refreshing the video grid
 * after a successful upload. It also handles user authentication status display and actions.
 * @returns {JSX.Element} The rendered home page with authentication UI, video upload, and video grid.
 */
export default function Home() {
  // State variable to trigger a refresh of the VideoGrid component.
  // Incrementing this key will cause the VideoGrid's useEffect to re-run.
  const [refreshGridKey, setRefreshGridKey] = useState(0);
  // useSession hook to get the current authentication status and user data.
  const { data: session, status } = useSession();

  /**
   * @function handleUploadSuccess
   * @description Callback function passed to the VideoUpload component. When a video is successfully
   * uploaded, this function is called to increment `refreshGridKey`, thereby triggering a refresh
   * of the VideoGrid to display the new video.
   * @returns {void}
   */
  const handleUploadSuccess = () => {
    setRefreshGridKey((prevKey) => prevKey + 1);
  };

  return (
    <main className="min-h-screen text-gray-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl app-card p-8 text-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          🎥 Streamify Studio
        </h1>

        {/* VideoUpload component is only rendered if the user is authenticated */}
        {status === "authenticated" && (
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
        )}
        {/* VideoGrid component displays all uploaded videos, refreshing when refreshGridKey changes. */}
        <VideoGrid refreshKey={refreshGridKey} />
      </div>
    </main>
  );
}
