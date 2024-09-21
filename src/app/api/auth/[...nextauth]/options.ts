import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import User from "@/models/UserModel";
import dbConnection from "@/lib/dbConnection";

export const authOptions: NextAuthOptions = {
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: 'text' },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnection();
                try {
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    });

                    if (!user) {
                        throw new Error("No user found with this email or username. Please sign up.");
                    }

                    if (!user.isVerified) {
                        throw new Error("Your account is not verified. Please check your email for verification instructions.");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordCorrect) {
                        throw new Error("Incorrect password. Please try again.");
                    }

                    return {
                        _id: user._id.toString(),
                        email: user.email,
                        isVerified: user.isVerified,
                        isAcceptingMessage: user.isAcceptingMessage,
                        username: user.username,
                    };

                } catch (error: any) {
                    throw new Error(error.message || "Authentication failed.");
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            session.user._id = token._id;
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessage = token.isAcceptingMessage;
            session.user.username = token.username;
            return session;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // Optional: 30 days session duration
    },
    secret: process.env.NEXTAUTH_KEY,
    pages: {
        signIn: '/signin'
    }
};
