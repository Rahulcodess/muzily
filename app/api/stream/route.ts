import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import youtubesearchapi from "youtube-search-api";
import { prismaclient } from "@/lib/db"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Enhanced YouTube URL regex to catch more formats
const yt_regex =
  /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:youtu(?:be)?\.com\/(?:[\w\-]+\?v=|embed\/|v\/)|youtu\.be\/)([\w\-]+)(?:\S+)?$/;

const streamSchema = z.object({
  creatorId: z.string().min(1, "Creator ID is required"),
  url: z.string().min(1, "URL is required"),
});

export async function POST(req: NextRequest) {
  try {
    const jsonData = await req.json();
    console.log("Received Data:", jsonData);

    const data = streamSchema.parse(jsonData);

    // Trim URL and normalize it
    const cleanUrl = data.url.trim();
    const isyt = cleanUrl.match(yt_regex);
    if (!isyt) {
      console.log("Invalid YouTube URL:", cleanUrl);
      return NextResponse.json({ message: "Invalid YouTube URL format. Please use a valid YouTube link." }, { status: 400 });
    }

    const extractedId = isyt[1];
    
    // Validate YouTube ID format (should be 11 characters)
    if (!extractedId || extractedId.length !== 11) {
      console.log("Invalid YouTube video ID:", extractedId);
      return NextResponse.json({ message: "Invalid YouTube video ID" }, { status: 400 });
    }

    console.log("Extracted YouTube ID:", extractedId);

    // Check if this video already exists for this creator
    const existingStream = await prismaclient.stream.findFirst({
      where: {
        userId: data.creatorId,
        extractedId: extractedId,
      },
    });

    if (existingStream) {
      return NextResponse.json({ message: "This song is already in the queue!" }, { status: 400 });
    }

    let res;
    let videoTitle = "Unknown Title";
    
    try {
      res = await youtubesearchapi.GetVideoDetails(extractedId);
      console.log("YouTube API Response:", res);
      
      // Check if response is valid and has title
      if (res && res.title) {
        videoTitle = res.title;
      } else {
        console.warn("YouTube API returned incomplete data:", res);
        // Try to get basic info from YouTube's oEmbed API as fallback
        try {
          const oEmbedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`);
          if (oEmbedResponse.ok) {
            const oEmbedData = await oEmbedResponse.json();
            videoTitle = oEmbedData.title || `YouTube Video ${extractedId}`;
            console.log("Fallback oEmbed title:", videoTitle);
          }
        } catch (fallbackError) {
          console.warn("Fallback oEmbed also failed:", fallbackError);
          videoTitle = `YouTube Video ${extractedId}`;
        }
      }
    } catch (apiError: any) {
      console.error("Error fetching YouTube details:", apiError);
      
      // Handle specific YouTube API errors
      if (apiError.message && apiError.message.includes("Video unavailable")) {
        return NextResponse.json({ message: "This video is unavailable or private" }, { status: 400 });
      }
      
      // Try fallback oEmbed API
      try {
        console.log("Trying fallback oEmbed API...");
        const oEmbedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`);
        if (oEmbedResponse.ok) {
          const oEmbedData = await oEmbedResponse.json();
          videoTitle = oEmbedData.title || `YouTube Video ${extractedId}`;
          console.log("✅ Fallback oEmbed successful:", videoTitle);
        } else {
          return NextResponse.json({ message: "Video not found or is private/unavailable" }, { status: 400 });
        }
      } catch (fallbackError) {
        console.error("Both YouTube APIs failed:", fallbackError);
        return NextResponse.json({ message: "Failed to fetch video details. Please try again later." }, { status: 500 });
      }
    }

    // Handle thumbnails safely with fallbacks
    let smallThumbnail = `https://img.youtube.com/vi/${extractedId}/default.jpg`;
    let bigThumbnail = `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`;
    
    // Try to get thumbnails from API response if available
    if (res && res.thumbnail && res.thumbnail.thumbnails && Array.isArray(res.thumbnail.thumbnails)) {
      try {
        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) => b.width - a.width);
        smallThumbnail = thumbnails.length > 1 ? thumbnails[thumbnails.length - 2]?.url || smallThumbnail : thumbnails[0]?.url || smallThumbnail;
        bigThumbnail = thumbnails[thumbnails.length - 1]?.url || bigThumbnail;
      } catch (thumbError) {
        console.warn("Error processing thumbnails, using defaults:", thumbError);
        // Keep the default thumbnail URLs
      }
    }

    try {
      const stream = await prismaclient.stream.create({
        data: {
          userId: data.creatorId,
          url: cleanUrl,
          extractedId,
          type: "youtube",
          title: videoTitle,
          smallimg: smallThumbnail,
          bigimg: bigThumbnail,
        },
      });

      console.log("✅ Stream created successfully:", stream.id);
      return NextResponse.json({ message: "Song added to queue!", id: stream.id }, { status: 201 });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      if (dbError.code === 'P2002') {
        return NextResponse.json({ message: "This song is already in the queue!" }, { status: 400 });
      }
      return NextResponse.json({ message: "Database error. Please try again." }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in POST /api/stream:", error);

    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ message: `Validation error: ${fieldErrors}` }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorid = req.nextUrl.searchParams.get("creatorId");
    if (!creatorid) {
      return NextResponse.json({ message: "Creator ID is required" }, { status: 400 });
    }

    // Get current user session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const streams = await prismaclient.stream.findMany({
      where: { userId: creatorid },
    });

    let userVotes: { [key: string]: string } = {};
    if (currentUserId) {
      const votes = await prismaclient.upvotes.findMany({
        where: {
          userId: currentUserId,
          streamId: { in: streams.map((s) => s.id) },
        },
      });
      for (const vote of votes) {
        userVotes[vote.streamId] = vote.haveUpvoted ? "up" : "down";
      }
    }

    console.log("Streams found for creatorId", creatorid, ":", streams);

    return NextResponse.json({ streams, userVotes });
  } catch (error) {
    console.log("Error in GET /api/stream:");
    return NextResponse.json({ message: "Failed to fetch streams" }, { status: 500 });
  }
}
