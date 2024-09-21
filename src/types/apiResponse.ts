import { IMessage } from "@/models/messageModel";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<IMessage>;
}