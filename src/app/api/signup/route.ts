import dbConnection from "@/lib/dbConnection";
import User from "@/models/UserModel";
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
    await dbConnection()
    try {
        const { username, email, password } = await req.json();

        const existingUserVerifiedbyUsername = await User.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedbyUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 400
            })
        }

        const userByEmail = await User.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (userByEmail) {
            if(userByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                },{
                    status: 201
                }) 
            } else {
                const hashedPassword = await bcrypt.hash(password,10)
                userByEmail.password = hashedPassword;
                userByEmail.verifyCode = verifyCode;
                userByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await userByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const verifyCodeExpiry = new Date()
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1)

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: verifyCodeExpiry,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            console.log(newUser)

            await newUser.save();
        }

        const emailRespones = await sendVerificationEmail(email, username, verifyCode)

        if(!emailRespones.success){
            return Response.json({
                success: false,
                message: emailRespones.message
            },{
                status: 500
            })
        }

        return Response.json({
            success: true,
            message: "Email verification sent and user registered successfully"
        },{
            status: 201
        })

    } catch (error) {
        console.error("Error in user registration", error)
        return Response.json({
            success: false,
            message: "Error in user registration",
        }, {
            status: 500
        })
    }
}