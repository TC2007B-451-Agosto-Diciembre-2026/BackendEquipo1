import { createHmac, timingSafeEqual } from 'node:crypto';

const URL_TTL = 5 * 60;

function signature(evidenceId: number, exp: number): string {
  return createHmac('sha256', process.env.JWT_SECRET!)
    .update(`evidence:${evidenceId}:${exp}`)
    .digest('base64url');
}

export function signedEvidenceUrl(evidenceId: number): string {
  const exp = Math.floor(Date.now() / 1000) + URL_TTL;
  return `/evidence/${evidenceId}?exp=${exp}&sig=${signature(evidenceId, exp)}`;
}

export function isValidEvidenceSignature(evidenceId: number, exp: number, sig: string): boolean {
  if (!Number.isInteger(exp) || exp < Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = Buffer.from(signature(evidenceId, exp));
  const received = Buffer.from(sig ?? '');
  return expected.length === received.length && timingSafeEqual(expected, received);
}
