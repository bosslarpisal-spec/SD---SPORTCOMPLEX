// models/Reservation.ts //
import mongoose, { Schema, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    sport: { type: String, required: true },
    hostName: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    participants: { type: [String], default: [] },
    minParticipants: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ["active", "confirmed", "cancelled"], // ✅ added "confirmed"
      default: "active",
    },
  },
  { timestamps: true }
);

const Reservation = models.Reservation || mongoose.model("Reservation", ReservationSchema);
export default Reservation;