"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

/**
 * @interface VideoUploadProps
 * @description Props for the VideoUpload component.
 * @property {() => void} onUploadSuccess - Callback function to be executed after a successful video upload.
 */
interface VideoUploadProps {
  onUploadSuccess: () => void;
}

/**
 * @function VideoUpload
 * @description A React component that provides a user interface for uploading video files.
 * It handles file selection, displays upload progress, and communicates with the backend
 * `/api/upload` endpoint. After a successful upload, it triggers a callback.
 * @param {VideoUploadProps} { onUploadSuccess } - Destructured props, including the `onUploadSuccess` callback.
 * @returns {JSX.Element} The upload form with progress and status messages.
 */
export default function VideoUpload({ onUploadSuccess }: VideoUploadProps) {
  // State to track if a video is currently being uploaded.
  const [isUploading, setIsUploading] = useState(false);
  // State to store the current upload progress percentage.
  const [uploadProgress, setUploadProgress] = useState(0);
  // State to store messages to be displayed to the user (e.g., "Uploading...", "Upload successful!").
  const [message, setMessage] = useState<string | null>(null);
  // State to store the user-provided video title.
  const [videoTitle, setVideoTitle] = useState<string>("");
  // Ref to directly access the file input element.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Get the current session status to determine if the user is authenticated.
  const { status } = useSession();

  /**
   * @async
   * @function handleUpload
   * @description Handles the video upload process when the upload button is clicked.
   * Validates file selection, sets upload states, sends the file to the API,
   * tracks progress, and handles success or failure.
   */
  const handleUpload = async () => {
    // Get the selected file from the file input.
    const file = fileInputRef.current?.files?.[0];
    // If no file is selected, display a message and stop.
    if (!file) {
      setMessage("Please choose a video file");
      return;
    }

    // If no video title is provided, display a message and stop.
    if (!videoTitle.trim()) {
      setMessage("Please enter a video title.");
      return;
    }

    // Ensure user is authenticated before proceeding with upload.
    if (status !== "authenticated") {
      setMessage("You must be logged in to upload videos.");
      return;
    }

    // Set uploading state and initial messages.
    setIsUploading(true);
    setMessage("Uploading...");
    setUploadProgress(0);

    // Create FormData to send the file as multipart/form-data.
    const formData = new FormData();
    formData.append("video", file); // Append the video file with the name "video".
    formData.append("title", videoTitle); // Append the user-provided video title.

    try {
      // Make a POST request to the upload API endpoint.
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Specify content type.
        // Configuration for tracking upload progress.
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            // Calculate the percentage of completion.
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted); // Update the progress state.
          }
        },
      });

      setMessage("Upload successful!"); // Display success message.
      // Clear the file input field after successful upload.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadProgress(100); // Set progress to 100% on completion.
      setVideoTitle(""); // Clear the video title input.
      onUploadSuccess(); // Trigger the callback provided by the parent component.
    } catch (err) {
      console.error(err); // Log any errors.
      setMessage("Upload failed."); // Display failure message.
      setUploadProgress(0); // Reset progress on failure.
    } finally {
      setIsUploading(false); // Reset uploading state regardless of success or failure.
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-6 app-card">
      <h2 className="text-2xl font-bold mb-4">Upload New Video</h2>
      <div className="flex flex-col items-center space-y-4">
        {/* Input field for the video title */}
        <input
          type="text"
          placeholder="Enter video title (e.g., My Awesome Stream)"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {/* Label for the file input */}
        <label
          htmlFor="file-upload"
          className="cursor-pointer w-full border border-white/20 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
        >
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            accept="video/*"
            className="hidden"
          />
          {/* Display selected file name or a default message */}
          {fileInputRef.current?.files?.[0]
            ? fileInputRef.current.files[0].name
            : "📁 Click to select a video file"}
        </label>

        <button
          onClick={handleUpload}
          disabled={isUploading || status !== "authenticated"} // Disable button during upload or if not authenticated
          className={`app-button w-full px-6 py-2 ${
            isUploading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {/* Button text changes based on uploading state */}
          {isUploading
            ? `Uploading... ${uploadProgress}%`
            : status !== "authenticated"
            ? "Sign In to Upload"
            : "Upload & Stream"}
        </button>
      </div>
      {/* Display upload status message */}
      {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
    </div>
  );
}
