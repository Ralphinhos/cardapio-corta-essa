"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./meta-pixel.module.css";

const META_PIXEL_ID = "214378517891929";
const META_PIXEL_SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";
const CONSENT_STORAGE_KEY = "corta-essa-cookie-consent";
const CONSENT_CHANGE_EVENT = "corta-essa-cookie-consent-change";

type ConsentChoice = "accepted" | "rejected";
type MetaPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: MetaPixelFunction;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
    __cortaEssaMetaPixelInitialized?: boolean;
  }
}

function createPixelQueue() {
  if (window.fbq) return window.fbq;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue.push(args);
  } as MetaPixelFunction;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

function initializeMetaPixel() {
  const fbq = createPixelQueue();
  if (window.__cortaEssaMetaPixelInitialized) return fbq;

  const firstScript = document.getElementsByTagName("script")[0];
  const script = document.createElement("script");
  script.async = true;
  script.src = META_PIXEL_SCRIPT;
  script.id = "meta-pixel-script";

  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  fbq("init", META_PIXEL_ID);
  window.__cortaEssaMetaPixelInitialized = true;
  return fbq;
}

function getConsentSnapshot(): ConsentChoice | null {
  const storedChoice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return storedChoice === "accepted" || storedChoice === "rejected"
    ? storedChoice
    : null;
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

export function MetaPixel() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => null,
  );
  const [settingsRequested, setSettingsRequested] = useState(false);
  const settingsOpen = consent === null || settingsRequested;

  useEffect(() => {
    if (consent !== "accepted") return;
    const fbq = initializeMetaPixel();
    fbq("track", "PageView");
  }, [consent, pathname]);

  const saveChoice = (choice: ConsentChoice) => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    setSettingsRequested(false);
    if (choice === "rejected" && window.fbq) {
      window.fbq("consent", "revoke");
    }
  };

  return (
    <>
      {settingsOpen && (
        <section
          className={styles.banner}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Sua privacidade</span>
            <strong id="cookie-consent-title">Podemos medir esta visita?</strong>
            <p id="cookie-consent-description">
              O site funciona sem cookies de publicidade. Se você aceitar, o
              Pixel da Meta será usado para medir campanhas e melhorar nossos
              anúncios.
            </p>
            <a href="/privacidade">Entenda como os dados são usados</a>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => saveChoice("rejected")}>
              Recusar
            </button>
            <button
              className={styles.accept}
              type="button"
              onClick={() => saveChoice("accepted")}
            >
              Aceitar
            </button>
          </div>
        </section>
      )}
      {!settingsOpen && (
        <button
          className={styles.settings}
          type="button"
          onClick={() => setSettingsRequested(true)}
          aria-label="Alterar preferência de cookies"
        >
          Cookies
        </button>
      )}
    </>
  );
}
