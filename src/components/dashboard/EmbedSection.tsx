"use client";

import { useState } from "react";
import styles from "./widget-ui.module.css";

type EmbedType = "floating" | "inline" | "trigger";
type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNERS: { value: Corner; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

const DEFAULT_LABEL = "View My Network";

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function EmbedSection({ embedKey }: { embedKey: string }) {
  const [embedType, setEmbedType] = useState<EmbedType>("floating");
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [showIcon, setShowIcon] = useState(true);
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const attrs = [`data-embed-key="${embedKey}"`];
  if (embedType === "inline") {
    attrs.push('data-mode="inline"');
  } else {
    if (corner !== "bottom-right") attrs.push(`data-corner="${corner}"`);
    if (embedType === "trigger") {
      attrs.push('data-hide-launcher="true"');
    } else {
      const trimmedLabel = label.trim();
      if (trimmedLabel && trimmedLabel !== DEFAULT_LABEL) {
        attrs.push(`data-label="${escapeAttr(trimmedLabel)}"`);
      }
      if (!showIcon) attrs.push('data-icon="false"');
    }
  }

  const scriptTag = `<script src="${origin}/widget.js" ${attrs.join(" ")} async></script>`;

  const snippet =
    embedType === "inline"
      ? `<div style="width: 480px; height: 600px;">\n  ${scriptTag}\n</div>`
      : embedType === "trigger"
        ? `${scriptTag}\n\n<button data-network-widget-open>View my network</button>`
        : scriptTag;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Embed on your site</p>

      <div className={styles.modeToggle}>
        <button
          type="button"
          onClick={() => setEmbedType("floating")}
          className={`${styles.modeOption} ${embedType === "floating" ? styles.modeOptionActive : ""}`}
        >
          Floating button
        </button>
        <button
          type="button"
          onClick={() => setEmbedType("inline")}
          className={`${styles.modeOption} ${embedType === "inline" ? styles.modeOptionActive : ""}`}
        >
          Inline
        </button>
        <button
          type="button"
          onClick={() => setEmbedType("trigger")}
          className={`${styles.modeOption} ${embedType === "trigger" ? styles.modeOptionActive : ""}`}
        >
          My own button
        </button>
      </div>

      {embedType === "inline" && (
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          Sits directly in your page, always open, and fills whatever element
          you put the script tag in — size and style that element however you
          like.
        </p>
      )}

      {embedType === "trigger" && (
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          No default button is shown. Put the <code>data-network-widget-open</code>{" "}
          attribute on any link or button anywhere on your site — styled
          however you like — and clicking it opens the widget.
        </p>
      )}

      {(embedType === "floating" || embedType === "trigger") && (
        <div className={styles.fieldRow}>
          <span className={styles.label}>Corner</span>
          <div className={styles.corners}>
            {CORNERS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCorner(c.value)}
                className={`${styles.cornerOption} ${corner === c.value ? styles.cornerOptionActive : ""}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {embedType === "floating" && (
        <>
          <div className={styles.fieldRow}>
            <span className={styles.label}>Button text</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={DEFAULT_LABEL}
              className={styles.input}
            />
          </div>
          <div className={styles.controlRow} style={{ marginBottom: 12 }}>
            <div className={styles.controlLabelRow}>
              <span>Show icon</span>
              <button
                type="button"
                className={`${styles.switch} ${showIcon ? styles.switchOn : ""}`}
                onClick={() => setShowIcon((v) => !v)}
                aria-label="Toggle icon"
              >
                <span className={styles.switchKnob} />
              </button>
            </div>
          </div>
        </>
      )}

      <pre className={styles.snippet}>{snippet}</pre>
      <button onClick={copy} className={styles.btnPrimary}>
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
