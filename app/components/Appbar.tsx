 "use client";
 import { signIn, signOut, useSession} from "next-auth/react"
 import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Headphones, Music, ThumbsUp, ThumbsDown, Play, SkipForward, Volume2, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils";

 export function Appbar() {
  const SessionProvider = useSession();
    return <div className="flex justify-between px-20">
               <div className="text-lg font-bold flex-col justify-center">
                Muzily
             </div>
             <div className="absolute top-0 right-0 m-4">
                {SessionProvider.data?.user&& <button  className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105  "onClick={()=> signOut()}>log out</button>}
                 {!SessionProvider.data?.user&& <button  className="bg-purple-600 text-white hover:bg-purple-900 px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"onClick={()=> signIn()}>Sign in</button>}     
          </div>
        </div>
        

}