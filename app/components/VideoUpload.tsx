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
    <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-white/5 rounded-lg border border-white/10 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-purple-300">
        Upload New Video
      </h2>
      <div className="flex flex-col items-center space-y-4">
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
          className={`px-6 py-2 rounded-lg font-semibold transition-all w-full ${
            isUploading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-blue-600 hover:opacity-90"
          }
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
