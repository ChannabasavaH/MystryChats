'use client'

import React from 'react'
import { IMessage } from '@/models/messageModel'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/apiResponse'

type MessageCardProp = {
    message: IMessage;
    onMessageDelete: (messageid: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProp) => {

    const { toast } = useToast()

    const handleDelete = async () => {
        try {
          const response = await axios.delete<ApiResponse>(
            `/api/delete-message/${message._id}`
          );
          toast({
            title: response.data.message,
          });
          onMessageDelete(message._id);
    
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: 'Error',
            description:
              axiosError.response?.data.message ?? 'Failed to delete message',
            variant: 'destructive',
          });
        } 
      };

    return (
        <Card className='flex justify-center items-center gap-4'>
            <CardHeader>
                <CardTitle className='text-center'>{message.content}</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className=''><X className='w-5 h-5'/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={ handleDelete }>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>
    )
}

export default MessageCard