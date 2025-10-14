"use client";

import { useState } from "react";
import VideoGrid from "./components/VideoGrid";
import VideoUpload from "./components/VideoUpload";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

/**
 * @function Home
 * @description The main home page component for the streaming application. It displays a video upload
 * component and a grid of uploaded videos. It manages the state for refreshing the video grid
 * after a successful upload.
 * @returns {JSX.Element} The rendered home page.
 */
export default function Home() {
  // State variable to trigger a refresh of the VideoGrid component.
  // Incrementing this key will cause the VideoGrid's useEffect to re-run.
  const [refreshGridKey, setRefreshGridKey] = useState(0);
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
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-gray-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          🎥 Streamify Studio
        </h1>

        {status === "authenticated" ? (
          <div className="mb-8">
            <p className="text-gray-300 mb-2">
              Welcome,{" "}
              {session.user?.username ||
                session.user?.name ||
                session.user?.email}
              !
            </p>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-gray-300 mb-2">
              Please sign in to upload videos and manage your content.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            {/* <button
              onClick={() => signIn("google")}
              className="px-4 py-2 mr-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => signIn("credentials-signin")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Sign In with Email
            </button> */}
          </div>
        )}

        {status === "authenticated" && (
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
        )}
        {/* VideoGrid component displays all uploaded videos, refreshing when refreshGridKey changes. */}
        <VideoGrid refreshKey={refreshGridKey} />

        <footer className="text-sm text-gray-500 mt-10">
          Powered by{" "}
          <span className="text-purple-400 font-medium">Next.js</span>,{" "}
          <span className="text-blue-400 font-medium">TypeScript</span> &{" "}
          <span className="text-pink-400 font-medium">TailwindCSS</span>
        </footer>
      </div>
    </main>
  );
}
