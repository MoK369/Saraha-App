import Joi from "joi";
import { Types } from "mongoose";
import { genderEnum } from "./enum.constants.js";

const generalFields = {
  fullName: Joi.string()
    .pattern(new RegExp(/^[A-Z][a-z]{2,14}\s[A-Z][a-z]{2,14}$/))
    .messages({
      "string.pattern.base":
        "fullName must be two words separated by a space, each one starts with a capital letter, with each word maximum 15 characters",
    }),
  name: Joi.string()
    .pattern(new RegExp(/^[A-Z][a-z]{2,14}$/))
    .messages({
      "string.pattern.base":
        "name must be one word, starts with a capital letter, with maximum 15 characters",
    }),
  email: Joi.string()
    .pattern(
      new RegExp(
        /^[a-zA-Z]{1,}\d{0,}[a-zA-Z0-9]{1,}[@](gmail|outlook)(\.com|\.edu|\.net){1,3}$/
      )
    )
    .messages({
      "string.pattern.base": "invalid email format",
    }),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))

    .messages({
      "string.pattern.base":
        "password must be 8 charactors long, includes at least one capital letter, small letter, number and special character",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
  gender: Joi.string().valid(...Object.values(genderEnum)),
  phone: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
  otp: Joi.string()
    .pattern(new RegExp(/^\d{6,6}$/))
    .messages({
      "string.pattern.base": "otp must be 6 digits long",
    }),
  token: Joi.string()
    .pattern(new RegExp(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/))
    .messages({
      "string.pattern.base":
        "token must consists of three segments separated by dot, each has any number of characters in [A-Za-z0-9-_]",
    }),
  authorization: Joi.string()
    .pattern(
      new RegExp(
        /^(Bearer|System)\s[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
      )
    )
    .messages({
      "string.pattern.base":
        "authorization must consists of one word either [Bearer|System] plus a space plus token that consists of three segments separated by dot, each has any number of characters in [A-Za-z0-9-_]",
    }),
  objectId: Joi.string().custom((value, helper) => {
    console.log(value);
    return Types.ObjectId.isValid(value) || helper.message("invalid objectId");
  }),
  fileKeys: {
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    basePath: Joi.string(),
    finalPath: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().positive().required(),
  },
};
export default generalFields;
