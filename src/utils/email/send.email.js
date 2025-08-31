import nodemailer from "nodemailer";

async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  subject = "SARAHA App",
  text = "",
  html = "",
  attachments = [],
} = {}) {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"SARAHA APP 🍀" <${from}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  });

  console.log("Message sent:", info.messageId);
}

export default sendEmail;
