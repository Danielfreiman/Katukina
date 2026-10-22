import { CheckoutView } from "@/components/commerce/checkout";
export const metadata = {
  title: "Checkout",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};
export default function Checkout() {
  return (
    <main id="content" className="shell page-content commerce-page">
      <p className="eyebrow">THE FINAL DETAILS</p>
      <h1>Checkout</h1>
      <CheckoutView />
    </main>
  );
}
