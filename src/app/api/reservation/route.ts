// app/api/reservation/route.ts //
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Invitation from "@/models/Invitation";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ owned: [], received: [] }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ owned: [], received: [] });

    const ownedReservations = await Reservation.find({ hostName: user.name }).lean();
    
    const ownedWithInvites = await Promise.all(ownedReservations.map(async (res: any) => {
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
          expiresAt: i.expiresAt
        }))
      };
    }));

    const receivedInvites = await Invitation.find({ 
      receiver: user._id
    })
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
        role: "invitee"
      }));

    return NextResponse.json({ owned: ownedWithInvites, received: invitations });
  } catch (error: any) {
    return NextResponse.json({ owned: [], received: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const reservation = await Reservation.create(body);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error("POST_RESERVATION_ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// --- ADDED DELETE METHOD ---
export async function DELETE(req: Request) {
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