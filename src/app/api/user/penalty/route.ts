// src/app/api/user/penalty/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean() as any;

    if (!user) {
      return NextResponse.json({ hasPenalty: false, penaltyUntil: null });
    }

    const now = new Date();
    const penaltyUntil = user.penaltyUntil ? new Date(user.penaltyUntil) : null;
    const hasPenalty = penaltyUntil !== null && penaltyUntil > now;

    return NextResponse.json({
      hasPenalty,
      penaltyUntil: hasPenalty ? penaltyUntil!.toISOString() : null,
    });
  } catch (error: any) {
    console.error("GET /api/user/penalty error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
