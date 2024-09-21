import User from "@/models/UserModel";
import dbConnection from "@/lib/dbConnection";
import Message from "@/models/messageModel";

export async function POST(req: Request) {
    await dbConnection()
    const { username, content } = await req.json()
    try {
        const user = await User.findOne({ username })

        if (!user) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        if (!user.isAcceptingMessage) {
            return Response.json(
                { message: 'User not accepting messages', success: false },
                { status: 403 }
            );
        }

        const newMessage = new Message({
            content: content,
            createdAt: new Date()
        })

        await newMessage.save()

        if (!newMessage) {
            return Response.json(
                { message: 'No new message is created', success: false },
                { status: 500 }
            );
        }

        user.messages.push(newMessage._id)
        await user.save();
        
        return Response.json(
            { message: 'New Message is created', success: true, newMessage },
            { status: 200 }
        );

    } catch (error) {
        console.log("Error in sending message", error)
        return Response.json({
            success: false,
            message: "Error in sending messages"
        }, {
            status: 500
        })
    }
}