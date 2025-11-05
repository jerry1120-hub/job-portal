import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // Clerk user ID
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: '' },
});

const User = mongoose.model('User', userSchema);
export default User;
