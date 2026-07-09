"use client";

import { useState } from "react";
import styles from "./embed.module.css";

export default function EmbedSnippet({ embedKey }: { embedKey: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/widget.js" data-embed-key="${embedKey}" async></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <p className={styles.label}>Your embed key</p>
      <code className={styles.embedKey}>{embedKey}</code>

      <p className={styles.label} style={{ marginTop: 24 }}>
        Paste this on your site
      </p>
      <pre className={styles.snippet}>{snippet}</pre>
      <button onClick={copy} className={styles.copyBtn}>
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
