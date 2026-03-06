import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";

const FIFTEEN_MIN = 15 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const now = new Date();

  // Lazy cleanup: permanently delete cancelled reservations older than 15 minutes
  await Reservation.deleteMany({
    userEmail: session.user.email,
    cancelledAt: { $lte: new Date(now.getTime() - FIFTEEN_MIN) },
  });

  // Lazy auto-cancel: sports past countdown with not enough accepts
  const pendingSports = await Reservation.find({
    userEmail: session.user.email,
    status: "upcoming",
    facilityType: "sports",
    countdownDeadline: { $lt: now },
  });
  for (const r of pendingSports) {
    const accepted = r.invitees.filter((i: { status: string }) => i.status === "accepted").length;
    const threshold = Math.ceil((r.minPlayers ?? 2) / 2);
    if (accepted < threshold) {
      r.status = "cancelled";
      r.cancelledAt = now;
      await r.save();
    }
  }

  const reservations = await Reservation.find({ userEmail: session.user.email }).sort({ createdAt: -1 });
  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  const startH   = parseInt(body.startTime?.split(":")[0] ?? "0", 10);
  const endH     = parseInt(body.endTime?.split(":")[0]   ?? "0", 10);
  const duration = endH - startH;

  const isSports = body.facilityType === "sports";
  const countdownDeadline = isSports ? new Date(Date.now() + 60 * 60 * 1000) : undefined;

  const reservation = await Reservation.create({
    userId:            (session.user as { id?: string }).id ?? session.user.email,
    userEmail:         session.user.email,
    facilityId:        body.facilityId,
    facilityType:      body.facilityType,
    facilityName:      body.facilityName,
    slot:              body.slot,
    date:              body.date,
    startTime:         body.startTime,
    endTime:           body.endTime,
    duration,
    minPlayers:        body.minPlayers,
    invitees:          (body.invitees ?? []).map((email: string) => ({ email, status: "pending" })),
    status:            "upcoming",
    countdownDeadline,
  });

  return NextResponse.json(reservation, { status: 201 });
}
