import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import {z} from "zod";
import { prismaclient } from "@/lib/db";

const upvoteSchema = z.object({
    streamId: z.string(),
})
export async function POST(req: NextRequest) {
 const session = await getServerSession();
    
    const user=await prismaclient.user.findFirst({
        where:{
            email:session?.user?.email??"",
    }
    })

if(!user){
    return NextResponse.json({message:"user not found"}, {status:401})
}
try{
const data = await upvoteSchema.parse(await req.json())
await prismaclient.upvotes.delete({
    where:{
    userId_streamId:{
        userId:user.id,
        streamId:data.streamId,
    }
   
}
})
return NextResponse.json({message:"downvoted"},{status:200})
}
catch(e){
return NextResponse.json({message:"invalid response"},{status:400})
}
}