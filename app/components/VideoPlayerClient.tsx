"use client";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

interface VideoMetadata {
  id: string;
  title: string;
  manifestUrl: string;
  uploadDate: Date;
  thumbnailUrl: string;
}

interface VideoPlayerClientProps {
  video: VideoMetadata;
}

/**
 * @function VideoPlayerClient
 * @description A client component to handle video playback using HLS.js.
 * Separated from the server component `VideoDetailsPage` for client-side interactivity.
 * @param {VideoPlayerClientProps} { video } - Props containing the video metadata.
 * @returns {JSX.Element} The video player UI.
 */
export default function VideoPlayerClient({ video }: VideoPlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if video manifest URL exists, HLS is supported, and videoRef is ready.
    if (video?.manifestUrl && Hls.isSupported() && videoRef.current) {
      const hls = new Hls(); // Create a new Hls.js instance.
      hls.loadSource(video.manifestUrl); // Load the HLS manifest.
      hls.attachMedia(videoRef.current); // Attach HLS to the video element.
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play(); // Auto-play video once manifest is parsed.
      });

      // Cleanup function to destroy Hls.js instance when component unmounts or dependencies change.
      return () => {
        hls.destroy();
      };
    } else if (
      // Fallback for browsers that natively support HLS (e.g., Safari).
      videoRef.current &&
      videoRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // For Safari, directly set the video source.
      videoRef.current.src = video?.manifestUrl || "";
    }
  }, [video]); // Re-run this effect when `video` metadata changes.

  if (error) {
    return <p className="text-center text-red-400 mt-8">Error: {error}</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          {video.title} {/* Display video title */}
        </h1>
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
          ></video>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Uploaded: {new Date(video.uploadDate).toLocaleString()}{" "}
          {/* Display formatted upload date */}
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home {/* Link to navigate back to the home page */}
        </a>

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
