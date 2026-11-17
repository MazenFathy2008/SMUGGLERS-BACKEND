import nodemailer from "nodemailer";
import {
  FRONTEND_URL,
  MAIL_FROM,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
} from "../config/env.js";

export async function sendPasswordResetEmail(email, token) {
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASSWORD || !MAIL_FROM) {
    const error = new Error("Email service is not configured.");
    error.statusCode = 503;
    error.errorCode = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  if (!FRONTEND_URL) {
    const error = new Error("Frontend URL is not configured.");
    error.statusCode = 503;
    error.errorCode = "FRONTEND_URL_NOT_CONFIGURED";
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });
  const resetUrl = new URL("/resetPassword", FRONTEND_URL);
  resetUrl.searchParams.set("token", token);

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "إعادة تعيين كلمة مرور Smugglers",
    text: `لتعيين كلمة مرور جديدة، افتح الرابط التالي خلال ساعة:\n${resetUrl.toString()}\n\nلو لم تطلب تغيير كلمة المرور، تجاهل هذه الرسالة.`,
    html: `<div dir="rtl" style="font-family:Arial,sans-serif"><h2>إعادة تعيين كلمة المرور</h2><p>اضغط على الرابط التالي لاختيار كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.</p><p><a href="${resetUrl.toString()}">تغيير كلمة المرور</a></p><p>لو لم تطلب هذا التغيير، تجاهل الرسالة.</p></div>`,
  });
}
