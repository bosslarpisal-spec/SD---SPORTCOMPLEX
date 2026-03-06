// src/lib/mail.ts //
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:linear-gradient(135deg,#0070f3,#00a3ff);border-radius:20px;padding:20px 32px;text-align:center;">
              <div style="font-size:28px;margin-bottom:4px;">🎓</div>
              <div style="color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px;">KMITL</div>
              <div style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Facility Reservation System</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:white;border-radius:24px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          ${content}
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:500;">
            King Mongkut's Institute of Technology Ladkrabang<br/>
            This is an automated message — please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function primaryButton(href: string, label: string, color = "#0070f3") {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px auto 0;"><tr>
    <td style="background:${color};border-radius:12px;">
      <a href="${href}" style="display:inline-block;color:white;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;">${label} →</a>
    </td></tr></table>`;
}

function pill(text: string, bg: string, color: string) {
  return `<span style="background:${bg};color:${color};font-size:10px;font-weight:800;padding:4px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.5px;">${text}</span>`;
}

function sportIcon(sport: string) {
  const map: Record<string, string> = {
    "Football":"⚽","Volleyball":"🏐","Badminton":"🏸",
    "Table Tennis":"🏓","Fitness Center":"🏋️","Swimming Pool":"🏊",
  };
  return map[sport] || "🏆";
}

function infoCard(rows: {label:string;value:string}[], bg: string, border: string, labelColor: string) {
  return `<div style="background:${bg};border-radius:16px;padding:20px 24px;border:1px solid ${border};margin-bottom:8px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows.map((r,i) => `
        ${i>0?`<tr><td style="padding:4px 0;"><div style="border-top:1px solid ${border};"></div></td></tr>`:""}
        <tr><td style="padding:6px 0;">
          <span style="font-size:11px;font-weight:700;color:${labelColor};text-transform:uppercase;letter-spacing:0.5px;">${r.label}</span><br/>
          <span style="font-size:15px;font-weight:800;color:#0f172a;">${r.value}</span>
        </td></tr>`).join("")}
    </table>
  </div>`;
}

export async function sendInvitationEmail(toEmail: string, senderName: string, sport: string, invitationId: string) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">${icon}</div>
      ${pill("New Invitation","#eff6ff","#0070f3")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">You're invited!</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        <strong style="color:#0f172a;">${senderName}</strong> has invited you to a
        <strong style="color:#0070f3;">${sport}</strong> session at KMITL.
      </p>
    </div>
    ${infoCard([{label:"Sport",value:`${icon} ${sport}`},{label:"Invited by",value:`👤 ${senderName}`}],"#f8fafc","#e2e8f0","#94a3b8")}
    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;text-align:center;">⏰ This invitation expires in <strong>1 hour</strong>.</p>
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/invitation?id=${invitationId}`,"View &amp; Respond to Invitation")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: toEmail, subject: `🏆 ${senderName} invited you to play ${sport}`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Invitation email error:", error); return { success: false }; }
}

export async function sendAcceptanceEmail(hostEmail: string, participantName: string, sport: string) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">✅</div>
      ${pill("Invitation Accepted","#f0fdf4","#16a34a")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Someone's joining!</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        <strong style="color:#0f172a;">${participantName}</strong> accepted your invite to
        <strong style="color:#16a34a;">${sport}</strong>.
      </p>
    </div>
    ${infoCard([{label:"Sport",value:`${icon} ${sport}`},{label:"New Participant",value:`👤 ${participantName}`}],"#f0fdf4","#bbf7d0","#86efac")}
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/my-reservation`,"View Your Reservation","#16a34a")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail, subject: `✅ ${participantName} joined your ${sport} session!`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Acceptance email error:", error); return { success: false }; }
}

