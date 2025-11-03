import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // ✅ Clerk user ID is a string
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;
