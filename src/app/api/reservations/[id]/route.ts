import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import User from "@/models/User";
import { sendPenaltyEmail } from "@/lib/mail";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

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
  if (!["upcoming", "completed"].includes(reservation.status)) {
    return NextResponse.json(
      { error: "Cannot cancel a reservation that is not upcoming or confirmed" },
      { status: 400 }
    );
  }

  // Cannot cancel after the booking has started
  const bookingStart = new Date(`${reservation.date}T${reservation.startTime}:00`);
  if (new Date() >= bookingStart) {
    return NextResponse.json(
      { error: "Cannot cancel a reservation that has already started" },
      { status: 400 }
    );
  }

  const wasCompleted = reservation.status === "completed";

  reservation.status = "cancelled";
  reservation.cancelledAt = new Date();
  await reservation.save();

  // Apply 24-hour booking penalty if host cancelled a confirmed reservation
  if (wasCompleted) {
    try {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        user.penaltyUntil = new Date(Date.now() + TWENTY_FOUR_HOURS);
        await user.save();
        await sendPenaltyEmail(user.email, user.name, user.penaltyUntil);
      }
    } catch (penaltyErr) {
      console.error("Penalty application failed:", penaltyErr);
    }
  }

  return NextResponse.json(reservation);
}
