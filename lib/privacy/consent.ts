export const CONSENT_VERSION = "2026-10-27.1";
export const CONSENT_KEY = "katukina:consent:v1";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export const HISTORY_KEY = "katukina:recent-products:v2";
export const HISTORY_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
export type Consent = {
  version: typeof CONSENT_VERSION;
  functional: boolean;
  savedAt: number;
  expiresAt: number;
};
export function parseConsent(
  raw: string | null,
  now = Date.now(),
): Consent | null {
  try {
    const value = JSON.parse(raw || "null");
    if (
      !value ||
      value.version !== CONSENT_VERSION ||
      typeof value.functional !== "boolean" ||
      !Number.isSafeInteger(value.savedAt) ||
      !Number.isSafeInteger(value.expiresAt) ||
      value.savedAt > now ||
      value.savedAt <= 0 ||
      value.expiresAt <= now ||
      value.expiresAt !== value.savedAt + CONSENT_MAX_AGE
    )
      return null;
    return {
      version: CONSENT_VERSION,
      functional: value.functional,
      savedAt: value.savedAt,
      expiresAt: value.expiresAt,
    };
  } catch {
    return null;
  }
}
export function clearOptionalStorage() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem("katukina:recent-products:v1");
  } catch {
    /* Storage may be unavailable. Optional features remain off. */
  }
}
