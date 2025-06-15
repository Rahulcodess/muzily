"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Headphones, Play, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import React from "react";
import YouTube from "react-youtube";
import clsx from "clsx";

interface DashboardProps {
  creatorId: string;
}

export default function Dashboard({ creatorId }: DashboardProps) {
  const { data: session } = useSession();
  const [queue, setQueue] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [userVotes, setUserVotes] = useState<{ [key: string]: string }>({}); // Track user votes
  const [notify, setNotify] = useState<string | null>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  const waveCount = 8;
  const waves = Array.from({ length: waveCount });

  const noteSymbols = ["\u266B", "\u266A", "\u266C", "\u2669", "\u266F", "\u266D", "\u266E", "\u266B", "\u266A"];
  const noteCount = 10;
  const notes = Array.from({ length: noteCount });

  async function refreshStream() {
    try {
      console.log("🔄 Refreshing queue for creatorId:", creatorId);
      const res = await fetch(`/api/stream?creatorId=${creatorId}`, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch stream: ${res.status}`);

      const data = await res.json();
      console.log("Fetched streams from API:", data.streams);
      if (!data?.streams || !Array.isArray(data.streams)) throw new Error("Invalid data format");

      const formattedQueue = data.streams.map((song: any) => ({
        id: song.id,
        title: song.title,
        thumbnail: song.smallimg || song.bigimg || "/default-thumbnail.jpg",
        upvotes: song.upvotes || 0,
        downvotes: song.downvotes || 0,
        extractedId: song.extractedId,
        createdAt: song.createdAt,
      }));

      // Sort by upvotes descending, then by createdAt ascending (oldest first as tiebreaker)
      const uniqueQueue = Array.from(
        formattedQueue
          .sort((a: any, b: any) => {
            if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          })
          .reduce((map: Map<string, any>, song: any) => {
            if (!map.has(song.extractedId)) {
              map.set(song.extractedId, song);
            }
            return map;
          }, new Map())
          .values()
      );

      setQueue(uniqueQueue);
      if (uniqueQueue.length > 0) setCurrentSong(uniqueQueue[0]);

      console.log("✅ Queue updated:", uniqueQueue);
    } catch (error) {
      console.error("❌ Error refreshing queue:", error);
    }
  }

  useEffect(() => {
    refreshStream();
    const interval = setInterval(refreshStream, 10000);
    return () => clearInterval(interval);
  }, [creatorId]);

  // Handler for when the video ends
  const handleVideoEnd = () => {
    const idx = queue.findIndex((s) => s.id === currentSong?.id);
    if (idx !== -1 && idx < queue.length - 1) {
      setCurrentSong(queue[idx + 1]);
    }
  };

  const handleAddToQueue = async () => {
    if (!youtubeLink.trim()||!creatorId) return;

    try {
      console.log("🟡 Adding song:", youtubeLink);
      const res = await fetch('/api/stream', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: youtubeLink,
          creatorId: creatorId
        }),
      });
      console.log("Used creatorId:", creatorId);

      if (!res.ok) throw new Error(`Add song failed: ${await res.text()}`);

      setYoutubeLink("");
      setNotify("Song added to queue!");
      refreshStream(); // Force queue refresh
      setTimeout(() => setNotify(null), 2500);
      // Scroll to bottom after a short delay
      setTimeout(() => {
        if (queueRef.current) {
          queueRef.current.scrollTop = queueRef.current.scrollHeight;
        }
      }, 600);
    } catch (error) {
      setNotify("Failed to add song.");
      setTimeout(() => setNotify(null), 2500);
      console.error("❌ Error adding song:", error);
    }
  };

  
  const handleVote = async (id: string, type: "up" | "down") => {
    if (!id) {
      console.error("Invalid streamId:", id);
      return;
    }
    if (userVotes[id] === type) return; // Prevent duplicate votes

    console.log("🟡 Voting:", { streamId: id, type });

    setQueue((prevQueue) =>
      prevQueue.map((song) =>
        song.id === id
          ? {
              ...song,
              upvotes: type === "up" ? song.upvotes + 1 : song.upvotes,
              downvotes: type === "down" ? song.downvotes + 1 : song.downvotes,
            }
          : song
      )
    );

    setUserVotes((prevVotes) => ({ ...prevVotes, [id]: type }));

    try {
      const res = await fetch(`/api/stream/upvotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: id, type }),
      });

      const result = await res.json();
      console.log("Upvote API response:", result);

      if (!res.ok) throw new Error(`Vote API failed: ${res.status}, ${JSON.stringify(result)}`);

      console.log("✅ Vote successful!");
      refreshStream(); // Refresh after voting
    } catch (error) {
      console.error("❌ Error submitting vote:", error);
    }
  };

  /** ✅ Copy Stream Link */
  const handleShare = () => {
    const creatorId = session?.user?.id;
    const link = `${window.location.origin}/creator/${creatorId}`;
    navigator.clipboard.writeText(link);
    alert("✅ Stream link copied to clipboard!");
  };

  return (
    <div className="flex min-h-screen h-full bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526] text-gray-100 relative">
      {/* Sidebar */}
      <aside className="w-56 bg-black/60 backdrop-blur-md p-4 flex flex-col justify-between min-h-screen border-r border-gray-800 shadow-xl">
        <div>
          <div className="flex items-center mb-8">
            <Headphones className="h-7 w-7 text-purple-400" />
            <span className="ml-2 text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Muzily
            </span>
          </div>
          {!session && (
            <Button 
              onClick={() => signIn()} 
              className="w-full bg-purple-600 hover:bg-purple-700 mb-3 text-sm py-2 rounded-full font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
        <Button onClick={handleShare} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm shadow-lg font-semibold">
          <Share2 className="h-4 w-4" /> Share Stream
        </Button>
      </aside>

      {/* Main Content: Centered and prominent queue */}
      <main className="flex-1 flex flex-col items-center justify-start p-10 gap-8">
        {/* Top: Add/Search Bar */}
        <div className="w-full max-w-3xl flex flex-col gap-2 bg-black/40 backdrop-blur-md rounded-2xl shadow-lg px-6 py-4 border border-gray-800 mb-6">
          <h2 className="text-lg font-bold text-purple-300 mb-2">Add a song</h2>
          <div className="flex flex-row items-center gap-4">
            <Input value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="Paste YouTube link here" className="bg-gray-800 border-none text-sm px-3 py-2 rounded-full flex-1 focus:ring-2 focus:ring-purple-500" />
            <Button onClick={handleAddToQueue} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-full font-semibold ml-2">Add to Queue</Button>
            <Button onClick={handleShare} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 rounded-full font-semibold ml-2 flex items-center gap-1">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* Prominent Upcoming Songs Queue */}
        <section className="w-full max-w-2xl bg-black/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col border border-gray-800 min-w-[340px] max-w-[600px] mx-auto h-[640px]">
          <h2 className="text-3xl font-extrabold mb-8 text-purple-200 tracking-tight text-center">Upcoming Songs</h2>
          <ScrollArea className="flex-1 pr-2">
            {queue.length > 0 ? (
              queue.map((song, idx) => (
                <div key={song.id} className={`flex gap-5 mb-5 bg-gray-800/80 p-4 rounded-2xl shadow-md transition hover:scale-[1.01] min-h-[90px] items-center ${idx !== queue.length - 1 ? 'border-b border-gray-700' : ''}`}> 
                  <img src={song.thumbnail} alt={song.title} width={72} height={72} className="w-20 h-20 object-cover rounded-xl border border-gray-700 flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <span className="font-semibold text-lg text-white leading-tight mb-1 break-words whitespace-normal" title={song.title}>{song.title}</span>
                    <div className="flex items-center gap-5 mt-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleVote(song.id, "up")} disabled={userVotes[song.id] === "up"} className={clsx("p-1 transition-transform duration-200", userVotes[song.id] === "up" && "animate-vote-bounce")}> 
                          <ThumbsUp className={userVotes[song.id] === "up" ? "text-green-400" : "text-gray-400"} size={22} />
                        </Button>
                        <span className="text-green-400 font-semibold text-base w-7 text-center">{song.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleVote(song.id, "down")} disabled={userVotes[song.id] === "down"} className={clsx("p-1 transition-transform duration-200", userVotes[song.id] === "down" && "animate-vote-bounce")}> 
                          <ThumbsDown className={userVotes[song.id] === "down" ? "text-red-400" : "text-gray-400"} size={22} />
                        </Button>
                        <span className="text-red-400 font-semibold text-base w-7 text-center">{song.downvotes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-lg text-center">🎵 No songs in queue. Add one!</p>
            )}
          </ScrollArea>
        </section>
      </main>

      {/* Floating Now Playing Video at bottom right */}
      {currentSong && currentSong.extractedId && (
        <div className="fixed bottom-8 right-8 z-50 p-1" style={{ borderRadius: '24px' }}>
          {/* Glowing animated border */}
          <div className="relative bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 px-6 pt-6 pb-8 flex flex-col items-center w-[420px] overflow-visible animate-dj-glow">
            {/* Animated music notes at corners */}
            <span className="absolute -top-6 -left-6 text-pink-400 text-4xl animate-dj-note">&#9835;</span>
            <span className="absolute -top-6 -right-6 text-yellow-300 text-3xl animate-dj-note2">&#119070;</span>
            <span className="absolute -bottom-6 -left-6 text-blue-400 text-3xl animate-dj-note3">&#9833;</span>
            <span className="absolute -bottom-6 -right-6 text-purple-400 text-4xl animate-dj-note4">&#119070;</span>
            <h2 className="text-4xl font-extrabold mb-4 text-center animate-dj-glow-text bg-gradient-to-r from-pink-300 via-purple-400 to-pink-300 bg-clip-text text-transparent tracking-tight">Now Playing</h2>
            <div className="relative w-[380px] h-[214px] flex justify-center items-center mb-4 bg-black/70 rounded-xl border border-gray-700 shadow-lg">
              <YouTube
                videoId={currentSong.extractedId}
                opts={{
                  width: 370,
                  height: 208,
                  playerVars: { autoplay: 1 },
                }}
                onEnd={handleVideoEnd}
                className="rounded-2xl bg-black shadow-xl"
              />
            </div>
            <span className="text-lg font-bold text-white text-center break-words whitespace-normal mt-2" title={currentSong.title}>{currentSong.title}</span>
            <style jsx global>{`
              @keyframes dj-glow {
                0% { box-shadow: 0 0 32px 8px #a78bfa, 0 0 0 0 #f472b6; }
                50% { box-shadow: 0 0 48px 20px #f472b6, 0 0 0 0 #a78bfa; }
                100% { box-shadow: 0 0 32px 8px #a78bfa, 0 0 0 0 #f472b6; }
              }
              .animate-dj-glow {
                animation: dj-glow 1.1s infinite alternate;
              }
              @keyframes dj-glow-text {
                0% { filter: brightness(1.1) drop-shadow(0 0 12px #a78bfa); }
                50% { filter: brightness(1.5) drop-shadow(0 0 24px #f472b6); }
                100% { filter: brightness(1.1) drop-shadow(0 0 12px #a78bfa); }
              }
              .animate-dj-glow-text {
                animation: dj-glow-text 1.1s infinite alternate;
              }
              @keyframes dj-note {
                0% { transform: translateY(0) rotate(-10deg); opacity: 1; }
                50% { transform: translateY(-16px) rotate(10deg); opacity: 0.7; }
                100% { transform: translateY(0) rotate(-10deg); opacity: 1; }
              }
              .animate-dj-note { animation: dj-note 2.2s infinite; }
              @keyframes dj-note2 {
                0% { transform: translateY(0) rotate(10deg); opacity: 1; }
                50% { transform: translateY(-20px) rotate(-10deg); opacity: 0.7; }
                100% { transform: translateY(0) rotate(10deg); opacity: 1; }
              }
              .animate-dj-note2 { animation: dj-note2 2.7s infinite; }
              @keyframes dj-note3 {
                0% { transform: translateY(0) rotate(-8deg); opacity: 1; }
                50% { transform: translateY(14px) rotate(8deg); opacity: 0.7; }
                100% { transform: translateY(0) rotate(-8deg); opacity: 1; }
              }
              .animate-dj-note3 { animation: dj-note3 2.1s infinite; }
              @keyframes dj-note4 {
                0% { transform: translateY(0) rotate(8deg); opacity: 1; }
                50% { transform: translateY(18px) rotate(-8deg); opacity: 0.7; }
                100% { transform: translateY(0) rotate(8deg); opacity: 1; }
              }
              .animate-dj-note4 { animation: dj-note4 2.4s infinite; }
              .animate-queue-pop {
                animation: queue-pop 0.5s cubic-bezier(.68,-0.55,.27,1.55);
              }
              @keyframes queue-pop {
                0% { opacity: 0; transform: scale(0.8); }
                60% { opacity: 1; transform: scale(1.08); }
                100% { opacity: 1; transform: scale(1); }
              }
              .animate-vote-bounce {
                animation: vote-bounce 0.4s cubic-bezier(.68,-0.55,.27,1.55);
              }
              @keyframes vote-bounce {
                0% { transform: scale(1); }
                40% { transform: scale(1.3); }
                60% { transform: scale(0.95); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notify && (
        <div className="fixed top-8 right-1/2 translate-x-1/2 z-[9999] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-lg animate-fade-in-out">
          {notify}
          <style jsx global>{`
            @keyframes fade-in-out {
              0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
              10% { opacity: 1; transform: translateY(0) scale(1); }
              90% { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
            }
            .animate-fade-in-out {
              animation: fade-in-out 2.5s;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
