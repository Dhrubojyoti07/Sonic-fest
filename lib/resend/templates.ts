export interface EmailConfirmationProps {
  attendeeName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string | null;
  venue: string;
  location: string;
  attendeesCount: number;
  registrationId: string;
  ticketCode?: string;
  qrDataUrl?: string;
  ticketUrl?: string;
  siteName?: string;
  contactEmail?: string;
}

export function generateRegistrationEmailHtml({
  attendeeName,
  eventName,
  eventDate,
  eventTime,
  venue,
  location,
  attendeesCount,
  registrationId,
  ticketCode,
  qrDataUrl,
  ticketUrl,
  siteName = "SONIC FEST",
  contactEmail = "dhrubojyotipatra2007@gmail.com",
}: EmailConfirmationProps): string {
  const shortRef = ticketCode || `SF-${registrationId.slice(0, 8).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pass Confirmation - ${eventName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #08070e;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #08070e;
      padding: 40px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f0d1b;
      border: 1px solid rgba(255, 0, 122, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .header {
      background: linear-gradient(135deg, #ff007a 0%, #8b5cf6 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      color: rgba(255,255,255,0.85);
      font-size: 13px;
      letter-spacing: 2px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 28px;
    }
    .headline {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .pass-card {
      background: #141124;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .pass-title {
      font-size: 18px;
      font-weight: 700;
      color: #ff007a;
      margin: 0 0 16px 0;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
      font-size: 14px;
    }
    .detail-value {
      color: #f8fafc;
      font-weight: 600;
      font-size: 14px;
      text-align: right;
    }
    .badge-code {
      display: inline-block;
      background: rgba(255, 0, 122, 0.15);
      border: 1px solid rgba(255, 0, 122, 0.4);
      color: #ff007a;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: monospace;
      font-weight: 700;
      letter-spacing: 1.5px;
    }
    .qr-container {
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      display: inline-block;
      margin: 16px auto;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: #ff007a;
      color: #ffffff !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      margin-top: 12px;
      letter-spacing: 0.5px;
    }
    .footer {
      background: #090812;
      padding: 24px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #ff007a;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header" style="background: #08070e; border-bottom: 2px solid #ff007a; padding: 24px 20px; text-align: center;">
          <img src="https://sonic-fest.dhrubojyotipatra2007.workers.dev/images/sonic-fest-logo.jpg" alt="${siteName}" width="220" style="max-width: 220px; height: auto; display: block; margin: 0 auto 10px auto; border-radius: 8px;" />
          <div class="brand-sub" style="color: #ff007a; font-weight: bold; letter-spacing: 2px;">OFFICIAL FESTIVAL PASS</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 class="headline">You're in, ${attendeeName}!</h2>
          <p class="intro">
            Your registration for <strong>${eventName}</strong> has been secured. 
            Present the QR code below at the festival entrance gate for fast-track wristband check-in.
          </p>

          <div class="pass-card">
            <h3 class="pass-title">${eventName}</h3>
            
            <table width="100%" cellpadding="6" cellspacing="0">
              <tr>
                <td class="detail-label" width="40%">Ticket ID</td>
                <td class="detail-value" width="60%">
                  <span class="badge-code">${shortRef}</span>
                </td>
              </tr>
              <tr>
                <td class="detail-label">Primary Attendee</td>
                <td class="detail-value">${attendeeName}</td>
              </tr>
              <tr>
                <td class="detail-label">Passes Reserved</td>
                <td class="detail-value">${attendeesCount} Guest${attendeesCount > 1 ? "s" : ""}</td>
              </tr>
              <tr>
                <td class="detail-label">Event Date</td>
                <td class="detail-value">${eventDate}</td>
              </tr>
              ${
                eventTime
                  ? `<tr>
                      <td class="detail-label">Timing</td>
                      <td class="detail-value">${eventTime}</td>
                    </tr>`
                  : ""
              }
              <tr>
                <td class="detail-label">Venue</td>
                <td class="detail-value">${venue}</td>
              </tr>
              <tr>
                <td class="detail-label">Location</td>
                <td class="detail-value">${location}</td>
              </tr>
            </table>

            ${
              qrDataUrl
                ? `
            <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <div class="qr-container">
                <img src="${qrDataUrl}" width="160" height="160" alt="Ticket Entry QR Code" style="display: block; margin: 0 auto;" />
              </div>
              <div style="font-size: 11px; text-transform: uppercase; tracking: 1.5px; color: #94a3b8; margin-top: 8px;">
                Scan for Gate Entry Verification
              </div>
            </div>
            `
                : ""
            }
          </div>

          ${
            ticketUrl
              ? `
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${ticketUrl}" class="cta-button" target="_blank">
              View Digital Pass on Phone &rarr;
            </a>
          </div>
          `
              : ""
          }

          <p class="intro" style="font-size: 13px; margin-bottom: 0;">
            Please carry a valid government-issued photo ID corresponding to the primary attendee name.
            Festival gates open 1 hour prior to scheduled show time.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;">Need assistance? Contact our team at <a href="mailto:${contactEmail}">${contactEmail}</a></p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}
