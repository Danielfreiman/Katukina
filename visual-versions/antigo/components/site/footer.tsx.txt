import Link from "next/link";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-intro">
          <img className="footer-full-logo" src="/images/brand/katukina-logo-horizontal.svg" alt="Katukina" width={600} height={120} />
          <h2>
            Stay curious.
            <br />
            Stay connected.
          </h2>
          <p>
            Botanicals, objects and stories.
            <br />A different way to discover nature.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link href="/shop">The shop</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/about">Our story</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/subscribe">Email updates</Link>
          </div>
          <div>
            <h3>A little guidance</h3>
            <Link href="/shipping">Shipping & destinations</Link>
            <Link href="/account">My account</Link>
            <Link href="/cart">Your bag</Link>
            <Link href="/cookies">Cookie policy</Link>
            <Link href="/privacy">Privacy notice</Link>
            <Link href="/shop" className="footer-cta">
              Find your next discovery
            </Link>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Katukina</span>
        <span>Nature. Culture. Connection.</span>
        <a href="#content">Back to the top ↑</a>
      </div>
    </footer>
  );
}
