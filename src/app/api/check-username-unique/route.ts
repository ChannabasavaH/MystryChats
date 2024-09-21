import dbConnection from "@/lib/dbConnection";
import User from "@/models/UserModel";
import { z } from "zod";
import { usernameValidation } from "@/schema/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(req: Request) {
    await dbConnection()
    try {
        const { searchParams } = new URL(req.url)
        const queryParams = {
            username: searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(queryParams)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ')
                            : 'Invalid query parameters',
                },
                { status: 400 }
            );
        }

        const { username } = result.data
        const existingVerifiedUser = await User.findOne({ username, isVerified: true })
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 200 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Username is unique',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error checking username", error)
        return Response.json({
            success: false,
            message: "Error checking username"
        }, {
            status: 500
        })
    }
}