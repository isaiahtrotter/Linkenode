"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import type { ButtonHoverStyle } from "@/lib/dal";
import { FONT_BY_ID, FONT_OPTIONS, HOVER_STYLE_CLASS, LauncherIcon } from "./widgetStyleShared";
import styles from "./widget-ui.module.css";
import pageStyles from "./dashboard-page.module.css";

const DEFAULT_LABEL = "View My Network";

type Corner = "bottom-right" | "bottom-left";

const CORNERS: { value: Corner; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
];

export type ButtonStyleValues = {
  buttonFontFamily: string;
  buttonFontSize: number;
  buttonFontWeight: number;
  buttonLetterSpacing: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  buttonBorderColor: string;
  buttonBorderWidth: number;
  buttonBorderRadius: number;
  buttonBackgroundColor: string;
  buttonHoverStyle: ButtonHoverStyle;
};

export default function WidgetPreviewFrame({
  embedKey,
  containerRef,
  selectedFrame,
  onSelectInline,
  buttonStyle,
}: {
  embedKey: string;
  containerRef: RefObject<HTMLDivElement | null>;
  selectedFrame: "inline" | null;
  onSelectInline: () => void;
  buttonStyle: ButtonStyleValues;
}) {
  // Inline embed mode is hidden for now (floating is the only option exposed
  // here) — the widget engine itself still fully supports data-mode="inline"
  // via a hand-written script tag, this just isn't surfaced in the snippet
  // builder at the moment.
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const attrs = [`data-embed-key="${embedKey}"`];
  if (corner !== "bottom-right") attrs.push(`data-corner="${corner}"`);
  const snippet = `<script src="${origin}/widget.js" ${attrs.join(" ")} async></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const {
    buttonFontFamily,
    buttonFontSize,
    buttonFontWeight,
    buttonLetterSpacing,
    buttonPaddingX,
    buttonPaddingY,
    buttonBorderColor,
    buttonBorderWidth,
    buttonBorderRadius,
    buttonBackgroundColor,
    buttonHoverStyle,
  } = buttonStyle;

  const mimicStyle: CSSProperties & Record<string, string | number> = {
    paddingTop: buttonPaddingY,
    paddingBottom: buttonPaddingY,
    paddingLeft: buttonPaddingX,
    paddingRight: buttonPaddingX,
    borderRadius: buttonBorderRadius,
    "--mimic-bg": buttonBackgroundColor,
    "--mimic-border-color": buttonBorderColor,
    "--mimic-border-width": `${buttonBorderWidth}px`,
  };
  const hoverClass = HOVER_STYLE_CLASS[buttonHoverStyle];
  const selectedFont = FONT_BY_ID.get(buttonFontFamily) ?? FONT_OPTIONS[0];

  return (
    <div className={styles.mainCol}>
      <div
        data-select-trigger="inline"
        onClickCapture={onSelectInline}
        className={`${pageStyles.selectableWrap} ${selectedFrame === "inline" ? pageStyles.selectableWrapActive : ""}`}
      >
        {/* Capture phase, not bubble — the live D3 graph's own node-click
            handler calls stopPropagation() (it's meant to stop a real
            third-party embed's clicks from leaking into the host page),
            which would otherwise silently swallow a bubble-phase onClick
            here before it ever fires. Capture runs on the way down, before
            that stopPropagation happens on the way back up. */}
        <div className={styles.previewCard} ref={containerRef}>
          <NetworkWidget embedKey={embedKey} mode="inline" />
        </div>
      </div>

      <div className={styles.buttonPreviewWrap}>
        <div
          className={`${styles.buttonMimic} ${hoverClass ? styles[hoverClass] : ""}`}
          style={mimicStyle}
        >
          <LauncherIcon />
          <span
            className={styles.buttonMimicLabel}
            style={{
              fontFamily: selectedFont.family,
              fontSize: buttonFontSize,
              fontWeight: buttonFontWeight,
              letterSpacing: buttonLetterSpacing,
            }}
          >
            {DEFAULT_LABEL}
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Embed on your site</p>

        <div className={styles.fieldRow} style={{ flex: "0 0 160px" }}>
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

        <pre className={styles.snippet}>{snippet}</pre>
        <button onClick={copy} className={styles.btnPrimary}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>
    </div>
  );
}
