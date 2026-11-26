import { existsSync } from "node:fs";
import path from "node:path";
import { AccountView } from "@/components/commerce/account";
export const metadata = {
  title: "My account",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};
export default function Account() {
  const artwork = "/images/account/welcome/account-welcome.webp";
  return (
    <main id="content" className="account-banner">
      <div className="shell page-content commerce-page account-content">
        <p className="eyebrow">YOUR SPACE</p>
        <h1>My account</h1>
        <AccountView artwork={existsSync(path.join(process.cwd(), "public", artwork)) ? artwork : undefined} />
      </div>
    </main>
  );
}
