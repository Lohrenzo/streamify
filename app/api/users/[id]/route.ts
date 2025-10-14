import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

/**
 * Get user by ID.
 */
export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = await params.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, first_name: true, last_name: true, image: true },
    });
    return NextResponse.json(user ?? null);
}
