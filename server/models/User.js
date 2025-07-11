// importing all packages
import mongoose from "mongoose";

// User Schema Configuration
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
});

// User model creating
const User = mongoose.model("User", userSchema);

// Exporting User
export default User;
