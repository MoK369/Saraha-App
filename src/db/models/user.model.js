import mongoose, { Types } from "mongoose";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../utils/constants/enum.constants.js";
import { decryptText } from "../../utils/security/encrypt.security.js";

const userSchema = new mongoose.Schema(
  {

    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system;
      },
    },
    oldPasswords: [String],
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system;
      },
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.male,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    picture: String,
    confirmEmail: Date,
    confirmEmailOtp: String,
    deletedAt: Date,
    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    restoredAt: Date,
    restoredBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    forgotPasswordOtp: String,
    forgotPasswordOtpCreatedAt: Date,
    forgotPasswordOtpVerifiedAt: Date,
    forgotPasswordOtpCounts: Number,
    changeCredentialsTime: Date,
    profilePicture: String,
    coverImages: [String]
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.methods.toJSON = function () {
  const { id, fullName, ...restObj } = this.toObject();
  delete restObj._id;
  delete restObj.firstName;
  delete restObj.lastName;
  delete restObj.password;
  delete restObj.oldPasswords;
  delete restObj.forgotPasswordOtpCreatedAt;
  delete restObj.forgotPasswordOtpCounts;
  restObj.phone = decryptText({
    ciphertext: restObj.phone,
    secretKey: process.env.SECRETE_KEY,
  });
  return {
    id,
    fullName,
    ...restObj,
  };
};

userSchema.methods.getImageUrl = function (req,imagePath) {
  return `${req.protocol}://${req.get("host")}/${imagePath}`;
};


const UserModel = mongoose.model("User", userSchema);

export default UserModel;
