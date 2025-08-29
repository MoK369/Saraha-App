import mongoose, { SchemaTypes } from "mongoose";
import { genderEnum } from "../../utils/constants/enum.constants.js";
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
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.male,
    },
    phone: String,
    confirmEmail: Date,
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
  restObj.phone = decryptText({
    ciphertext: restObj.phone,
    secretKey:process.env.SECRETE_KEY,
  });
  return {
    id,
    fullName,
    ...restObj,
  };
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
