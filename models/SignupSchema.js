import mongoose from "mongoose";

const SignupSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    isVerified: { type: Boolean, default: false },
    VerificationCode: { type: String, default: null },
    StudentID: {
      front: { type: Buffer, default: null },
      back: { type: Buffer, default: null },
    },
    Emergency_Contacts: { type: Array, default: null },
    Routes: { type: Array, default: null },
    Notifications: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", SignupSchema);

export default Users;
