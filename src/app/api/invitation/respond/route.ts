// app/api/invitation/respond/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";
import {
  sendAcceptanceEmail,
  sendDeclineEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
} from "@/lib/mail";

// GET — fetch invitation details by ID
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const invitation = await Invitation.findById(id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("reservation")
      .lean();

    if (!invitation) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ invitation });
  } catch (err: any) {
    console.error("GET invitation error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST — accept or decline invitation
export async function POST(req: Request) {
  try {
    await connectDB();
    const { invitationId, response, guestName } = await req.json();

    if (!invitationId || !response) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (!["accepted", "declined"].includes(response)) {
      return NextResponse.json({ message: "Invalid response" }, { status: 400 });
    }

    const invitation = await Invitation.findById(invitationId)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("reservation");

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);

    if (now > expiresAt) {
      return NextResponse.json({ message: "Invitation expired" }, { status: 410 });
    }

    // Check if already responded
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { message: `Already ${invitation.status}` },
        { status: 409 }
      );
    }

    // Update invitation status
    invitation.status = response;
    await invitation.save();

    const sport = invitation.reservation?.facilityName || "Sports";
    const hostEmail = (invitation.sender as any)?.email;
    const participantName =
      guestName || (invitation.receiver as any)?.name || "Someone";

    // Notify host of accept/decline
    try {
      if (response === "accepted") {
        await sendAcceptanceEmail(hostEmail, participantName, sport);
      } else {
        await sendDeclineEmail(hostEmail, participantName, sport);
      }
    } catch (emailErr) {
      console.error("Notify host email failed:", emailErr);
    }

    const reservationId = invitation.reservation?._id;

    if (response === "accepted") {
      // Check if majority accepted (>50%)
      const allInvites = await Invitation.find({ reservation: reservationId });
      const totalInvited = allInvites.length;
      const totalAccepted = allInvites.filter(
        (i: any) => i.status === "accepted"
      ).length;

      const reservation = await Reservation.findById(reservationId);

      // Strict majority: accepted > total/2
      const isMajority = totalAccepted > totalInvited / 2;

      if (isMajority && reservation && reservation.status === "upcoming") {
        // Mark as completed (confirmed)
        reservation.status = "completed";
        await reservation.save();

        // Send confirmation email to host
        try {
          const date = reservation.date || "TBD";
          const timeSlot =
            reservation.startTime && reservation.endTime
              ? `${reservation.startTime} - ${reservation.endTime}`
              : "TBD";

          await sendReservationConfirmedEmail(
            hostEmail,
            (invitation.sender as any)?.name || "Host",
            sport,
            date,
            timeSlot,
            totalAccepted,
            totalInvited
          );
        } catch (emailErr) {
          console.error("Confirmation email failed:", emailErr);
        }
      }
    } else {
      // response === "declined" — check if ALL invitees have now declined
      const allInvites = await Invitation.find({ reservation: reservationId });
      const allDeclined = allInvites.every(
        (i: any) => i.status === "declined" || i.status === "expired"
      );

      if (allDeclined) {
        const reservation = await Reservation.findById(reservationId);
        if (reservation && reservation.status === "upcoming") {
          reservation.status = "cancelled";
          reservation.cancelledAt = now;
          await reservation.save();

          try {
            const date = reservation.date || "TBD";
            const timeSlot =
              reservation.startTime && reservation.endTime
                ? `${reservation.startTime} - ${reservation.endTime}`
                : "TBD";
            await sendReservationCancelledEmail(
              reservation.userEmail,
              reservation.userEmail,
              sport,
              date,
              timeSlot
            );
          } catch (emailErr) {
            console.error("All-declined cancellation email failed:", emailErr);
          }
        }
      }
    }

    return NextResponse.json({
      message: `Invitation ${response}`,
      status: response,
    });
  } catch (err: any) {
    console.error("POST invitation error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}