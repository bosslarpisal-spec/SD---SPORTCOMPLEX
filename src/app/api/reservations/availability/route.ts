import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";

// GET /api/reservations/availability?facilityId=1&date=2025-03-10&slot=Field+1
// Returns booked time ranges for that slot on that date so the UI can grey them out.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const date       = searchParams.get("date");
  const slot       = searchParams.get("slot");

  if (!facilityId || !date || !slot) {
    return NextResponse.json({ error: "facilityId, date and slot are required" }, { status: 400 });
  }

  await connectDB();

  const bookings = await Reservation.find({
    facilityId: Number(facilityId),
    date,
    slot,
    status: { $ne: "cancelled" },
  }).select("startTime endTime -_id");

  // Return array of { startTime, endTime } so the client can check overlap
  return NextResponse.json(bookings);
}
