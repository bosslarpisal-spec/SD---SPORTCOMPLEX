import mongoose, { Schema, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: String, required: true },
    facilityName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Upcoming", "Completed", "Cancelled"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

const Reservation = models.Reservation || mongoose.model("Reservation", ReservationSchema);
export default Reservation;
