import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    avatar: { type: String, default: "/src/assets/images/01.jpg" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);
    
const UserModel = mongoose.model("users", userSchema);

export default UserModel;
