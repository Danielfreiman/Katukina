import { ShippingCalculator } from "@/components/commerce/shipping";
import { wordpressGet } from "@/lib/wordpress/client";
import { CommerceConfig } from "@/lib/commerce/types";
export const metadata = {
  title: "Shipping & destinations",
  alternates: { canonical: "/shipping" },
  robots: { index: false, follow: true },
};
export default async function Shipping() {
  const { data } = await wordpressGet<CommerceConfig>(
    "/wp-json/katukina/v1/commerce/config",
  );
  return (
    <main id="content" className="shell page-content commerce-page">
      <p className="eyebrow">FROM US TO YOU</p>
      <h1>Shipping & destinations</h1>
      <ShippingCalculator config={data} />
    </main>
  );
}
