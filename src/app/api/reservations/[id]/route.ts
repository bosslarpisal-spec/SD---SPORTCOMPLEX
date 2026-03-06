import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Reservation from "@/models/Reservation";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const reservation = await Reservation.findById(params.id);

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (reservation.userEmail !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (reservation.status !== "upcoming") {
    return NextResponse.json({ error: "Cannot cancel a non-upcoming reservation" }, { status: 400 });
  }

  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  await reservation.save();

  return NextResponse.json(reservation);
}
