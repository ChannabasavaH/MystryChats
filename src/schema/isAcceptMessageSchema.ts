import { z } from "zod";

export const acceptingMessage = z.object({
    acceptMessage: z.boolean()
})