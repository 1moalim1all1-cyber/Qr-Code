// Normalizes an Egyptian-style phone number into a consistent format so the
// same number always maps to the same account, regardless of how the person
// typed it (with/without +20, with a leading 0, with spaces, etc).
export function normalizePhone(raw: string): string {
  let p = raw.trim().replace(/[\s-]/g, '')
  if (p.startsWith('00')) p = '+' + p.slice(2)
  if (p.startsWith('0')) p = '+20' + p.slice(1)
  if (!p.startsWith('+')) p = '+20' + p
  return p
}

// Firebase Auth's email/password provider is reused for phone+password
// login (no SMS/OTP) by mapping the phone number to a deterministic,
// invisible-to-the-user "pseudo email". The real phone number is stored
// separately in the Firestore profile.
export function phoneToPseudoEmail(raw: string): string {
  const digits = normalizePhone(raw).replace('+', '')
  return `${digits}@phone.smartqrmenu.app`
}
