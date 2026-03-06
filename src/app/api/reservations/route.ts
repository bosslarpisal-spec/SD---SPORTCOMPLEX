import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";

export async function GET() {
  await connectDB();
  const reservations = await Reservation.find().sort({ createdAt: -1 });
  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const reservation = await Reservation.create(body);
  return NextResponse.json(reservation, { status: 201 });
}
