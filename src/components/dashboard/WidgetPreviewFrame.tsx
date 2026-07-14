"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import type { ButtonHoverStyle } from "@/lib/dal";
import { FONT_BY_ID, FONT_OPTIONS, HOVER_STYLE_CLASS, LauncherIcon } from "./widgetStyleShared";
import styles from "./widget-ui.module.css";
import canvasStyles from "./canvas.module.css";

const DEFAULT_LABEL = "View My Network";

type EmbedType = "floating" | "inline";
type Corner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const CORNERS: { value: Corner; label: string }[] = [
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
  interactive,
  selectedFrame,
  onSelectInline,
  onSelectButton,
  buttonStyle,
}: {
  embedKey: string;
  containerRef: RefObject<HTMLDivElement | null>;
  interactive: boolean;
  selectedFrame: "button" | "inline" | null;
  onSelectInline: () => void;
  onSelectButton: () => void;
  buttonStyle: ButtonStyleValues;
}) {
  const [embedType, setEmbedType] = useState<EmbedType>("floating");
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [showIcon, setShowIcon] = useState(true);
  const [iconEmoji, setIconEmoji] = useState("");
  const [fillContainer, setFillContainer] = useState(false);
  const [copied, setCopied] = useState(false);
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
    if (!showIcon) {
      attrs.push('data-icon="false"');
    } else if (iconEmoji.trim()) {
      attrs.push(`data-icon-emoji="${escapeAttr(iconEmoji.trim())}"`);
    }
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
    <div className={styles.page}>
      <div className={styles.sideCol}>
        <div
          data-select-trigger="inline"
          onClick={onSelectInline}
          className={`${canvasStyles.selectableWrap} ${selectedFrame === "inline" ? canvasStyles.selectableWrapActive : ""}`}
          style={{ position: "relative" }}
        >
          <div className={styles.previewCard} ref={containerRef} data-canvas-passthrough>
            <NetworkWidget embedKey={embedKey} mode="inline" />
          </div>
          {/* Physically blocks pointer events from reaching the widget when
              not focused, rather than toggling pointer-events on an
              ancestor — the widget's own CSS (mode-inline .panel-expanded)
              unconditionally sets pointer-events: auto on itself, which a
              descendant can always do regardless of an ancestor's "none". */}
          {!interactive && <div className={canvasStyles.previewOverlay} aria-hidden="true" />}
        </div>

        <div
          data-select-trigger="button"
          onClick={onSelectButton}
          className={`${styles.buttonPreviewWrap} ${canvasStyles.selectableWrap} ${selectedFrame === "button" ? canvasStyles.selectableWrapActive : ""}`}
        >
          <div
            className={`${styles.buttonMimic} ${hoverClass ? styles[hoverClass] : ""}`}
            style={mimicStyle}
          >
            {showIcon &&
              (iconEmoji.trim() ? (
                <span style={{ fontSize: 18, lineHeight: 1 }}>{iconEmoji.trim()}</span>
              ) : (
                <LauncherIcon />
              ))}
            <span
              className={styles.buttonMimicLabel}
              style={{
                fontFamily: selectedFont.family,
                fontSize: buttonFontSize,
                fontWeight: buttonFontWeight,
                letterSpacing: buttonLetterSpacing,
              }}
            >
              {label.trim() || DEFAULT_LABEL}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainCol}>
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
            <>
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

              {showIcon && (
                <div className={styles.fieldRow}>
                  <span className={styles.label}>Custom icon (optional)</span>
                  <input
                    value={iconEmoji}
                    onChange={(e) => setIconEmoji(e.target.value)}
                    placeholder="Paste any emoji, e.g. 👋 — leave blank for the default"
                    className={styles.input}
                  />
                </div>
              )}
            </>
          )}

          <pre className={styles.snippet}>{snippet}</pre>
          <button onClick={copy} className={styles.btnPrimary}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
