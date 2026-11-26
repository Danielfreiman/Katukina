import Image from "next/image";
import Link from "next/link";
import { MailOpen, ShieldCheck } from "lucide-react";
import { SubscriptionForm } from "@/components/commerce/subscription";
import styles from "./subscribe.module.css";
export const metadata = {
  title: "Email updates",
  robots: { index: false, follow: true },
};
export default function Subscribe() {
  return (
    <main id="content" className={`shell ${styles.page}`}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Email updates</span>
      </nav>
      <div className={styles.spread}>
        <header className={styles.cover}>
          <Image
            src="/images/editorial/incense-selection.webp"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1440px) 50vw, 690px"
            loading="eager"
          />
          <div className={styles.coverCopy}>
            <h1>Letters from Katukina</h1>
            <p>Discover new additions to our collections, read stories from Katukina and hear about offers by email.</p>
          </div>
        </header>
        <section className={styles.signup} aria-labelledby="signup-title">
          <div className={styles.formColumn}>
            <span className="collection-mail-stamp" aria-hidden="true">
              <MailOpen size={26} strokeWidth={1.5} />
            </span>
            <h2 id="signup-title">Get email updates</h2>
            <p className={styles.intro}>Sign up below, then follow the link in your inbox to confirm your email address.</p>
            <SubscriptionForm />
            <Link className={styles.privacy} href="/privacy">
              <ShieldCheck size={17} aria-hidden="true" />
              How we use your email address
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
