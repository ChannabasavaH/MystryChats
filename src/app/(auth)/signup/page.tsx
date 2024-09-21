'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { SignUpSchema } from "@/schema/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/apiResponse"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const Page = () => {

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const debounced = useDebounceCallback((value: string) => {
        setUsername(value)
    }, 500);

    const { toast } = useToast()
    const router = useRouter()

    const register = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })


    const checkUsernameUnique = async () => {
        setIsCheckingUsername(true);
        try {
            const res = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`);
            console.log(res.data);
            setUsernameMessage(res.data.message);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            setUsernameMessage(axiosError.response?.data.message ?? 'Error in checking username');
        } finally {
            setIsCheckingUsername(false);
        }
    };

    useEffect(() => {
        if (username) {
            checkUsernameUnique();
        }
    }, [username])

    const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
        try {
            setIsSubmitting(true)
            const res = await axios.post<ApiResponse>('/api/signup', data)
            console.log(res)
            toast({
                title: "Success",
                description: res.data.message
            })
            router.replace(`verifyemail/${username}`)
        } catch (error) {
            console.error("Error in signup", error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message ?? "Error in signing up, please try again later"
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-black tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4 text-black">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...register}>
                    <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            debounced(e.target.value);
                                        }}
                                        className="border-2 hover:border-black text-black"
                                    />
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p
                                            className={`text-sm ${usernameMessage === 'Username is unique'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                                }`}
                                        >
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Email</FormLabel>
                                    <Input {...field} name="email" className="border-2 hover:border-black text-black" />
                                    <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Password</FormLabel>
                                    <Input type="password" {...field} name="password" className="border-2 hover:border-black text-black" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4 text-black">
                    <p>
                        Already a member?{' '}
                        <Link href="/signin" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div >
    )
}

export default Page