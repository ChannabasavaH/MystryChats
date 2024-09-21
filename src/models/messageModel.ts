import mongoose, {Schema, Document} from  'mongoose';

export interface IMessage extends Document{
    _id: string,
    content: string,
    createdAt: Date,
}

const messageSchema = new Schema<IMessage>({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message",messageSchema)

export default Message;