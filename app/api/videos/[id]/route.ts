import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

/**
 * Retrieves a single video's metadata from the database by its ID.
 *
 * @param {Request} request - Incoming Next.js request object.
 * @param {{ params: { id: string } }} param1 - Route params containing the video `id`.
 * @returns {NextResponse} JSON with the `Video` or an error/status code.
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
