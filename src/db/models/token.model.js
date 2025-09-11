import mongoose, { Types } from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresIn: {
      type: Number,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TokenModel = mongoose.model("Token", tokenSchema);
TokenModel.syncIndexes()

export default TokenModel;
