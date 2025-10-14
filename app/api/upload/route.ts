import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

// Define the path where video metadata will be stored. This acts as a simple database.
// const VIDEOS_METADATA_PATH = path.join(process.cwd(), "videos.json");

// /**
//  * @interface VideoMetadata
//  * @description Defines the structure for storing information about each uploaded video.
//  * @property {string} id - A unique identifier for the video.
//  * @property {string} title - The title of the video, typically derived from the original file name.
//  * @property {string} manifestUrl - The URL to the HLS manifest file for video streaming.
//  * @property {string} uploadDate - The ISO timestamp of when the video was uploaded.
//  * @property {string} thumbnailUrl - The URL to the generated thumbnail image for the video.
//  */
// interface VideoMetadata {
//     id: string;
//     title: string;
//     manifestUrl: string;
//     uploadDate: string;
//     thumbnailUrl: string;
// }

// Configure ffmpeg to use the installed binary. This is crucial for video processing.
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * @function POST
 * @description Handles POST requests for video uploads. This API route processes the uploaded video,
 * generates an HLS stream, extracts a thumbnail, and stores relevant metadata in the database using Prisma.
 * Requires user authentication.
 * @param {NextRequest} req - The incoming Next.js request object containing the video file.
 * @returns {NextResponse} A JSON response indicating success with the manifest URL or an error.
 */
export async function POST(req: NextRequest) {
    // Get the authenticated session.
    const session = await auth();

    // If no active session, return an unauthorized response.
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Parse the incoming request to extract form data, specifically the video file.
        const formData = await req.formData();
        const file = formData.get("video") as File | null;
        const title = formData.get("title") as string | null;

        // If no file is provided in the form data, return a 400 Bad Request error.
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // If no title is provided, return a 400 Bad Request error.
        if (!title) {
            return NextResponse.json({ error: "No video title provided" }, { status: 400 });
        }

        // Convert the uploaded file into a Buffer for file system operations.
        const buffer = Buffer.from(await file.arrayBuffer());
        // Define a temporary path to save the uploaded raw video file.
        const filePath = path.join(process.cwd(), "uploads", file.name);
        // Write the buffer to the file system.
        await fs.promises.writeFile(filePath, buffer);

        // Extract the base name of the file (without extension) to use for directories and URLs.
        const fileName = path.parse(file.name).name;
        // Define the output directory for HLS segments and thumbnail within the public folder.
        const outputDir = path.join(process.cwd(), "public", "videos", fileName);

        // Create the output directory recursively if it doesn't already exist.
        fs.mkdirSync(outputDir, { recursive: true });

        // Define the URL for the generated thumbnail.
        const thumbnailUrl = `/videos/${fileName}/thumbnail.jpg`;
        // Define the local path for the generated thumbnail file.
        const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

        // Generate a thumbnail from the uploaded video using ffmpeg.
        await new Promise<void>((resolve, reject) => {
            ffmpeg(filePath)
                .screenshots({
                    timestamps: ['00:00:01'], // Capture a frame at the 1-second mark.
                    filename: 'thumbnail.jpg', // Name of the thumbnail file.
                    folder: outputDir,         // Directory to save the thumbnail.
                    size: '320x240'            // Dimensions of the thumbnail.
                })
                .on('end', () => resolve())   // Resolve the promise once thumbnail generation is complete.
                .on('error', (err) => reject(err)); // Reject on error.
        });

        // Process the uploaded video into an HLS (HTTP Live Streaming) format using ffmpeg.
        await new Promise<void>((resolve, reject) => {
            ffmpeg(filePath)
                .output(path.join(outputDir, "index.m3u8")) // Output the HLS manifest file.
                .outputOptions([
                    "-profile:v baseline", // H.264 profile for broad compatibility.
                    "-level 3.0",          // H.264 level.
                    "-start_number 0",     // Start segment numbering from 0.
                    "-hls_time 6",         // Set HLS segment duration to 6 seconds.
                    "-hls_list_size 0",    // Keep all segments in the playlist (0 means unlimited).
                    "-f hls",              // Specify HLS format.
                ])
                .on("end", () => {
                    fs.unlinkSync(filePath); // Delete the original uploaded file after successful processing.
                    resolve();               // Resolve the promise once HLS conversion is complete.
                })
                .on("error", (err) => {
                    reject(err);             // Reject on error.
                })
                .run(); // Execute the ffmpeg command.
        });

        // Construct the full URL for the HLS manifest. Uses NEXT_PUBLIC_BASE_URL if available, otherwise defaults to localhost.
        const manifestUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/videos/${fileName}/index.m3u8`;

        // Save video metadata to the database using Prisma.
        const newVideo = await prisma.video.create({
            data: {
                title: title,
                manifestUrl,
                thumbnailUrl,
                userId, // Associate video with the authenticated user
            },
        });

        // Return a successful response with the HLS manifest URL.
        return NextResponse.json({ manifestUrl: newVideo.manifestUrl });
    } catch (error: any) {
        // Catch any errors during the process, log them, and return a 500 Internal Server Error.
        console.error("FFmpeg error:", error);
        return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
    }
}
