import { z } from "zod";

export const messageSchema = z.object({
  messageSchema: z.string().min(4, { message: "must contain atleast 4 words" }),
});
