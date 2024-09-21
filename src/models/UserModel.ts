import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from './messageModel'


export interface IUser extends Document{
    username: string,
    email: string,
    password: string,
    verifyCode: string,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessage: boolean,
    messages: IMessage[]
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/i, "Please use a valid email"]
    },
    password: {
        type: String,
        required: true
    },
    verifyCode: {
        type: String,
        required: true
    },
    verifyCodeExpiry: {
        type: Date,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: false
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "Message",
    }]
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User;