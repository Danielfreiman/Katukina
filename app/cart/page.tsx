import { CartView } from "@/components/commerce/cart";
export const metadata = {
  title: "Your bag",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
};
export default function Cart() {
  return (
    <main id="content" className="shell page-content commerce-page">
      <p className="eyebrow">YOUR COLLECTION</p>
      <h1>Your bag</h1>
      <CartView />
    </main>
  );
}
