"use client";

import { useEffect, useState } from "react";
import { ArrowIcon, FamilyHeartIcon } from "@/components/icons";
import styles from "./site-shell.module.css";

/** Mobiler Registrierungs-Button unten, erscheint erst nach 520px Scrollweg. */
export function StickyCta({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a className={`${styles.sticky} ${visible ? styles.stickyVisible : ""}`} href={href} aria-hidden={!visible} tabIndex={visible ? 0 : -1}>
      <FamilyHeartIcon />
      <span>{label}</span>
      <ArrowIcon />
    </a>
  );
}
