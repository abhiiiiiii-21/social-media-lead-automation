export interface NormalizedProfile {
  username: string;
  profileUrl: string;
  isValid: boolean;
}

/**
 * Normalizes any Instagram profile URL or handle into clean username and standard URL.
 */
export function normalizeProfileInput(input: string): NormalizedProfile {
  if (!input || !input.trim()) {
    return { username: "", profileUrl: "", isValid: false };
  }

  let cleaned = input.trim();

  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//i, "");
  // Strip www.instagram.com or instagram.com
  cleaned = cleaned.replace(/^(www\.)?instagram\.com\//i, "");
  // Strip query parameters and hash
  cleaned = cleaned.split("?")[0].split("#")[0];
  // Strip leading @ and trailing/leading slashes
  cleaned = cleaned.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");

  const username = cleaned.toLowerCase();
  // Valid Instagram username: 1-30 chars, letters, numbers, periods, underscores
  const isValid = /^[a-zA-Z0-9._]{1,30}$/.test(username);
  const profileUrl = isValid ? `https://www.instagram.com/${username}/` : "";

  return {
    username,
    profileUrl,
    isValid,
  };
}
