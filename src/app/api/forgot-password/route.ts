import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    console.log("Checking email:", email); // Look for this in terminal

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    // Use findOneAndUpdate to force-create fields if they are missing
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          resetToken: resetToken, 
          resetTokenExpiry: resetTokenExpiry 
        } 
      },
      { new: true }
    );

    if (!user) {
      console.log("User not found in DB");
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    console.log("Token saved successfully in MongoDB");
    await sendResetPasswordEmail(user.email, resetToken);

    return NextResponse.json({ message: "Reset link sent!" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}