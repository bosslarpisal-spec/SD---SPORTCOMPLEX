// src/app/api/reservation/check-expired/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";
import { sendReservationCancelledEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { reservationId } = await req.json();
    if (!reservationId) return NextResponse.json({ message: "Missing reservationId" }, { status: 400 });

    const reservation = await Reservation.findById(reservationId);
    if (!reservation || reservation.status !== "upcoming") {
      return NextResponse.json({ message: "Not applicable" });
    }

    const allInvites = await Invitation.find({ reservation: reservationId });
    const now = new Date();

    // Check if ALL invitations have expired and none accepted
    const allExpired = allInvites.every((i: any) => new Date(i.expiresAt) < now);
    const anyAccepted = allInvites.some((i: any) => i.status === "accepted");

    if (allExpired && !anyAccepted) {
      // Cancel the reservation
      reservation.status = "cancelled";
      reservation.cancelledAt = now;
      await reservation.save();

      // Mark all pending invites as expired
      await Invitation.updateMany(
        { reservation: reservationId, status: "pending" },
        { status: "expired" }
      );

      // Send cancellation email to host
      try {
        const timeSlot =
          reservation.startTime && reservation.endTime
            ? `${reservation.startTime} - ${reservation.endTime}`
            : "TBD";
        await sendReservationCancelledEmail(
          reservation.userEmail,
          reservation.userEmail,
          reservation.facilityName || "Sports",
          reservation.date || "TBD",
          timeSlot
        );
      } catch (emailErr) {
        console.error("Cancel email failed:", emailErr);
      }

      return NextResponse.json({ cancelled: true });
    }

    return NextResponse.json({ cancelled: false });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}