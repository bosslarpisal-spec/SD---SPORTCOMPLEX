import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Invitation from "@/models/Invitation";
import Reservation from "@/models/Reservation";
import { sendInvitationEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("📩 INVITE BODY RECEIVED:", body);
    const { email, reservationId } = body;

    if (!email || !reservationId) {
      return NextResponse.json(
        { message: "Missing fields", received: { email, reservationId } },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sender = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!sender) {
      return NextResponse.json({ message: "Sender user not found" }, { status: 404 });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
    }
    const sportName = reservation.sport || "Sports Session";

    // ✅ FIX: receiver may not have an account — store email string instead
    const receiver = await User.findOne({ email: email.toLowerCase() });

    const exist = await Invitation.findOne({
      ...(receiver ? { receiver: receiver._id } : { receiverEmail: email.toLowerCase() }),
      reservation: reservationId,
    });
    if (exist) {
      return NextResponse.json({ message: "User already invited to this session" }, { status: 409 });
    }

    const invite = await Invitation.create({
      sender: sender._id,
      ...(receiver ? { receiver: receiver._id } : {}),
      receiverEmail: email.toLowerCase(), // always store email for lookup
      reservation: reservationId,
      status: "pending",
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    try {
      await sendInvitationEmail(email.toLowerCase(), sender.name, sportName, invite._id.toString());
    } catch (emailError) {
      console.error("Email failed but invite was created:", emailError);
    }

    return NextResponse.json(
      { message: "Invite sent and email notification triggered", invite },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("INVITE_SEND_ERROR:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}