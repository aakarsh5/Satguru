import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 3 letters")
  .max(20, "Username must be under 20 letters");

export const signupSchema = z.object({
    username: usernameValidation,
    email: z.string().email(,{message:"Invalid email address"}),
    password: z.string().min(5,{message:"Password must be atleast 5 charecter"})
});