export async function sendDeclineEmail(hostEmail: string, participantName: string, sport: string) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">❌</div>
      ${pill("Invitation Declined","#fef2f2","#dc2626")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Invitation declined</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        <strong style="color:#0f172a;">${participantName}</strong> won't be joining your
        <strong style="color:#dc2626;">${sport}</strong> session this time.
      </p>
    </div>
    ${infoCard([{label:"Sport",value:`${icon} ${sport}`},{label:"Declined by",value:`👤 ${participantName}`}],"#fef2f2","#fecaca","#fca5a5")}
    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;text-align:center;">You can invite someone else to fill the spot.</p>
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/my-reservation`,"Manage Your Reservation","#dc2626")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail, subject: `❌ ${participantName} declined your ${sport} invitation`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Decline email error:", error); return { success: false }; }
}

export async function sendResetPasswordEmail(toEmail: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">🔐</div>
      ${pill("Security","#fefce8","#ca8a04")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Reset your password</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        We received a request to reset your KMITL account password.
      </p>
    </div>
    <div style="background:#fefce8;border-radius:16px;padding:16px 24px;border:1px solid #fde68a;text-align:center;">
      <p style="margin:0;font-size:12px;color:#92400e;font-weight:700;">⏰ This link expires in <strong>1 hour</strong></p>
    </div>
    <div style="text-align:center;">${primaryButton(resetUrl,"Reset My Password","#ca8a04")}</div>
    <p style="font-size:12px;color:#94a3b8;margin-top:24px;text-align:center;line-height:1.6;">
      If you didn't request this, you can safely ignore this email.
    </p>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: toEmail, subject: "🔐 Reset your KMITL password",
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Reset password email error:", error); return { success: false }; }
}

export async function sendReservationConfirmedEmail(
  hostEmail: string,
  hostName: string,
  sport: string,
  date: string,
  timeSlot: string,
  acceptedCount: number,
  totalInvited: number
) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">🎉</div>
      ${pill("Reservation Confirmed","#f0fdf4","#16a34a")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">You're good to go!</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        More than half your invitees accepted — your <strong style="color:#16a34a;">${sport}</strong> session is confirmed!
      </p>
    </div>
    ${infoCard([
      { label: "Sport", value: `${icon} ${sport}` },
      { label: "Date", value: `📅 ${date}` },
      { label: "Time", value: `🕐 ${timeSlot}` },
      { label: "Accepted", value: `👥 ${acceptedCount} of ${totalInvited} invitees` },
    ], "#f0fdf4", "#bbf7d0", "#86efac")}
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/my-reservation`, "View Your Reservation", "#16a34a")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `🎉 Your ${sport} session is confirmed!`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Confirmation email error:", error); return { success: false }; }
}

export async function sendBookingSubmittedEmail(
  hostEmail: string,
  hostName: string,
  sport: string,
  date: string,
  timeSlot: string
) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">📋</div>
      ${pill("Booking Submitted","#eff6ff","#0070f3")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Reservation received!</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        Hi <strong style="color:#0f172a;">${hostName}</strong>, your <strong style="color:#0070f3;">${sport}</strong> booking has been submitted. It will be confirmed once enough invitees accept.
      </p>
    </div>
    ${infoCard([
      { label: "Sport", value: `${icon} ${sport}` },
      { label: "Date", value: `📅 ${date}` },
      { label: "Time", value: `🕐 ${timeSlot}` },
    ], "#f8fafc", "#e2e8f0", "#94a3b8")}
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/my-reservation`, "View My Reservation", "#0070f3")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `📋 Your ${sport} booking has been submitted!`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) { console.error("Booking submitted email error:", error); return { success: false }; }
}
export async function sendReservationCancelledEmail(
  hostEmail: string,
  hostName: string,
  sport: string,
  date: string,
  timeSlot: string
) {
  const icon = sportIcon(sport);
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">❌</div>
      ${pill("Reservation Cancelled","#fef2f2","#dc2626")}
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Booking cancelled</h1>
      <p style="margin:0;font-size:15px;color:#64748b;line-height:1.6;">
        Hi <strong style="color:#0f172a;">${hostName}</strong>, your <strong style="color:#dc2626;">${sport}</strong> reservation was automatically cancelled because invitees did not respond in time.
      </p>
    </div>
    ${infoCard([
      { label: "Sport", value: `${icon} ${sport}` },
      { label: "Date", value: `📅 ${date}` },
      { label: "Time", value: `🕐 ${timeSlot}` },
      { label: "Reason", value: "⏰ Invitees did not respond within 1 hour" },
    ], "#fef2f2", "#fecaca", "#fca5a5")}
    <div style="text-align:center;">${primaryButton(`${process.env.NEXT_PUBLIC_BASE_URL}/facility`, "Book Again", "#dc2626")}</div>`;
  try {
    await transporter.sendMail({
      from: `"KMITL Sports Booking" <${process.env.EMAIL_USER}>`,
      to: hostEmail,
      subject: `❌ Your ${sport} booking was cancelled`,
      html: baseTemplate(content),
    });
    return { success: true };
  } catch (error) {
    console.error("Cancellation email error:", error);
    return { success: false };
  }
}
