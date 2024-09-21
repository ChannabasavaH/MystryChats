'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { IMessage } from '@/models/messageModel'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptingMessage } from '@/schema/isAcceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/apiResponse'
import MessageCard from '@/components/MessageCard'
import { Loader2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { User } from 'next-auth'

const Dashboard = () => {

  const [messages, setMessages] = useState<IMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const { toast } = useToast()

  const handleDeleteMessage = (messageid: string) => {
    setMessages(messages.filter((messages) => messages._id !== messageid))
  }

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptingMessage)
  })

  const { register, watch, setValue } = useForm()
  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const res = await axios.get<ApiResponse>('/api/accepting-message')
      setValue('acceptMessages', res.data?.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to fetch messgages",
        variant: "destructive"
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue]) 

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setLoading(true)
    setIsSwitchLoading(false)
    try {
      const res = await axios.get<ApiResponse>('/api/get-message')
      setMessages(res.data.messages || [])
      if (refresh) {
        toast({
          title: "Refreshed Messages",
          description: "Latest Messages fetched successfully",
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to fetch messgages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setLoading, setMessages, toast])

  useEffect(() => {
    if (!session || !session.user) {
      return
    }

    fetchMessages()
    fetchAcceptMessage()

  }, [fetchAcceptMessage, fetchMessages, session, setValue, toast,]) 

  useEffect(() => {
    const storedValue = localStorage.getItem('acceptMessages')
    if (storedValue) {
      setValue('acceptMessages', JSON.parse(storedValue))
    }
  }, [])

  const handleSwitchChange = async () => {
    setLoading(true)
    try {
      const res = await axios.post<ApiResponse>('/api/accepting-message', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: res.data.message,
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to fetch messgages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session || !session.user) {
    return <div>Please Login</div>
  }

  const { username } = session?.user as User

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };


  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl text-black">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div> 
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard