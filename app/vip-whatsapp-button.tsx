"use client";

import { MessageCircle, Users } from "lucide-react";
import { MetaTrackedLink } from "./meta-tracked-link";
import styles from "./vip-whatsapp-button.module.css";

const vipGroupUrl =
  "https://chat.whatsapp.com/DdOTFrYwebKHXpSofclNbf?s=cl&p=i&ilr=0&amv=1";

export function VipWhatsAppButton() {
  return (
    <MetaTrackedLink
      className={styles.button}
      href={vipGroupUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Entrar no grupo VIP da Corta Essa no WhatsApp"
      metaEvent="Contact"
      metaParameters={{
        content_name: "Grupo VIP do WhatsApp",
        content_category: "Comunidade Corta Essa",
      }}
    >
      <span className={styles.icon} aria-hidden="true">
        <MessageCircle />
      </span>
      <span className={styles.copy}>
        <small>
          <Users aria-hidden="true" /> Grupo
        </small>
        <strong>VIP WhatsApp</strong>
      </span>
      <span className={styles.arrow} aria-hidden="true">↗</span>
    </MetaTrackedLink>
  );
}
