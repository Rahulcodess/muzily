import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prismaclient } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Zod Schema for Validation
const upvoteSchema = z.object({
  streamId: z.string(),
  type: z.enum(["up", "down"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const data = upvoteSchema.parse(await req.json());

    // Use upsert for better performance - single database operation
    await prismaclient.upvotes.upsert({
      where: {
        userId_streamId: {
          userId: session.user.id,
          streamId: data.streamId,
        },
      },
      update: {
        haveUpvoted: data.type === "up",
      },
      create: {
        userId: session.user.id,
        streamId: data.streamId,
        haveUpvoted: data.type === "up",
      },
    });

    // Get updated counts in a single query
    const [upvoteCount, downvoteCount] = await Promise.all([
      prismaclient.upvotes.count({
        where: { streamId: data.streamId, haveUpvoted: true },
      }),
      prismaclient.upvotes.count({
        where: { streamId: data.streamId, haveUpvoted: false },
      }),
    ]);

    // Update stream with new counts
    await prismaclient.stream.update({
      where: { id: data.streamId },
      data: { 
        upvotes: upvoteCount,
        downvotes: downvoteCount,
      }, 
    });

    return NextResponse.json({ 
      message: "Vote recorded successfully",
      upvotes: upvoteCount,
      downvotes: downvoteCount,
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing upvote:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
