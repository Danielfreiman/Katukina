import { ReadingPage } from "@/components/site/reading-page";
import styles from "./cookies.module.css";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/privacy/cookie-consent";
import { CONSENT_VERSION } from "@/lib/privacy/consent";
export const metadata = {
  title: "Cookie policy",
  alternates: { canonical: "/cookies" },
};

const chapters = [
  {
    id: "who-is-responsible",
    title: "Who is responsible?",
    content: (
      <>
        <p>
          Sacred Incense LTD, company number 10995196, Suite LP37821, 20–22
          Wenlock Road, London N1 7GU, United Kingdom. For privacy requests,
          email{" "}
          <a href="mailto:info@sacred-incense.co.uk?subject=GDPR%20Request">
            info@sacred-incense.co.uk
          </a>
          . These contact details are also published in the{" "}
          <a href="https://katukina.com/privacy" rel="noreferrer">
            existing Katukina privacy policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "your-choice",
    title: "Your choice",
    content: (
      <>
        <p>
          Optional storage is off until you explicitly accept it. “Reject
          optional” leaves it off. “Choose preferences” lets you select the
          available purpose. Scrolling, continuing to browse or closing
          preferences is not consent. Rejecting does not restrict access to the
          shop.
        </p>
        <p>
          You can withdraw consent through Cookie settings at the bottom of
          every page. Rejecting or disabling recently viewed products stops that
          feature and removes its saved history from this browser. It does not
          empty your bag or sign you out. Withdrawing consent does not change
          the lawfulness of processing before withdrawal.
        </p>
      </>
    ),
  },
  {
    id: "storage-used-by-this-website",
    title: "Storage used by this website",
    content: (
      <>
        <p>
          All entries below are first-party storage. “Necessary” means used to
          provide a requested function or remember your privacy choice;
          “optional” requires your permission.
        </p>
        <div
          className={styles.inventory}
          role="region"
          aria-labelledby="inventory-caption"
          tabIndex={0}
        >
          <table>
            <caption id="inventory-caption">
              Purpose, contents and lifetime
            </caption>
            <thead>
              <tr>
                <th scope="col">Name / technology</th>
                <th scope="col">Purpose and contents</th>
                <th scope="col">Category / lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>katukina_cart</code>
                  <br />
                  HTTP-only cookie
                </td>
                <td>
                  A token linking your browser to its shopping bag. Set when you
                  use the bag or checkout. The cookie itself does not contain
                  your address or payment details.
                </td>
                <td>
                  Necessary. Up to 48 hours from the latest shopping bag
                  response. Restricted to the commerce API; Secure on HTTPS,
                  SameSite Strict.
                </td>
              </tr>
              <tr>
                <td>
                  <code>wordpress_logged_in_*</code>,{" "}
                  <code>wordpress_sec_*</code>, <code>wordpress_*</code>
                  <br />
                  Authentication cookies
                </td>
                <td>
                  Authenticate a customer or administrator after sign-in. Used
                  by WordPress to verify the signed-in session.
                </td>
                <td>
                  Necessary. Customer sign-in is normally valid for 14 days;
                  WordPress may retain the cookie for another 12 hours for its
                  login grace period. Native administrator login uses a browser
                  session unless “Remember Me” is selected. Signing out ends the
                  session.
                </td>
              </tr>
              <tr>
                <td>
                  <code>wordpress_test_cookie</code>
                  <br />
                  Cookie
                </td>
                <td>
                  Checks browser cookie support when the native WordPress login
                  page is opened.
                </td>
                <td>Necessary. Browser session.</td>
              </tr>
              <tr>
                <td>
                  <code>wp-settings-*</code>, <code>wp-settings-time-*</code>
                  <br />
                  Cookies
                </td>
                <td>
                  Preferences for signed-in WordPress administrators, such as
                  editor layout. Not storefront visitor tracking.
                </td>
                <td>Administrative preferences. Up to one year.</td>
              </tr>
              <tr>
                <td>
                  <code>katukina:consent:v1</code>
                  <br />
                  Local storage
                </td>
                <td>
                  Remembers whether you allowed recently viewed products, the
                  policy version, choice time and expiry. No advertising ID or
                  account details.
                </td>
                <td>
                  Necessary. 180 days for either acceptance or rejection; a
                  changed purpose/version requires a new choice.
                </td>
              </tr>
              <tr>
                <td>
                  <code>katukina:recent-products:v2</code>
                  <br />
                  Local storage
                </td>
                <td>
                  Up to eight product IDs and their visit times, used to show
                  your recently viewed products. Current product data is
                  requested from this website; no external tracking service
                  receives this history.
                </td>
                <td>
                  Optional functional storage. Each entry is valid for 30 days
                  after viewing that product, or until you clear history or
                  withdraw consent, whichever comes first.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Local storage has no browser-managed expiry: this website checks
          expiry before using it and removes expired history when the feature
          next runs. Consent expiry disables optional storage and clears its
          history when the website is opened or while it is active. You can
          remove storage at any time in your browser settings.
        </p>
      </>
    ),
  },
  {
    id: "analytics-advertising-and-external-content",
    title: "Analytics, advertising and external content",
    content: (
      <>
        <p>
          This version has no analytics trackers, advertising pixels or
          automatically loaded third-party embeds. Fonts are served locally.
          External links load another website only when you follow them; that
          website has its own privacy practices. Any future optional purpose or
          provider must be disclosed and obtain the relevant consent before it
          runs.
        </p>
      </>
    ),
  },
  {
    id: "browser-controls-and-shared-devices",
    title: "Browser controls and shared devices",
    content: (
      <>
        <p>
          Your choice applies to this browser and website origin, not
          automatically to other devices or Katukina sites. Clearing browser
          data resets it. Blocking storage may prevent your choice from being
          remembered; optional features then stay off. Blocking necessary
          cookies can prevent sign-in or the bag from working.
        </p>
        <p>
          When JavaScript is disabled, optional history does not run. You can
          delete an earlier choice using your browser’s site-data controls.
        </p>
      </>
    ),
  },
  {
    id: "more-information",
    title: "More information",
    content: (
      <>
        <p>
          See our <Link href="/privacy">privacy notice</Link> for personal data,
          contact details and your rights. This policy covers the current test
          storefront; live hosting and any additional services must be reviewed
          before public launch.
        </p>
      </>
    ),
  },
];
export default function CookiesPage() {
  return (
    <ReadingPage
      title="Cookie policy"
      chapters={chapters}
      meta={
        <>
          Updated <time dateTime="2026-10-27">27 October 2026</time> · Version{" "}
          {CONSENT_VERSION}
        </>
      }
    >
      <p>
        This policy describes cookies and similar browser storage used by this
        Katukina website. Local storage is covered too, even though it is not a
        cookie. You can browse, sign in and shop without allowing optional
        storage.
      </p>
      <CookieSettingsButton />
    </ReadingPage>
  );
}
