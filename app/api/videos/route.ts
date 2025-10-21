import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

// Define the path to the JSON file where video metadata is stored.
// const VIDEOS_METADATA_PATH = path.join(process.cwd(), "videos.json");

// /**
//  * @interface VideoMetadata
//  * @description Defines the structure for video metadata, consistent with what's stored by the upload API.
//  * @property {string} id - Unique identifier for the video.
//  * @property {string} title - Display title of the video.
//  * @property {string} manifestUrl - URL to the HLS manifest for streaming.
//  * @property {string} uploadDate - ISO string of the upload date.
//  * @property {string} thumbnailUrl - URL to the video's thumbnail image.
//  */
// interface VideoMetadata {
//     id: string;
//     title: string;
//     manifestUrl: string;
//     uploadDate: string;
//     thumbnailUrl: string;
// }

/**
 * Handles GET requests to retrieve a list of all uploaded video metadata from the database.
 *
 * @returns {NextResponse} JSON with an array of videos ordered by `uploadDate` (descending).
 */
export async function GET() {
    try {
        // Fetch all video records from the database.
        const videos = await prisma.video.findMany({
            orderBy: {
                uploadDate: "desc", // Order by most recent uploads
            },
        });

        if (!videos || videos.length === 0) {
            console.log("No video in database")
            return NextResponse.json([]);
        }
        // Return the array of videos as a JSON response.
        return NextResponse.json(videos);
    } catch (error: any) {
        // For any database reading error, log the error and return a 500 Internal Server Error response.
        console.error("Error retrieving videos from database:", error);
        return NextResponse.json({ error: "Failed to retrieve video list" }, { status: 500 });
    }
}
