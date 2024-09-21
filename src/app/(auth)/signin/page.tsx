'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SignInSchema } from "@/schema/signInScheam"
import { getSession, signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  const register = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setIsSubmitting(true)
    try {
      const res = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password
      })

      console.log(res)

      if (res?.error) {
        if (res.error === 'CredentialsSignin') {
          toast({
            title: "SignIn Failed",
            description: "Invalid Credentials",
            variant: "destructive"
          })
        }
      }
      if (res?.url) {
        router.replace('/dashboard')
      }
    } catch (error) {
      toast({
        title: "SignIn Failed",
        description: "Error in signin",
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
          <p className="mb-4 text-black">Sign in to start your anonymous adventure</p>
        </div>
        <Form {...register}>
          <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Email/Username</FormLabel>
                  <Input {...field} name="email/username" className="border-2 hover:border-black text-black" />
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
                'Login'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4 text-black">
          <p>
            Create an Account{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div >
  )
}

export default Page