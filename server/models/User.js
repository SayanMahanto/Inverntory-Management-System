// importing all packages
import mongoose from "mongoose";

// User Schema Configuration
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { type: String, unique: true, required: [true, "Email is required"] },
  password: { type: String, required: [true, "Password is required"] },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
});

// User model creating
const User = mongoose.model("User", userSchema);

// Exporting User
export default User;
