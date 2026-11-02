// lib/phoneFormatter.js
function formatToE164(phoneNumber, defaultCountryCode = "+91") {
  if (!phoneNumber) throw new Error("Phone number is required");

  // Trim and clean input
  let input = String(phoneNumber).trim();

  // ✅ If already in correct E.164 format
  if (/^\+\d{10,15}$/.test(input)) {
    return input;
  }

  // Remove non-digits
  let cleanNumber = input.replace(/\D/g, "");

  // ✅ If looks like a full international number (e.g. 11+ digits)
  if (cleanNumber.length > 10) {
    return `+${cleanNumber}`;
  }

  // ✅ Otherwise prepend default country code
  return `${defaultCountryCode}${cleanNumber}`;
}

export default formatToE164;
