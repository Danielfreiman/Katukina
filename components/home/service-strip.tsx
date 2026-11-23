"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Globe2, Headphones, Leaf, Package } from "lucide-react";

const services = [
  { icon: Globe2, title: "Shipping & destinations", text: "Check delivery options", href: "/shipping" },
  { icon: Package, title: "Browse all products", text: "See the full catalogue", href: "/shop" },
  { icon: Leaf, title: "Explore the collection", text: "Botanicals, incense & objects", href: "/collections" },
  { icon: Headphones, title: "Your account", text: "Orders and account details", href: "/account" },
];

export function ServiceStrip() {
  const stripRef = useRef<HTMLElement>(null);
  const [motion, setMotion] = useState<"playing" | "paused">();

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || typeof IntersectionObserver === "undefined") return;

    let inView = false;
    function updateMotion() {
      setMotion(inView && !document.hidden ? "playing" : "paused");
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateMotion();
    });
    observer.observe(strip);
    document.addEventListener("visibilitychange", updateMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateMotion);
    };
  }, []);

  return (
    <div className="mh-service-band">
      <nav ref={stripRef} className="mh-service-strip" aria-label="Shopping guidance" data-motion={motion}>
        {[false, true].map((copy) => (
          <div className="mh-service-group" key={String(copy)} aria-hidden={copy || undefined}>
            {services.map(({ icon: Icon, title, text, href }) => (
              <Link
                key={href}
                href={href}
                tabIndex={copy ? -1 : undefined}
                onFocus={({ currentTarget }) => {
                  if (currentTarget.matches(":focus-visible")) {
                    currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
                  }
                }}
              >
                <Icon size={36} strokeWidth={1.3} aria-hidden />
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
