import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnection from '@/lib/dbConnection';
import User from '@/models/UserModel';
import mongoose from 'mongoose';
import Message from '@/models/messageModel';

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const { messageid: messageId } = params
  console.log("MessageId: ",messageId)
  await dbConnection();
  const session = await getServerSession(authOptions);
  const _user = session?.user;
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await User.updateOne(
      { _id: _user._id },
      { $pull: { messages: new mongoose.Types.ObjectId(messageId)}}
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    const deletedMessage = await Message.findOneAndDelete({_id: new mongoose.Types.ObjectId(messageId)})

    if(deletedMessage){
      return Response.json(
        {message: "Message is deleted", success: true},
        {status: 200}
      )
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}