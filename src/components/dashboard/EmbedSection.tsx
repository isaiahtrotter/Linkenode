"use client";

import { useEffect, useState } from "react";
import styles from "./widget-ui.module.css";

type EmbedType = "floating" | "inline";
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
  const [fillContainer, setFillContainer] = useState(false);
  const [copied, setCopied] = useState(false);
  // Starts empty on both server and first client render (matching SSR
  // output) and fills in after mount, so the URL doesn't cause a
  // hydration mismatch.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const attrs = [`data-embed-key="${embedKey}"`];
  if (embedType === "inline") {
    attrs.push('data-mode="inline"');
  } else {
    if (corner !== "bottom-right") attrs.push(`data-corner="${corner}"`);
    const trimmedLabel = label.trim();
    if (trimmedLabel && trimmedLabel !== DEFAULT_LABEL) {
      attrs.push(`data-label="${escapeAttr(trimmedLabel)}"`);
    }
    if (!showIcon) attrs.push('data-icon="false"');
  }

  const scriptTag = `<script src="${origin}/widget.js" ${attrs.join(" ")} async></script>`;

  const snippet =
    embedType === "inline"
      ? fillContainer
        ? `<div style="width: 100%; height: 100%;">\n  ${scriptTag}\n</div>`
        : `<div style="width: 480px; height: 600px;">\n  ${scriptTag}\n</div>`
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
      </div>

      {embedType === "inline" ? (
        <>
          <p className={styles.hint} style={{ marginBottom: 10 }}>
            Sits directly in your page, always open, and fills whatever
            element you put the script tag in.
          </p>
          <div className={styles.controlRow} style={{ marginBottom: 12 }}>
            <div className={styles.controlLabelRow}>
              <span>Fill container instead of a fixed size</span>
              <button
                type="button"
                className={`${styles.switch} ${fillContainer ? styles.switchOn : ""}`}
                onClick={() => setFillContainer((v) => !v)}
                aria-label="Toggle fill container"
              >
                <span className={styles.switchKnob} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.fieldRowGroup}>
          <div className={styles.fieldRow} style={{ flex: "0 0 120px" }}>
            <span className={styles.label}>Corner</span>
            <select
              value={corner}
              onChange={(e) => setCorner(e.target.value as Corner)}
              className={styles.input}
            >
              {CORNERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldRow}>
            <span className={styles.label}>Button text</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={DEFAULT_LABEL}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldRow} style={{ flex: "0 0 auto", alignItems: "center" }}>
            <span className={styles.label}>Icon</span>
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
      )}

      <pre className={styles.snippet}>{snippet}</pre>
      <button onClick={copy} className={styles.btnPrimary}>
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
