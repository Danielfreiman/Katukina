import { SubscriptionForm } from "@/components/commerce/subscription";
export const metadata = {
  title: "Email updates",
  robots: { index: false, follow: true },
};
export default function Subscribe() {
  return (
    <main id="content" className="shell page-content commerce-page">
      <SubscriptionForm />
    </main>
  );
}
