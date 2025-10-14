import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

/**
 * List comments for a video (most recent first).
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const videoId = await params.id;
    const comments = await prisma.comment.findMany({
        where: { videoId },
        include: { user: { select: { id: true, username: true, first_name: true, last_name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    return NextResponse.json(comments);
}

/**
 * Create a new comment (authenticated users only).
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const videoId = await params.id;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const content = (body?.content as string | undefined)?.trim();
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const comment = await prisma.comment.create({
        data: { content, videoId, userId: session.user.id },
        include: { user: { select: { id: true, username: true, first_name: true, last_name: true, image: true } } },
    });
    return NextResponse.json(comment);
}


