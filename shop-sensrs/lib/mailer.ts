import nodemailer from "nodemailer";

type MailParams = {
  to: string;
  subject: string;
  html: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail({ to, subject, html }: MailParams) {
  try {
    await transporter.sendMail({
      from: `"Shop.SEnSRS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false };
  }
}