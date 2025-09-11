import { EventEmitter } from "node:events";
import sendEmail from "../email/send.email.js";
import verifyEmailTemplate from "../email/templates/verify_email.template.js";

const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm Email",
    html: verifyEmailTemplate({ otp: data.otp, title: data.title }),
  }).catch((error) => {
    console.error(`Failed to send email to ${data.to}`);
  });
});

emailEvent.on("forgotPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Forgot Password",
    html: verifyEmailTemplate({ otp: data.otp, title: data.title }),
  }).catch((error) => {
    console.error(`Failed to send email to ${data.to}`);
  });
});

export default emailEvent;
