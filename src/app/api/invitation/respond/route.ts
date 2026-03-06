import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";
import { sendAcceptanceEmail, sendDeclineEmail, sendReservationConfirmedEmail } from "@/lib/mail";

// GET — fetch invitation details by ID
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const invitation = await Invitation.findById(id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("reservation")
      .lean();

    if (!invitation) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ invitation });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST — accept or decline
export async function POST(req: Request) {
  try {
    await connectDB();
    const { invitationId, response, guestName } = await req.json();
    if (!invitationId || !response) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const invitation = await Invitation.findById(invitationId)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("reservation");

    if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });
    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ message: "Expired" }, { status: 410 });
    }
    if (invitation.status !== "pending") {
      return NextResponse.json({ message: "Already responded" }, { status: 409 });
    }

    invitation.status = response;
    await invitation.save();

    const sport = invitation.reservation?.sport || "Sports Session";
    const hostEmail = (invitation.sender as any)?.email;

    // ✅ FIX: use guestName for no-account users, fallback to receiver name or email
    const participantName =
      guestName ||
      (invitation.receiver as any)?.name ||
      invitation.receiverEmail ||
      "Someone";

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

    // ✅ FIX: Auto-confirm if >50% of invitees accepted
    if (response === "accepted") {
      const reservationId = invitation.reservation?._id;
      const allInvites = await Invitation.find({ reservation: reservationId });
      const totalInvited = allInvites.length;
      const totalAccepted = allInvites.filter((i: any) => i.status === "accepted").length;

      const reservation = await Reservation.findById(reservationId);
      const majority = totalInvited > 0 && totalAccepted > totalInvited / 2;

      if (majority && reservation && reservation.status !== "confirmed") {
        reservation.status = "confirmed";
        await reservation.save();

        // Send confirmation email to host
        try {
          await sendReservationConfirmedEmail(
            hostEmail,
            (invitation.sender as any)?.name || "Host",
            sport,
            reservation.date,
            reservation.timeSlot,
            totalAccepted,
            totalInvited
          );
        } catch (emailErr) {
          console.error("Confirmation email failed:", emailErr);
        }
      }
    }

    return NextResponse.json({ message: `Invitation ${response}` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}