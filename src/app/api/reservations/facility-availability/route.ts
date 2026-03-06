import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";

// GET /api/reservations/facility-availability?facilityId=1&date=2025-03-10
// Returns bookings grouped by slot: { "Field 1": [{startTime, endTime}], ... }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const date       = searchParams.get("date");

  if (!facilityId || !date) {
    return NextResponse.json({ error: "facilityId and date are required" }, { status: 400 });
  }

  await connectDB();

  const bookings = await Reservation.find({
    facilityId: Number(facilityId),
    date,
    status: { $ne: "cancelled" },
  }).select("slot startTime endTime -_id");

  // Group by slot name
  const grouped: Record<string, { startTime: string; endTime: string }[]> = {};
  for (const b of bookings) {
    if (!grouped[b.slot]) grouped[b.slot] = [];
    grouped[b.slot].push({ startTime: b.startTime, endTime: b.endTime });
  }

  return NextResponse.json(grouped);
}
