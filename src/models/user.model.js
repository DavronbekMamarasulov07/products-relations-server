import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true},
}, {
    versionKey: false,
    timestamps:true
});

// 🔥 REGISTER vaqtida HASH
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // next() kerak emas

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User = mongoose.model("User", userSchema)