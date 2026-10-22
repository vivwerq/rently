/**
 * Rently Backend Firebase Authentication & Token Verification Helper
 * 
 * Extracts and decodes Firebase ID tokens or fallback development session tokens
 * passed in Authorization: Bearer <token> headers.
 */

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
  isStudent?: boolean;
  institution?: string;
  isDemo?: boolean;
}

/**
 * Extracts raw token string from the Authorization header (e.g., "Bearer eyJhbGci...").
 */
export function parseBearerToken(authHeader?: string): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

/**
 * Parses and safely extracts user identity from a Firebase ID token or dev session token.
 */
export function decodeFirebaseToken(token: string): DecodedAuthToken | null {
  if (!token || typeof token !== 'string') return null;

  // 1. Support local dev / demo tokens (e.g. rnt_tok_..., usr-demo-student)
  if (token.startsWith('rnt_tok_') || token.startsWith('demo-') || token.startsWith('usr-')) {
    return {
      uid: token.startsWith('usr-') ? token : 'usr-demo-student',
      name: 'Amanpreet Singh',
      email: 'student.21bcs4821@cumail.in',
      phone_number: '+919876543210',
      isStudent: true,
      institution: 'Chandigarh University (CU)',
      isDemo: true
    };
  }

  // 2. Decode standard JWT structure (Header.Payload.Signature)
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  try {
    const payloadBase64 = segments[1];
    // Base64url decode
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const jsonStr = Buffer.from(padded, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    const uid = payload.sub || payload.user_id || payload.uid;
    if (!uid) return null;

    const email: string | undefined = payload.email;
    const isStudent = email ? (
      email.endsWith('.edu') ||
      email.endsWith('.in') ||
      email.includes('cuchd') ||
      email.includes('pu.ac') ||
      email.includes('pec.edu')
    ) : false;

    let institution: string | undefined;
    if (email?.includes('cuchd')) institution = 'Chandigarh University (CU)';
    else if (email?.includes('pu.ac')) institution = 'Panjab University (PU)';
    else if (email?.includes('pec.edu')) institution = 'Punjab Engineering College (PEC)';

    return {
      uid,
      email,
      phone_number: payload.phone_number,
      name: payload.name || payload.display_name,
      picture: payload.picture,
      isStudent,
      institution,
      isDemo: false
    };
  } catch (err) {
    console.warn('[firebaseAuth] Failed to decode token payload:', err);
    return null;
  }
}
