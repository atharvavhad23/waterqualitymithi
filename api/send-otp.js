import twilio from "twilio";
import formatToE164 from "../../lib/phoneFormatter.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { phone } = req.body;

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone (always ensures +91XXXXXXXXXX)
    const formattedPhone = formatToE164(phone, "+91");

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "OTP send failed" });
  }
}
