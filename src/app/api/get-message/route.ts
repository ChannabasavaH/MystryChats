import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import User from "@/models/UserModel";
import dbConnection from "@/lib/dbConnection";
import Message from "@/models/messageModel";

export async function GET(req: Request) {
    await dbConnection();

    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {
            status: 401
        })
    }

    const userId = user!._id

    try {
        const user = await User.findById(userId).populate({
            path: 'messages',
            model: Message,
            options: {sort: { 'createdAt': -1 }}
        })

        if(!user || user.length === 0){
            return Response.json({
                success: false,
                message: "No User Found"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "User Found",
            messages: user.messages
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error in getting messages",error)
        return Response.json({
            success: false,
            message: "Error in getting messages"
        }, {
            status: 500
        })
    }
}