import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("RESEND_API_KEY is not defined. Email notifications will be skipped or simulated.");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Sonic Fest <dhrubojyotipatra07@dhrubojyoti.site>";
