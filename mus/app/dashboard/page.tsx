"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Headphones, Play, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";

export default function Dashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any | null>(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [userVotes, setUserVotes] = useState<{ [key: string]: string }>({}); // Track user votes

 
  async function refreshStream() {
    try {
      console.log("🔄 Refreshing queue...");
      const res = await fetch(`/api/stream/my`, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch stream: ${res.status}`);

      const data = await res.json();
      if (!data?.streams || !Array.isArray(data.streams)) throw new Error("Invalid data format");

      const formattedQueue = data.streams.map((song: any) => ({
        id: song.id,
        title: song.title,
        thumbnail: song.smallimg || song.bigimg || "/default-thumbnail.jpg",
        upvotes: song.upvotes || 0,
        downvotes: song.downvotes || 0,
      }));

      setQueue(formattedQueue);
      if (formattedQueue.length > 0) setCurrentSong(formattedQueue[0]);

      console.log("✅ Queue updated:", formattedQueue);
    } catch (error) {
      console.error("❌ Error refreshing queue:", error);
    }
  }

  useEffect(() => {
    refreshStream();
    const interval = setInterval(refreshStream, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToQueue = async () => {
    if (!youtubeLink.trim()) return;

    try {
      console.log("🟡 Adding song:", youtubeLink);
      const res = await fetch(`/api/stream/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeLink }),
      });

      if (!res.ok) throw new Error(`Add song failed: ${await res.text()}`);

      console.log("✅ Song added successfully!");
      setYoutubeLink("");
      refreshStream(); // Force queue refresh
    } catch (error) {
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

      if (!res.ok) throw new Error(`Vote API failed: ${res.status}, ${await res.text()}`);

      console.log("✅ Vote successful!");
      refreshStream(); // Refresh after voting
    } catch (error) {
      console.error("❌ Error submitting vote:", error);
    }
  };

  /** ✅ Copy Stream Link */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("✅ Stream link copied to clipboard!");
  };

  return (
    <div className="flex h-screen bg-black text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6">
        <div className="flex items-center mb-8">
          <Headphones className="h-8 w-8 text-purple-500" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text">
            Muzily
          </span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome back, DJ!</h1>

        {/* Add Song */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Add a YouTube Song</h2>
          <div className="flex gap-4">
            <Input value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="Paste YouTube Link" className="bg-gray-700 border-gray-600" />
            <Button onClick={handleAddToQueue} className="bg-purple-600 hover:bg-purple-700">Add to Queue</Button>
          </div>
        </div>

        {/* Song Queue */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Song Queue</h2>
          <ScrollArea className="h-64">
            {queue.length > 0 ? (
              queue.map((song) => (
                <div key={song.id} className="flex items-center gap-4 mb-4 bg-gray-700 p-3 rounded">
                  <img src={song.thumbnail} alt={song.title} width={100} height={100} className="w-20 h-15 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{song.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleVote(song.id, "up")} disabled={userVotes[song.id] === "up"}>
                      <ThumbsUp className={userVotes[song.id] === "up" ? "text-green-500" : ""} />
                    </Button>
                    <span>{song.upvotes}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleVote(song.id, "down")} disabled={userVotes[song.id] === "down"}>
                      <ThumbsDown className={userVotes[song.id] === "down" ? "text-red-500" : ""} />
                    </Button>
                    <span>{song.downvotes}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">🎵 No songs in queue. Add one!</p>
            )}
          </ScrollArea>
        </div>
      </main>

      {/* Share Stream Button */}
      <Button onClick={handleShare} className="fixed bottom-8 left-8 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <Share2 className="h-5 w-5" /> Share Stream
      </Button>
    </div>
  );
}
