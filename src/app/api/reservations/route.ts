// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB  from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { sendBookingSubmittedEmail } from "@/lib/mail";

const FIFTEEN_MIN = 15 * 60 * 1000;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Return both owned reservations (with invite details) and received invitations
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") ?? session.user.email;

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ owned: [], received: [] });

    const ownedReservations = await Reservation.find({ hostName: user.name }).lean();
    const ownedWithInvites = await Promise.all(
      ownedReservations.map(async (res: any) => {
        const invites = await Invitation.find({ reservation: res._id })
          .populate("receiver", "email")
          .lean();
        return {
          ...res,
          id: res._id.toString(),
          role: "host",
          invitationDetails: invites.map((i: any) => ({
            email: i.receiver?.email || i.receiverEmail || "Unknown",
            status: i.status,
          })),
        };
      })
    );

    const receivedInvites = await Invitation.find({ receiver: user._id })
      .populate("sender", "name")
      .populate("reservation")
      .lean();

    const invitations = receivedInvites
      .filter((inv: any) => inv.reservation && inv.sender)
      .map((inv: any) => ({
        ...inv.reservation,
        id: inv.reservation._id.toString(),
        invitationId: inv._id.toString(),
        senderName: inv.sender.name,
        expiresAt: inv.expiresAt,
        inviteStatus: inv.status,
        role: "invitee",
      }));

    return NextResponse.json({ owned: ownedWithInvites, received: invitations });
  } catch (error: any) {
    return NextResponse.json({ owned: [], received: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    const startH = parseInt(body.startTime?.split(":")[0] ?? "0", 10);
    const endH = parseInt(body.endTime?.split(":")[0] ?? "0", 10);
    const duration = endH - startH;

    const isSports = body.facilityType === "sports";
    const countdownDeadline = isSports
      ? new Date(Date.now() + 60 * 60 * 1000)
      : undefined;

    const reservation = await Reservation.create({
      userId:           (session.user as { id?: string }).id ?? session.user.email,
      userEmail:        session.user.email,
      facilityId:       body.facilityId,
      facilityType:     body.facilityType,
      facilityName:     body.facilityName,
      slot:             body.slot,
      date:             body.date,
      startTime:        body.startTime,
      endTime:          body.endTime,
      duration,
      minPlayers:       body.minPlayers,
      invitees:         (body.invitees ?? []).map((email: string) => ({ email, status: "pending" })),
      status:           "upcoming",
      countdownDeadline,
      ...body, // spread remaining fields (sport, timeSlot, hostName, etc.)
    });

    // Send booking submitted email to host
    try {
      const hostEmail = session.user.email;
      const hostName = session.user.name || hostEmail;
      await sendBookingSubmittedEmail(
        hostEmail,
        hostName,
        reservation.sport,
        reservation.date,
        reservation.timeSlot
      );
    } catch (emailErr) {
      console.error("Booking submitted email failed:", emailErr);
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error("POST_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await Reservation.findByIdAndDelete(id);
    await Invitation.deleteMany({ reservation: id });

    return NextResponse.json({ message: "Canceled" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}