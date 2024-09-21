import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/VerificationEmail";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystry Message || Verification Email',
            react: VerificationEmail({ username, otp: verifyCode }),
          });
        return { success: true, message: "Successfully sent the verification email" }
    } catch (emailError) {
        console.error("Error in verifying email",emailError)
        return { success: false, message: "Failed to send verification email" }
    }
}