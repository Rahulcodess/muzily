import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Headphones, Music, ThumbsUp, ThumbsDown, Play, SkipForward, Volume2, Users, ChevronRight } from "lucide-react"
import { Appbar } from "./components/Appbar"
import Redirect from "./components/Redirect"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <header className="px-4 lg:px-6 h-16 flex items-center backdrop-blur-lg bg-black/50 sticky top-0 z-50 border-b border-purple-900/50">
        <Appbar/>
        <Redirect/>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6">
           
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Vote
                  </span>{" "}
                  the Rhythm,{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-400">
                    Feel
                  </span>{" "}
                  the Vibe
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl lg:text-2xl">
                  Join Muzily and experience music like never before. Where every listener shapes the playlist.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105">
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-black text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Why Choose Muzily?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center bg-black p-6 rounded-lg transition-all duration-300 hover:transform hover:scale-105 border border-purple-900/50">
                <Music className="h-12 w-12 mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Democratized Playlists</h3>
                <p className="text-gray-400">
                  Every listener has a say in what plays next. Your votes shape the music experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-black p-6 rounded-lg transition-all duration-300 hover:transform hover:scale-105 border border-purple-900/50">
                <Users className="h-12 w-12 mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Community-Driven</h3>
                <p className="text-gray-400">Connect with like-minded music lovers and discover new tracks together.</p>
              </div>
              <div className="flex flex-col items-center text-center bg-black p-6 rounded-lg transition-all duration-300 hover:transform hover:scale-105 border border-purple-900/50">
                <ThumbsUp className="h-12 w-12 mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Real-Time Interaction</h3>
                <p className="text-gray-400">
                  Vote, chat, and influence the playlist in real-time for an engaging experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="player" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-black to-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Experience the Muzily Player
            </h2>
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Chaiyya Chaiyya</h3>
                    <p className="text-gray-400">A.R. Rahman, Sukhwinder Singh</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                    >
                      <ThumbsUp className="h-6 w-6" />
                    </Button>
                    <span className="text-purple-400 font-semibold">1.2k</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    >
                      <ThumbsDown className="h-6 w-6" />
                    </Button>
                    <span className="text-gray-400 font-semibold">50</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  >
                    <Play className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                </div>
                <div className="bg-gray-700 h-1 rounded-full">
                  <div className="bg-purple-500 h-1 rounded-full w-1/3"></div>
                </div>
              </div>
              <div className="bg-gray-900 p-4">
                <h4 className="text-lg font-semibold mb-2">Up Next:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Puspha pushpha</p>
                      <p className="text-sm text-gray-400">Devi shri prasad</p>
                    </div>
                    <span className="text-purple-400 font-semibold">980 votes</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tum Hi Ho</p>
                      <p className="text-sm text-gray-400">Arijit Singh</p>
                    </div>
                    <span className="text-purple-400 font-semibold">875 votes</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maharani</p>
                      <p className="text-sm text-gray-400">Arpit</p>
                    </div>
                    <span className="text-purple-400 font-semibold">730 votes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Ready to Revolutionize Your Music Experience?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                  Join Muzily today and be part of the future of interactive music streaming.
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center">
                Get Started Now <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-black border-t border-purple-900/50">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2025 Muzily. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
            <Link className="text-sm hover:text-purple-400 transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="text-sm hover:text-purple-400 transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="text-sm hover:text-purple-400 transition-colors" href="#">
              Contact Us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

