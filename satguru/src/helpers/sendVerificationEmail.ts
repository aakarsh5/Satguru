import { resend } from "../lib/resend";
import { ApiResponse } from "../types/ApiResponse";
import VerificationEmail from "../../email/VerificationEmail";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Satguru || Verification Code",
      react: VerificationEmail({username,otp: verifyCode}),);
      
    console.log("Email verification successful");
    return { success: true, message: "verification email sent successfully" };
  } catch (error) {
    console.log("Error verification email", error);
    return { success: false, message: "Error to verify email" };
  }
}
