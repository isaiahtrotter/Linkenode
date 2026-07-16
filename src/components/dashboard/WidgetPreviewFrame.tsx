"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import type { ButtonHoverStyle } from "@/lib/dal";
import { FONT_BY_ID, FONT_OPTIONS, HOVER_STYLE_CLASS, LauncherIcon } from "./widgetStyleShared";
import styles from "./widget-ui.module.css";
import pageStyles from "./dashboard-page.module.css";

const DEFAULT_LABEL = "View My Network";

type EmbedType = "floating" | "inline";
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
  onSelectButton,
  buttonStyle,
}: {
  embedKey: string;
  containerRef: RefObject<HTMLDivElement | null>;
  selectedFrame: "button" | "inline" | null;
  onSelectInline: () => void;
  onSelectButton: () => void;
  buttonStyle: ButtonStyleValues;
}) {
  const [embedType, setEmbedType] = useState<EmbedType>("floating");
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [fillContainer, setFillContainer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const attrs = [`data-embed-key="${embedKey}"`];
  if (embedType === "inline") {
    attrs.push('data-mode="inline"');
  } else if (corner !== "bottom-right") {
    attrs.push(`data-corner="${corner}"`);
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

      <div
        data-select-trigger="button"
        onClickCapture={onSelectButton}
        className={`${styles.buttonPreviewWrap} ${pageStyles.selectableWrap} ${selectedFrame === "button" ? pageStyles.selectableWrapActive : ""}`}
      >
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
          )}

          <pre className={styles.snippet}>{snippet}</pre>
          <button onClick={copy} className={styles.btnPrimary}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
      </div>
    </div>
  );
}
