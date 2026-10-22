import { AccountView } from "@/components/commerce/account";
export const metadata = {
  title: "My account",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false },
};
export default function Account() {
  return (
    <main id="content" className="shell page-content commerce-page">
      <p className="eyebrow">YOUR SPACE</p>
      <h1>My account</h1>
      <AccountView />
    </main>
  );
}
