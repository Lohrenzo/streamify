import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

/**
 * @function GET
 * @description Handles GET requests to retrieve a single video's metadata from the database by its ID.
 * This API endpoint queries the database using Prisma.
 * @param {Request} request - The incoming Next.js request object.
 * @param {{ params: { id: string } }} { params } - Destructured object containing the route parameters, specifically the video `id`.
 * @returns {NextResponse} A JSON response containing the `Video` object if found, or a 404 error if not found,
 * or a 500 error if a database retrieval error occurs.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Find a unique video record in the database by its ID.
        const video = await prisma.video.findUnique({
            where: {
                id: id,
            },
        });

        // If no video is found, return a 404 Not Found error.
        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        // Return the found video as a JSON response.
        return NextResponse.json(video);
    } catch (error: any) {
        // For any database reading error, log the error and return a 500 Internal Server Error response.
        console.error("Error retrieving video from database:", error);
        return NextResponse.json({ error: "Failed to retrieve video details" }, { status: 500 });
    }
}
