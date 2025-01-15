const mongoose = require("mongoose");
const addressSchema = require("./address").schema; // Import the schema, not the model
 
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    guestId: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    role: { type: String, default: "user" }, // Default role is "user"
    addresses: [addressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
