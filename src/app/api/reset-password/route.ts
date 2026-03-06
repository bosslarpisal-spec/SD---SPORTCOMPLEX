import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    // 1. Find user with valid token and check if it hasn't expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // 2. Hash the new password and save it
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // 3. Clear reset fields so the link can't be used again
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    
    await user.save();

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset API Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}