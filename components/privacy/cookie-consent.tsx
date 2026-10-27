"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  CONSENT_KEY,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  Consent,
  clearOptionalStorage,
  parseConsent,
} from "@/lib/privacy/consent";

const Context = createContext({ functional: false, openSettings: () => {} });
export const useCookieConsent = () => useContext(Context);
export function CookieSettingsButton() {
  const { openSettings } = useCookieConsent();
  return (
    <button
      className="cookie-settings-link"
      type="button"
      onClick={openSettings}
    >
      Cookie settings
    </button>
  );
}
export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState(false);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const footerTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const refresh = () => {
      let stored: Consent | null = null;
      try {
        stored = parseConsent(localStorage.getItem(CONSENT_KEY));
        if (!stored) localStorage.removeItem(CONSENT_KEY);
      } catch {
        /* Default deny. */
      }
      if (!stored?.functional) clearOptionalStorage();
      else {
        try {
          localStorage.removeItem("katukina:recent-products:v1");
        } catch {
          /* No legacy history is imported. */
        }
      }
      setConsent(stored);
      setDraft(stored?.functional ?? false);
      setReady(true);
    };
    const storage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === null) refresh();
    };
    refresh();
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);
  useEffect(() => {
    if (!consent) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= consent.expiresAt) {
        clearOptionalStorage();
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch {
          /* Fail closed. */
        }
        setConsent(null);
        setDraft(false);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [consent]);
  const openSettings = () => {
    trigger.current = document.activeElement as HTMLElement;
    setDraft(consent?.functional ?? false);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    (trigger.current?.isConnected
      ? trigger.current
      : footerTrigger.current
    )?.focus({ preventScroll: true });
  };
  const save = (functional: boolean) => {
    const savedAt = Date.now();
    const record: Consent = {
      version: CONSENT_VERSION,
      functional,
      savedAt,
      expiresAt: savedAt + CONSENT_MAX_AGE,
    };
    let persisted = false;
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
      persisted = localStorage.getItem(CONSENT_KEY) === JSON.stringify(record);
    } catch {
      /* Deny optional storage when the choice cannot be saved. */
    }
    if (!functional || !persisted) clearOptionalStorage();
    setConsent({ ...record, functional: functional && persisted });
    setDraft(functional && persisted);
    setMessage(
      persisted
        ? "Your cookie preferences have been saved."
        : "Your browser could not save your choice. Optional storage remains off; you may be asked again next time.",
    );
    close();
    // The banner button may be removed by this render. Keep a usable focus target.
    requestAnimationFrame(() => {
      if (!document.activeElement || document.activeElement === document.body)
        footerTrigger.current?.focus({ preventScroll: true });
    });
  };
  return (
    <Context.Provider
      value={{
        functional:
          ready && !!consent?.functional && consent.expiresAt > Date.now(),
        openSettings,
      }}
    >
      {children}
      <div className="cookie-controls shell">
        <button
          type="button"
          className="cookie-settings-link"
          ref={footerTrigger}
          onClick={openSettings}
        >
          Cookie settings
        </button>
        <p role="status">{message}</p>
      </div>
      {ready && !consent && (
        <section
          className="cookie-banner"
          aria-label="Cookie consent"
          aria-describedby="cookie-summary"
        >
          <div>
            <h2>Your privacy choices</h2>
            <p id="cookie-summary">
              Essential storage keeps your bag and sign-in working. With your
              permission, we also remember recently viewed products on this
              device for up to 30 days. We do not use advertising or analytics
              trackers.
            </p>
            <p>
              <Link href="/cookies">Cookie policy</Link> ·{" "}
              <Link href="/privacy">Privacy notice</Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button onClick={() => save(false)}>Reject optional</button>
            <button onClick={openSettings}>Choose preferences</button>
            <button onClick={() => save(true)}>Accept optional</button>
          </div>
        </section>
      )}
      <dialog
        className="cookie-dialog"
        ref={dialog}
        aria-labelledby="cookie-dialog-title"
        onCancel={() => {
          setDraft(consent?.functional ?? false);
        }}
      >
        <button
          className="cookie-close"
          aria-label="Close cookie settings"
          onClick={close}
        >
          <X size={20} />
        </button>
        <h2 id="cookie-dialog-title">Cookie preferences</h2>
        <p>
          You can browse and shop with optional storage off. Closing this window
          does not change your choice.
        </p>
        <section>
          <h3>
            Strictly necessary <span>Always active</span>
          </h3>
          <p>
            Shopping bag, authentication and remembering your privacy choice.
            These are not used for advertising.
          </p>
        </section>
        <section>
          <label className="cookie-toggle">
            <input
              type="checkbox"
              checked={draft}
              onChange={(event) => setDraft(event.target.checked)}
            />
            <strong>Recently viewed products</strong>
          </label>
          <p>
            Remember up to eight product IDs on this device for up to 30 days.
            Turning this off deletes that history. This is optional functional
            storage.
          </p>
        </section>
        <section>
          <h3>
            Analytics and advertising <span>Not used</span>
          </h3>
          <p>No consent is requested for services that are not installed.</p>
        </section>
        <p>
          We remember your choice for 180 days. You can change it or withdraw
          consent through Cookie settings at any time.{" "}
          <Link href="/cookies">Read the cookie policy</Link>.
        </p>
        <div className="cookie-actions">
          <button onClick={() => save(false)}>Reject optional</button>
          <button onClick={() => save(draft)}>Save preferences</button>
          <button onClick={() => save(true)}>Accept optional</button>
        </div>
      </dialog>
    </Context.Provider>
  );
}
