// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import { prisma } from "@/prisma";
// import { auth } from "@/auth";

// // Configure ffmpeg to use the installed binary. This is crucial for video processing.
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// /**
//  * @function POST
//  * @description Handles POST requests for video uploads. This API route processes the uploaded video,
//  * generates an HLS stream, extracts a thumbnail, and stores relevant metadata in the database using Prisma.
//  * Requires user authentication.
//  * @param {NextRequest} req - The incoming Next.js request object containing the video file.
//  * @returns {NextResponse} A JSON response indicating success with the manifest URL or an error.
//  */
// export async function POST(req: NextRequest) {
//     // Get the authenticated session.
//     const session = await auth();

//     // If no active session, return an unauthorized response.
//     if (!session?.user?.id) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = session.user.id;

//     try {
//         // Parse the incoming request to extract form data, specifically the video file.
//         const formData = await req.formData();
//         const file = formData.get("video") as File | null;
//         const title = formData.get("title") as string | null;

//         // If no file is provided in the form data, return a 400 Bad Request error.
//         if (!file) {
//             return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//         }

//         // If no title is provided, return a 400 Bad Request error.
//         if (!title) {
//             return NextResponse.json({ error: "No video title provided" }, { status: 400 });
//         }

//         // Convert the uploaded file into a Buffer for file system operations.
//         const buffer = Buffer.from(await file.arrayBuffer());
//         // Define a temporary path to save the uploaded raw video file.
//         const filePath = path.join(process.cwd(), "uploads", file.name);
//         // Write the buffer to the file system.
//         await fs.promises.writeFile(filePath, buffer);

//         // Extract the base name of the file (without extension) to use for directories and URLs.
//         const fileName = path.parse(file.name).name;
//         // Define the output directory for HLS segments and thumbnail within the public folder.
//         const outputDir = path.join(process.cwd(), "public", "videos", fileName);

//         // Create the output directory recursively if it doesn't already exist.
//         fs.mkdirSync(outputDir, { recursive: true });

//         // Define the URL for the generated thumbnail.
//         const thumbnailUrl = `/videos/${fileName}/thumbnail.jpg`;
//         // Define the local path for the generated thumbnail file.
//         // const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

//         // Generate a thumbnail from the uploaded video using ffmpeg.
//         await new Promise<void>((resolve, reject) => {
//             ffmpeg(filePath)
//                 .screenshots({
//                     timestamps: ['00:00:01'], // Capture a frame at the 1-second mark.
//                     filename: 'thumbnail.jpg', // Name of the thumbnail file.
//                     folder: outputDir,         // Directory to save the thumbnail.
//                     size: '320x240'            // Dimensions of the thumbnail.
//                 })
//                 .on('end', () => resolve())   // Resolve the promise once thumbnail generation is complete.
//                 .on('error', (err) => reject(err)); // Reject on error.
//         });

//         // Process the uploaded video into an HLS (HTTP Live Streaming) format using ffmpeg.
//         await new Promise<void>((resolve, reject) => {
//             ffmpeg(filePath)
//                 .output(path.join(outputDir, "index.m3u8")) // Output the HLS manifest file.
//                 .outputOptions([
//                     "-profile:v baseline", // H.264 profile for broad compatibility.
//                     "-level 3.0",          // H.264 level.
//                     "-start_number 0",     // Start segment numbering from 0.
//                     "-hls_time 6",         // Set HLS segment duration to 6 seconds.
//                     "-hls_list_size 0",    // Keep all segments in the playlist (0 means unlimited).
//                     "-f hls",              // Specify HLS format.
//                 ])
//                 .on("end", () => {
//                     fs.unlinkSync(filePath); // Delete the original uploaded file after successful processing.
//                     resolve();               // Resolve the promise once HLS conversion is complete.
//                 })
//                 .on("error", (err) => {
//                     reject(err);             // Reject on error.
//                 })
//                 .run(); // Execute the ffmpeg command.
//         });

//         // Construct the full URL for the HLS manifest. Uses NEXT_PUBLIC_BASE_URL if available, otherwise defaults to localhost.
//         const manifestUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/videos/${fileName}/index.m3u8`;

//         // Save video metadata to the database using Prisma.
//         const newVideo = await prisma.video.create({
//             data: {
//                 title: title,
//                 manifestUrl,
//                 thumbnailUrl,
//                 userId, // Associate video with the authenticated user
//             },
//         });

//         // Return a successful response with the HLS manifest URL.
//         return NextResponse.json({ manifestUrl: newVideo.manifestUrl });
//     } catch (error: any) {
//         // Catch any errors during the process, log them, and return a 500 Internal Server Error.
//         console.error("FFmpeg error:", error);
//         return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
//     }
// }

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import os from "os";

// set ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("video") as File | null;
        const title = formData.get("title") as string | null;

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        if (!title) return NextResponse.json({ error: "No video title provided" }, { status: 400 });

        // Convert uploaded file to buffer and write to temp directory
        const buffer = Buffer.from(await file.arrayBuffer());


        // use cross-platform safe temp directory
        const tempDir = os.tmpdir();

        // ensure the directory exists (just in case)
        fs.mkdirSync(tempDir, { recursive: true });

        // write the file
        const tempFilePath = path.join(tempDir, file.name);
        await fs.promises.writeFile(tempFilePath, buffer);


        const baseName = path.parse(file.name).name;
        const outputDir = path.join(tempDir, baseName);
        fs.mkdirSync(outputDir, { recursive: true });

        const thumbnailPath = path.join(outputDir, "thumbnail.jpg");

        // Generate a thumbnail
        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempFilePath)
                .on("end", () => resolve())
                .on("error", reject)
                .screenshots({
                    timestamps: ["00:00:01"],
                    filename: "thumbnail.jpg",
                    folder: outputDir,
                    size: "320x240",
                });
        });

        // Convert to HLS
        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempFilePath)
                .output(path.join(outputDir, "index.m3u8"))
                .outputOptions([
                    "-profile:v baseline",
                    "-level 3.0",
                    "-start_number 0",
                    "-hls_time 6",
                    "-hls_list_size 0",
                    "-f hls",
                ])
                .on("end", () => resolve())
                .on("error", reject)
                .run();
        });

        // Upload HLS + Thumbnail to Vercel Blob
        const uploadedFiles: Record<string, string> = {};
        const allFiles = fs.readdirSync(outputDir);

        for (const filename of allFiles) {
            const localPath = path.join(outputDir, filename);
            const fileBuffer = await fs.promises.readFile(localPath);

            const { url } = await put(`videos/${baseName}/${filename}`, fileBuffer, {
                access: "public",
                token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
            });

            uploadedFiles[filename] = url;
        }

        // Find the manifest (.m3u8) and thumbnail URLs
        const manifestUrl = Object.entries(uploadedFiles).find(([name]) => name.endsWith(".m3u8"))?.[1];
        const thumbnailUrl = Object.entries(uploadedFiles).find(([name]) => name.endsWith(".jpg"))?.[1];

        if (!manifestUrl || !thumbnailUrl) {
            throw new Error("Missing manifest or thumbnail upload result");
        }

        // Save video record in Prisma
        const video = await prisma.video.create({
            data: {
                title,
                manifestUrl,
                thumbnailUrl,
                userId: session.user.id,
            },
        });

        // Cleanup temporary files
        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.unlinkSync(tempFilePath);

        return NextResponse.json({
            success: true,
            manifestUrl: video.manifestUrl,
            thumbnailUrl: video.thumbnailUrl,
        });
    } catch (error: any) {
        console.error("Video upload failed:", error);
        return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
    }
}
