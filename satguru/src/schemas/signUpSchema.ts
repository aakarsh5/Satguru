import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 3 letters")
  .max(20, "Username must be under 20 letters");

export const signupSchema = z.object({});
