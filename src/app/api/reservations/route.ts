// src/app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { sendBookingSubmittedEmail, sendInvitationEmail } from "@/lib/mail";

const FIFTEEN_MIN = 15 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();
    const userEmail = session.user.email;

    // ✅ Cleanup: Delete cancelled reservations older than 15 minutes
    await Reservation.deleteMany({
      userEmail,
      cancelledAt: { $lte: new Date(now.getTime() - FIFTEEN_MIN) },
    });

    // ✅ Auto-cancel sports with unmet threshold after countdown expires
    const pendingSports = await Reservation.find({
      userEmail,
      status: "upcoming",
      facilityType: "sports",
      countdownDeadline: { $lt: now },
    });

    for (const r of pendingSports) {
      const accepted =
        r.invitees?.filter((i: { status: string }) => i.status === "accepted").length || 0;
      const threshold = Math.ceil((r.minPlayers ?? 2) / 2);

      if (accepted < threshold) {
        r.status = "cancelled";
        r.cancelledAt = now;
        await r.save();
      }
    }

    // ✅ Fetch owned reservations by userEmail
    const ownedReservations = await Reservation.find({ userEmail }).lean();

    const ownedWithInvites = await Promise.all(
      ownedReservations.map(async (res: any) => {
        const invites = await Invitation.find({ reservation: res._id })
          .populate("receiver", "email name")
          .lean();

        return {
          ...res,
          id: res._id.toString(),
          role: "host" as const,
          invitationDetails: invites.map((i: any) => ({
            email: i.receiver?.email || i.receiverEmail || "Unknown",
            name: i.receiver?.name || "Unknown",
            status: i.status,
            expiresAt: i.expiresAt?.toISOString(),
          })),
        };
      })
    );

    // ✅ Fetch received invitations
    const user = await User.findOne({ email: userEmail });
    const receivedInvites = user
      ? await Invitation.find({ receiver: user._id })
          .populate("sender", "name email")
          .populate("reservation")
          .lean()
      : [];

    const invitations = receivedInvites
      .filter((inv: any) => inv.reservation && inv.sender)
      .map((inv: any) => ({
        ...inv.reservation,
        id: inv.reservation._id.toString(),
        invitationId: inv._id.toString(),
        senderName: inv.sender.name,
        senderEmail: inv.sender.email,
        expiresAt: inv.expiresAt?.toISOString(),
        inviteStatus: inv.status,
        role: "invitee" as const,
      }));

    return NextResponse.json({
      owned: ownedWithInvites,
      received: invitations,
    });
  } catch (error: any) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      { owned: [], received: [], error: error.message },
      { status: 500 }
    );
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

    // ✅ Parse time safely
    const startH = parseInt(body.startTime?.split(":")[0] ?? "0", 10);
    const endH = parseInt(body.endTime?.split(":")[0] ?? "0", 10);
    const duration = Math.max(1, endH - startH);

    // ✅ Set countdown for sports (1 hour from now)
    const isSports = body.facilityType === "sports";
    const countdownDeadline = isSports
      ? new Date(Date.now() + 60 * 60 * 1000)
      : undefined;

    const { invitees: rawInvitees, ...restBody } = body;

    // ✅ DEBUG: Log what we received
    console.log("📤 RECEIVED invitees:", rawInvitees);
    console.log("📤 RECEIVED isSports:", isSports);
    console.log("📤 RECEIVED facilityName:", body.facilityName);

    // ✅ Create reservation with correct fields
    const reservation = await Reservation.create({
      ...restBody,
      userId: (session.user as { id?: string }).id ?? session.user.email,
      userEmail: session.user.email,
      duration,
      status: "upcoming",
      countdownDeadline,
      minPlayers: body.minPlayers || 2,
      invitees: (rawInvitees ?? []).map((item: string | { email: string }) => ({
        email: typeof item === "string" ? item : item.email,
        status: "pending",
      })),
    });

    console.log("✅ Reservation created:", reservation._id);

    // ✅ Send email to host
    try {
      const hostEmail = session.user.email;
      const hostName = session.user.name || hostEmail;
      const sport = body.facilityName || body.facilityType || "Sports";
      const date = body.date || "TBD";
      const timeSlot =
        body.startTime && body.endTime
          ? `${body.startTime} - ${body.endTime}`
          : "TBD";

      await sendBookingSubmittedEmail(hostEmail, hostName, sport, date, timeSlot);
      console.log("✅ Host email sent to", hostEmail);
    } catch (emailErr) {
      console.error("❌ Booking submitted email failed:", emailErr);
    }

    // ✅ CREATE INVITATION DOCUMENTS AND SEND EMAILS TO INVITEES (ONLY FOR SPORTS)
    if (isSports && rawInvitees && rawInvitees.length > 0) {
      console.log("📧 Creating invitations for", rawInvitees.length, "invitees");
      
      const sender = await User.findOne({ email: session.user.email.toLowerCase() });
      const sportName = body.facilityName || body.facilityType || "Sports";
      const date = body.date || "TBD";
      const timeSlot =
        body.startTime && body.endTime
          ? `${body.startTime} - ${body.endTime}`
          : "TBD";

      for (const inviteeItem of rawInvitees) {
        const inviteeEmail = typeof inviteeItem === "string" ? inviteeItem : inviteeItem.email;
        console.log(`📧 Processing invitee: ${inviteeEmail}`);

        try {
          // ✅ Find receiver user (may not have account)
          const receiver = await User.findOne({ email: inviteeEmail.toLowerCase() });

          // ✅ Create invitation document
          const invitation = await Invitation.create({
            sender: sender?._id,
            ...(receiver ? { receiver: receiver._id } : {}),
            receiverEmail: inviteeEmail.toLowerCase(),
            reservation: reservation._id,
            status: "pending",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
          });
          console.log(`✅ Invitation created for ${inviteeEmail}:`, invitation._id.toString());

          // ✅ Send invitation email
          try {
            const emailResult = await sendInvitationEmail(
              inviteeEmail.toLowerCase(),
              session.user.name || session.user.email,
              sportName,
              invitation._id.toString(),
              date,
              timeSlot
            );
            console.log(`✅ Invitation email sent to ${inviteeEmail}:`, emailResult);
          } catch (emailErr) {
            console.error(`❌ Failed to send invitation email to ${inviteeEmail}:`, emailErr);
          }
        } catch (inviteErr) {
          console.error(`❌ Failed to create invitation for ${inviteeEmail}:`, inviteErr);
        }
      }
      console.log("📧 Finished creating invitations");
    } else {
      if (!isSports) console.log("📧 Not a sports facility - skipping invitations");
      if (!rawInvitees?.length) console.log("📧 No invitees - skipping invitations");
    }

    return NextResponse.json(
      {
        ...reservation.toObject(),
        id: reservation._id.toString(),
        role: "host",
      },
      { status: 201 }
    );
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

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    // ✅ Verify ownership before delete
    const reservation = await Reservation.findById(id);
    if (reservation?.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Reservation.findByIdAndDelete(id);
    await Invitation.deleteMany({ reservation: id });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    // ✅ Verify ownership
    const reservation = await Reservation.findById(id);
    if (reservation?.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (reservation.status !== "upcoming") {
      return NextResponse.json(
        { message: "Only upcoming reservations can be cancelled" },
        { status: 400 }
      );
    }

    // ✅ Mark as cancelled
    reservation.status = "cancelled";
    reservation.cancelledAt = new Date();
    await reservation.save();

    return NextResponse.json({
      message: "Cancelled",
      reservation: reservation.toObject(),
    });
  } catch (error: any) {
    console.error("PATCH_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}