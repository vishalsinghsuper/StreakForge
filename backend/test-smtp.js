import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function test() {
  try {
    console.log("Sending email with undefined//undefined...");
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: "vishalkumardal@gmail.com",
      subject: "Test Undefined",
      html: "<a href='undefined//undefined/verify-email/123'>Verify</a>",
    });
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err.message);
  }
}

test();
