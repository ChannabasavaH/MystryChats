import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import User from "@/models/UserModel";
import dbConnection from "@/lib/dbConnection";

export async function POST(req: Request) {
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
    const { acceptMessages } = await req.json()

    try {
        const updatedUser = await User.findByIdAndUpdate(userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Error in updating user"
            }, {
                status: 401
            })
        }

        return Response.json({
            success: true,
            message: "Accept Message Changed"
        }, {
            status: 200
        })

    } catch (error) {
        console.log("Error in accepting Message", error)
        return Response.json({
            success: false,
            message: "Error in accepting Message"
        }, {
            status: 500
        })
    }
}

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
        const foundUser = await User.findById(userId)
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "No user found"
            }, {
                status: 404
            })
        }

        return Response.json({
            success: true,
            message: "User Found",
            isAcceptingMessage: foundUser?.isAcceptingMessage
        }, {
            status: 200
        })

    } catch (error) {
        console.log("Error in finding user", error)
        return Response.json({
            success: false,
            message: "Error in finding user"
        }, {
            status: 500
        })
    }
}
