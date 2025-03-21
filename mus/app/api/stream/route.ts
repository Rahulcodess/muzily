import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { prismaclient } from "@/lib/db"; 

const yt_regex =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const streamSchema = z.object({
  creatorid: z.string().min(1, "Creator ID is required"),
  url: z.string().min(1, "URL is required"),
});

export async function POST(req: NextRequest) {
  try {
    const jsonData = await req.json();
    console.log("Received Data:", jsonData);

    const data = streamSchema.parse(jsonData);

    const isyt = data.url.match(yt_regex);
    if (!isyt) {
      return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 400 });
    }

    const extractedId = isyt[1];
    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    console.log("YouTube API Response:", res); 

    if (!res || !res.title || !res.thumbnail || !res.thumbnail.thumbnails) {
      return NextResponse.json({ message: "Failed to fetch video details" }, { status: 500 });
    }

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) => b.width - a.width);

    const smallThumbnail = thumbnails.length > 1 ? thumbnails[thumbnails.length - 2]?.url : thumbnails[0]?.url;
    const bigThumbnail = thumbnails[thumbnails.length - 1]?.url;

    const stream = await prismaclient.stream.create({
      data: {
        userId: data.creatorid,
        url: data.url,
        extractedId,
        type: "youtube",
        title: res.title ?? "Unknown Title",
        smallimg: smallThumbnail ?? "https://example.com/default-small.jpg",
        bigimg: bigThumbnail ?? "https://example.com/default-big.jpg",
      },
    });

    return NextResponse.json({ message: "Stream Added", id: stream.id }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/stream:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid Data", errors: error.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to add stream" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorid = req.nextUrl.searchParams.get("creatorid");
    if (!creatorid) {
      return NextResponse.json({ message: "Creator ID is required" }, { status: 400 });
    }

    const streams = await prismaclient.stream.findMany({
      where: { userId: creatorid },
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.log("Error in GET /api/stream:");
    return NextResponse.json({ message: "Failed to fetch streams" }, { status: 500 });
  }
}
