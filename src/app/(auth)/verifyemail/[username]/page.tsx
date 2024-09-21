'use client'

import { useToast } from '@/hooks/use-toast'
import { verifySchema } from '@/schema/verifyCodeSchema'
import * as z from 'zod'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/apiResponse'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Verify = () => {

    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()

    const register = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const res = await axios.post(`/api/verifyemail`, {
                username: params.username,
                code: data.code,
            })
            toast({
                title: "Success",
                description: res.data.message ?? "Account verified successfully"
            })
            router.replace('/signin')
        } catch (error) {
            console.error("Error in verifying", error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message ?? "Error in verifying, please try again later"
            toast({
                title: "Verification Failed",
                description: errorMessage,
                variant: "destructive"
            })
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-black tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4 text-black">Enter the verification code sent to your email</p>
                </div>
                <Form {...register}>
                    <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="code"
                            control={register.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-black">Code</FormLabel>
                                    <Input {...field} placeholder='code' type='text' className="border-2 hover:border-black text-black" />
                                    <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full'>Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default Verify
