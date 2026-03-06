// models/Invitation.ts //
import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null if no account
    receiverEmail: { type: String, required: true, lowercase: true }, // ✅ always stored
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);