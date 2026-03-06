import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    // Account linking: Google user adding a password to enable credentials login
    if (!existing.password) {
      const hashed = await bcrypt.hash(password, 10);
      existing.password = hashed;
      await existing.save();
      return NextResponse.json({ message: "Password added to existing account" }, { status: 200 });
    }
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, provider: "credentials" });

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}