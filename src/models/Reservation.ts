import mongoose, { Schema, models } from "mongoose";

const InviteeSchema = new Schema({
  email:  { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
}, { _id: false });

const ReservationSchema = new Schema(
  {
    userId:            { type: String, required: true },
    userEmail:         { type: String, required: true },
    facilityId:        { type: Number, required: true },
    facilityType:      { type: String, required: true }, // "sports" | "coworking" | "canteen"
    facilityName:      { type: String, required: true },
    slot:              { type: String, required: true }, // "Field 1", "Court 3", "T15", etc.
    date:              { type: String, required: true }, // "YYYY-MM-DD"
    startTime:         { type: String, required: true }, // "08:00"
    endTime:           { type: String, required: true }, // "10:00"
    duration:          { type: Number, required: true }, // hours (1–3)
    minPlayers:        { type: Number },                 // sports only
    invitees:          { type: [InviteeSchema], default: [] },
    status:            { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    countdownDeadline: { type: Date },                   // createdAt + 1 hour (sports only)
    cancelledAt:       { type: Date },
  },
  { timestamps: true }
);

const Reservation = models.Reservation || mongoose.model("Reservation", ReservationSchema);
export default Reservation;
