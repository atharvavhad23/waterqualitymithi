// pages/api/verify-otp.js
import twilio from "twilio";
import formatToE164 from "../../lib/phoneFormatter.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { phone, code } = JSON.parse(req.body);

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // ✅ Format phone same way as when sending
    const formattedPhone = formatToE164(phone, "+91");

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code,
      });

    if (verificationCheck.status === "approved") {
      res.status(200).json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "OTP verification failed" });
  }
}
