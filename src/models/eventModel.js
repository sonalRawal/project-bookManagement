const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const eventSchema = new mongoose.Schema(
  {
    eventTitle: { type: String, required: true, unique: true, trim: true },
    eventName: { type: String, required: true, trim: true },
    invitedUsers: { type: Array, required: true },
    createdBy: { type: ObjectId, required: true, trim: true, ref: "user" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("events", eventSchema);
