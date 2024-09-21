import { z } from "zod";

export const usernameValidation = 
    z.string()
    .min(4,"Username must be minimum of 4 characters")
    .max(20,"Username must me maximum of 20 characters")
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character")

export const SignUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email"}),
    password: z.string()
    .min(6,"Password must be a minimum of 6 character")
    .max(20,"password must be miximum of 30 character")
})


