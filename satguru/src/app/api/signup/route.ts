import dbConnect from "../../../lib/dbConnect";
import User from "../../../model/User";
import bcrypt from "bcryptjs";
import { sendVerficationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect;

  try {
    const { username, email, passowrd } = await request.json();

    const existingUserName = await User.findOne({
      username,
      verified: true,
    });
  } catch (error) {
    console.log("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user from api/signup",
      },
      {
        status: 500,
      }
    );
  }
}
