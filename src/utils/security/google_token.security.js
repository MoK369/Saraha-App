import { OAuth2Client } from "google-auth-library";
import CustomError from "../custom/error_class.custom.js";

export async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_IDS.split(","),
  }).catch((error) => {
    throw new CustomError("Invalid Google Token or has expired");
  });
  return ticket.getPayload();
}