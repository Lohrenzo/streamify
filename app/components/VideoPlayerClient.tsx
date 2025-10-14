"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * @interface VideoMetadata
 * @description Defines the structure for video metadata passed to the client component.
 * @property {string} id - Unique identifier for the video.
 * @property {string} title - Display title of the video.
 * @property {string} manifestUrl - URL to the HLS manifest for streaming.
 * @property {Date} uploadDate - The date when the video was uploaded.
 * @property {string} thumbnailUrl - URL to the video's thumbnail image.
 * @property {User} user - The user who uploaded the video.
 */
interface VideoMetadata {
  id: string;
  title: string;
  manifestUrl: string;
  uploadDate: Date;
  thumbnailUrl: string;
  userId: string;
}

/**
 * @interface VideoPlayerClientProps
 * @description Props for the VideoPlayerClient component.
 * @property {VideoMetadata} video - The video metadata object to be displayed and played.
 */
interface VideoPlayerClientProps {
  video: VideoMetadata;
}

/**
 * @function VideoPlayerClient
 * @description A client-side React component responsible for rendering the video player
 * and managing HLS.js for streaming. It receives video metadata as props from a server component.
 * @param {VideoPlayerClientProps} { video } - Destructured props, containing the video metadata.
 * @returns {JSX.Element} The video player UI, including video element, title, and upload date.
 */
export default function VideoPlayerClient({ video }: VideoPlayerClientProps) {
  // Ref to directly access the HTML <video> element.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // State to store any error messages that occur during HLS playback.
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();

  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeBusy, setLikeBusy] = useState<boolean>(false);

  interface UIComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string | null;
      first_name: string | null;
      last_name: string | null;
      image: string | null;
    };
  }
  const [comments, setComments] = useState<UIComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [commentBusy, setCommentBusy] = useState<boolean>(false);
  const [videoUser, setVideoUser] = useState<User | null>(null);

  // Effect hook to initialize and manage HLS.js for video playback.
  useEffect(() => {
    // Check if video manifest URL exists, HLS is supported by the browser, and the video element ref is available.
    if (video?.manifestUrl && Hls.isSupported() && videoRef.current) {
      const hls = new Hls(); // Create a new Hls.js instance.
      hls.loadSource(video.manifestUrl); // Load the HLS manifest URL.
      hls.attachMedia(videoRef.current); // Attach the HLS instance to the video element.
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play(); // Auto-play the video once the manifest is successfully parsed.
      });

      // Cleanup function: Destroy the Hls.js instance when the component unmounts or `video` changes.
      return () => {
        hls.destroy();
      };
    } else if (
      // Fallback for browsers that natively support HLS (e.g., Safari on iOS/macOS).
      videoRef.current &&
      videoRef.current.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // For native HLS support, directly set the video source.
      videoRef.current.src = video?.manifestUrl || "";
      videoRef.current?.play(); // Attempt to auto-play.
    }

    // If HLS is not supported and native playback is not possible, set an error message.
    if (
      !Hls.isSupported() &&
      !videoRef.current?.canPlayType("application/vnd.apple.mpegurl")
    ) {
      setError("Your browser does not support HLS playback.");
    }
  }, [video]); // Re-run this effect whenever the `video` prop changes.

  // Effect hook to fetch the like count and liked status for the video.
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/videos/${video.id}/likes`, {
          method: "GET",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setLikeCount(data.count ?? 0);
          setLiked(!!data.liked);
        }
      } catch {}
    };
    run();
  }, [video.id, status]);

  // Effect hook to fetch the comments for the video.
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/videos/${video.id}/comments`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch {}
    };
    run();
  }, [video.id]);

  // Effect hook to fetch the video's user details.
  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/users/${video.userId}`);
      if (res.ok) {
        const data = await res.json();
        setVideoUser(data);
        console.log("Video User", videoUser?.username);
      }
    };
    run();
  }, [video.userId]);

  // Function to toggle the like status for the video.
  const likeUnlikeVideo = async () => {
    if (status !== "authenticated" || likeBusy) return;
    setLikeBusy(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/likes`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("like_failed");
      const data = await res.json();
      setLiked(!!data.liked); // Update the liked state to the new value from the server.
      setLikeCount(data.count ?? likeCount); // Update the like count to the new value from the server.
    } catch {
      setLiked(!liked);
      setLikeCount((c) => c - (liked ? 1 : -1));
    } finally {
      setLikeBusy(false);
    }
  };

  const handleSendComment = async () => {
    if (status !== "authenticated" || commentBusy) return;
    const content = newComment.trim();
    if (!content) return;
    setCommentBusy(true);
    try {
      const res = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("comment_failed");
      const created = await res.json();
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch {
      // optional: show toast
    } finally {
      setCommentBusy(false);
    }
  };

  // Display an error message if any playback error occurred.
  if (error) {
    return <p className="text-center text-red-400 mt-8">Error: {error}</p>;
  }

  return (
    <main className="min-h-screen text-gray-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl app-card p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {video.title} {/* Display video title */}
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            {videoUser ? videoUser?.username : "new user"}
          </p>
        </div>
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
          ></video>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          {/* Uploaded: {new Date(video.uploadDate).toLocaleString()}{" "} */}
          {/* Display formatted upload date */}
        </p>
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={likeUnlikeVideo}
            disabled={status !== "authenticated" || likeBusy}
            className={`inline-flex items-center gap-2 px-4 py-2 app-button ${
              status !== "authenticated" ? "opacity-60 cursor-not-allowed" : ""
            }`}
            aria-pressed={liked}
          >
            {liked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}{" "}
            · {likeCount}
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 app-button"
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
          </Link>
        </div>

        <div className="text-left">
          <h2 className="text-lg font-semibold mb-3">Comments</h2>
          {status === "authenticated" ? (
            <div className="mb-4 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 rounded-md bg-white/5 border border-white/20 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendComment}
                disabled={commentBusy || newComment.trim().length === 0}
                className="app-button px-4 py-2"
              >
                Post
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">
              Sign in to like and comment.
            </p>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-200">
                      {c.user.username ||
                        [c.user.first_name, c.user.last_name]
                          .filter(Boolean)
                          .join(" ") ||
                        "User"}
                    </span>
                    <span className="ml-2 text-xs">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-200">{c.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
