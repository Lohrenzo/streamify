import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

/**
 * Get like summary for a video: total count and whether current user liked it.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const videoId = await params.id;
    const session = await auth();
    const db = prisma as any;

    const [count, existing] = await Promise.all([
        db.like.count({ where: { videoId } }),
        session?.user?.id
            ? db.like.findUnique({ where: { userId_videoId: { userId: session.user.id!, videoId } } })
            : Promise.resolve(null),
    ]);

    return NextResponse.json({ count, liked: !!existing });
}

/**
 * Like a video (authenticated users only). Idempotent.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
    const videoId = await params.id;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const db = prisma as any;
    try {
        const existing = await db.like.findUnique({ where: { userId_videoId: { userId, videoId } } });
        if (existing) {
            await db.like.delete({ where: { userId_videoId: { userId, videoId } } });
        } else {
            await db.like.create({ data: { userId, videoId } });
        }
        const count = await db.like.count({ where: { videoId } });
        return NextResponse.json({ ok: true, count, liked: !existing });
    } catch (e) {
        return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
    }
}

/**
 * Unlike a video (authenticated users only).
 */
// DELETE handler removed: toggling is handled by POST


