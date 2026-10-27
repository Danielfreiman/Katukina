import Link from "next/link";
import { CookieSettingsButton } from "@/components/privacy/cookie-consent";
export const metadata = {
  title: "Privacy notice",
  alternates: { canonical: "/privacy" },
};
export default function PrivacyPage() {
  return (
    <main id="content" className="shell page-content policy-page">
      <p className="eyebrow">YOUR PRIVACY</p>
      <h1>Privacy notice</h1>
      <p className="policy-date">Updated 27 October 2026</p>
      <p className="policy-notice">
        This is a test storefront. Use fictional account and checkout details.
        It does not collect payments or dispatch orders. This notice describes
        this version, not every service on the existing live website.
      </p>
      <h2>Controller and contact</h2>
      <p>
        Sacred Incense LTD is identified as the controller in the{" "}
        <a href="https://katukina.com/privacy" rel="noreferrer">
          existing Katukina privacy policy
        </a>
        . Company number: 10995196. Correspondence address: Suite LP37821, 20–22
        Wenlock Road, London N1 7GU, United Kingdom.
      </p>
      <p>
        For questions or rights requests, email{" "}
        <a href="mailto:info@sacred-incense.co.uk?subject=GDPR%20Request">
          info@sacred-incense.co.uk
        </a>{" "}
        with the subject “GDPR Request”. Do not include passwords or payment
        card numbers.
      </p>
      <h2>What this website processes</h2>
      <ul>
        <li>
          Account details you submit, such as email and password, to create and
          authenticate an account. Passwords are stored as hashes by WordPress.
        </li>
        <li>
          Bag contents, selected delivery options, contact details and
          billing/delivery addresses you enter, plus test order records, to
          provide the shopping and checkout functions you request.
        </li>
        <li>
          Your browser privacy choice and, only with consent, a short history of
          viewed product IDs. See the <Link href="/cookies">cookie policy</Link>{" "}
          for names, purposes and durations.
        </li>
        <li>
          Technical request data, such as IP address, requested URL and error
          information, which the application and its hosting systems may process
          to deliver and protect the service.
        </li>
      </ul>
      <p>
        Account and order processing serves the steps you request toward a
        purchase and management of your account. Necessary security operations
        serve the legitimate interest of protecting the service. Optional
        browsing history is based on consent. Cookie consent is separate from
        ordering and is not permission for marketing. No marketing subscription
        is created by accepting it.
      </p>
      <h2>Access and sharing</h2>
      <p>
        Account, bag and test order data is handled by the local
        WordPress/WooCommerce backend and authorised operators. This version has
        no active payment or carrier integration and no advertising or analytics
        recipient. The optional product history stays in your browser; public
        product IDs are sent to this website when it retrieves the matching
        products.
      </p>
      <p>
        Production hosting locations, service providers and any international
        transfer arrangements have not been established for this test
        environment. They must be documented before a public deployment or the
        introduction of new recipients.
      </p>
      <h2>Retention</h2>
      <p>
        Browser storage durations are listed in the{" "}
        <Link href="/cookies">cookie policy</Link>. Test accounts and orders
        currently remain in the local database until an authorised administrator
        removes or anonymises them. Automatic account/order retention rules are
        not yet configured. Production retention periods for accounts, orders,
        logs and backups must be approved and implemented before real customer
        data is collected; no deletion of balances or historical records is
        inferred from the older website’s terms.
      </p>
      <h2>Your rights</h2>
      <p>
        Subject to applicable conditions, you can request access, correction,
        erasure, restriction and portability of your personal data, and object
        to processing based on legitimate interests. You can withdraw
        optional-storage consent at any time without affecting the shop’s
        essential functions or the lawfulness of earlier processing.
      </p>
      <CookieSettingsButton />
      <p>
        Contact the address above to exercise your rights. We may need
        proportionate information to verify identity. Requests are generally
        answered within one month; where a lawful extension applies, you must be
        told why. Erasure is not absolute where records must lawfully be
        retained.
      </p>
      <p>
        You may complain to a competent data protection authority, including an
        authority in the EU country where you live, work or consider an
        infringement occurred, or the{" "}
        <a href="https://ico.org.uk/make-a-complaint/" rel="noreferrer">
          UK Information Commissioner’s Office
        </a>
        . See the{" "}
        <a
          href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en"
          rel="noreferrer"
        >
          EU supervisory authorities
        </a>
        .
      </p>
      <h2>Updates</h2>
      <p>
        We will revise this notice when the actual processing changes. New
        optional purposes require a new consent choice before they are enabled.
        Essential access does not depend on accepting optional storage.
      </p>
    </main>
  );
}
