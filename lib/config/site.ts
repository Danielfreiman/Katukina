export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"
).replace(/\/$/, "");
export const activeChannel = {
  id: "katukina",
  name: "Katukina",
  locale: "en-GB",
  origin: siteUrl,
} as const;
// Other channels need validated backend, company, catalogue and policies.
// Never infer the channel from an untrusted Host header or share customer/cart data.
