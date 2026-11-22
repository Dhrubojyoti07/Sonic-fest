import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/resend/client";
import { getSiteSettings } from "@/lib/supabase/queries";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const settings = await getSiteSettings();

    if (resend && settings.contact_email) {
      try {
        await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [settings.contact_email],
          replyTo: email,
          subject: `[Contact Inquiry] ${subject || "New Message"} from ${name}`,
          html: `
            <div style="font-family: sans-serif; background: #08070e; color: #f8fafc; padding: 24px; border-radius: 8px;">
              <h2 style="color: #ff007a;">New Website Inquiry</h2>
              <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
              <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
              <hr style="border-color: rgba(255,255,255,0.1);" />
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
          `,
        });
      } catch (err) {
        console.warn("Contact email sending warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received. Our team will get back to you shortly.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again or reach out directly via email.",
      },
      { status: 500 }
    );
  }
}
