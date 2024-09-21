import { z } from "zod";

export const messageSchema = z.object({
    content: z.string()
    .min(2,"Message must be minimum of 2 character")
    .max(300,"Message must be maximum of 200 character"),
})