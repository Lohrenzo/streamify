"use client";

import { useContext } from "react";
import AppContext from "./state/Context";
import VideoGrid from "./components/VideoGrid";

/**
 * @function Home
 * @description The main home page for the application. It displays a grid of uploaded videos.
 *
 * @returns {JSX.Element} The rendered home page with a video grid.
 */
export default function HomePage() {
  const { state } = useContext(AppContext);

  return (
    <main className="min-h-screen text-gray-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl app-card p-8 text-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-blue-500 bg-clip-text text-transparent">
          Streamify
        </h1>

        {/* VideoGrid component displays all uploaded videos, refreshing when refreshGridKey state changes. */}
        <VideoGrid refreshKey={state.refreshGridKey} />
      </div>
    </main>
  );
}
