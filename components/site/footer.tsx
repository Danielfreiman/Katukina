import Link from "next/link";
import { Mail } from "lucide-react";
import { CookieSettingsButton } from "@/components/privacy/cookie-consent";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-intro">
          <a href="/#top" aria-label="Katukina — home">
            <img
              className="footer-full-logo"
              src="/images/brand/katukina-logo-horizontal.svg"
              alt="Katukina"
              width={600}
              height={120}
            />
          </a>
          <h2>Nature. Culture. Connection.</h2>
          <p>
            Botanicals, incense and meaningful objects. A different way to
            discover nature.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link href="/shop">The shop</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/about">Our story</Link>
            <Link href="/journal">The journal</Link>
          </div>
          <div>
            <h3>Your account</h3>
            <Link href="/account">My account</Link>
            <Link href="/cart">Your bag</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/shipping">Shipping & destinations</Link>
          </div>
          <div>
            <h3>A little guidance</h3>
            <Link href="/privacy">Privacy notice</Link>
            <Link href="/cookies">Cookie policy</Link>
            <Link href="/shipping">Delivery information</Link>
            <Link href="/collections/sacred-incense">Explore incense</Link>
          </div>
        </div>
        <div className="footer-news">
          <h3>Stay in the loop</h3>
          <p>
            Discover stories, collection updates and new arrivals from Katukina.
          </p>
          <Link className="button light footer-news-link" href="/subscribe">
            Email updates
            <Mail size={18} />
          </Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Katukina</span>
          <CookieSettingsButton id="footer-cookie-settings" />
        </div>
        <span>Find your natural rhythm.</span>
        <a href="#content">Back to the top</a>
      </div>
    </footer>
  );
}
