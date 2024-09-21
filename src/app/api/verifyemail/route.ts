import dbConnection from "@/lib/dbConnection";
import User from "@/models/UserModel";

export async function POST(req: Request) {
    await dbConnection()
    try {
        const { username, code } = await req.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await User.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            // Update the user's verification status
            user.isVerified = true;
            await user.save();

            return Response.json(
                { success: true, message: 'Account verified successfully' },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            // Code has expired
            return Response.json(
                {
                    success: false,
                    message:
                        'Verification code has expired. Please sign up again to get a new code.',
                },
                { status: 400 }
            );
        } else {
            // Code is incorrect
            return Response.json(
                { success: false, message: 'Incorrect verification code' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error in sending verification email", error)
        return Response.json({
            success: false,
            message: "Error in sending verification email"
        }, {
            status: 500
        })
    }
}