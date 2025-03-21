import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prismaclient } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Zod Schema for Validation
const upvoteSchema = z.object({
  streamId: z.string(),
  type: z.enum(["up", "down"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prismaclient.user.findFirst({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Validate request body
    const data = upvoteSchema.parse(await req.json());

    // Check if user has already voted
    const existingVote = await prismaclient.upvotes.findFirst({
      where: {
        userId: user.id,
        streamId: data.streamId,
      },
    });

    if (existingVote) {
      // If vote type is the same, return an error
      if ((existingVote.haveUpvoted && data.type === "up") || 
          (!existingVote.haveUpvoted && data.type === "down")) {
        return NextResponse.json({ message: "You have already voted" }, { status: 400 });
      }

      // If vote type is different, update the vote
      await prismaclient.upvotes.update({
        where: { id: existingVote.id },
        data: { haveUpvoted: data.type === "up" },
      });
    } else {
      // Create a new upvote entry
      await prismaclient.upvotes.create({
        data: {
          userId: user.id,
          streamId: data.streamId,
          haveUpvoted: data.type === "up",
        },
      });
    }

    
    const upvoteCount = await prismaclient.upvotes.count({
      where: { streamId: data.streamId, haveUpvoted: true },
    });

    await prismaclient.stream.update({
      where: { id: data.streamId },
      data: { upvotes: upvoteCount }, 
    });

    return NextResponse.json({ message: "Vote recorded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing upvote:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
