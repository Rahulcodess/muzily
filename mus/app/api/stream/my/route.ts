import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prismaclient } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaclient.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streams = await prismaclient.stream.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            upvote: true,
          },
        },
        upvote: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    return NextResponse.json({ 
      streams: streams.map(({ _count, ...rest }) => ({
        ...rest,
        upvote: _count?.upvote || 0, 
        haveupvote: rest.upvote.length ? true : false
      })),
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
