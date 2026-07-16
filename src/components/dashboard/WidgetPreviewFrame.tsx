"use client";

import { useCallback, useEffect, useState } from "react";
import NetworkWidget from "@/components/NetworkWidget";
import { BUTTON_LABEL_MAX_LENGTH, LauncherIcon } from "./widgetStyleShared";
import { useToast } from "./ToastProvider";
import styles from "./widget-ui.module.css";

type Corner = "bottom-right" | "bottom-left";

// One shared graphic, mirrored via the black pill's x position, rather than
// two near-duplicate SVGs -- bottom-left sits at x=10, bottom-right at
// x=335 (the same numbers as the two designs this was built from).
function CornerGraphic({ corner }: { corner: Corner }) {
  const buttonX = corner === "bottom-left" ? 10 : 335;
  return (
    <svg viewBox="0 0 402 270" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="402" height="270" rx="10" fill="white" />
      <rect y="176" width="112" height="94" fill="#D9D9D9" />
      <rect y="45" width="112" height="128" fill="#D9D9D9" />
      <rect x="115" y="45" width="287" height="225" fill="#D9D9D9" />
      <rect x={buttonX} y="240" width="56" height="20" rx="7" fill="black" />
      <rect x="10" y="14" width="14" height="14" rx="7" fill="#D9D9D9" />
      <rect x="223" y="18.5" width="31" height="5" rx="2.5" fill="#D9D9D9" />
      <rect x="264" y="18.5" width="29" height="5" rx="2.5" fill="#D9D9D9" />
      <rect x="303" y="18.5" width="43" height="5" rx="2.5" fill="#D9D9D9" />
      <rect x="356" y="18.5" width="35" height="5" rx="2.5" fill="#D9D9D9" />
    </svg>
  );
}

export default function WidgetPreviewFrame({
  embedKey,
  networkVersion,
  label,
  onSaveLabel,
  onSaveTheme,
}: {
  embedKey: string;
  // Changes whenever who's in the network changes (add/remove/merge) —
  // used as NetworkWidget's key below to force a full remount + refetch,
  // since the widget only ever fetches once per mount otherwise (see
  // NetworkWidget.tsx's `initialized` ref).
  networkVersion: string;
  label: string;
  onSaveLabel: (label: string) => Promise<void>;
  onSaveTheme: (theme: "light" | "dark") => Promise<void>;
}) {
  const toast = useToast();

  // Inline embed mode is hidden for now (floating is the only option exposed
  // here) — the widget engine itself still fully supports data-mode="inline"
  // via a hand-written script tag, this just isn't surfaced in the snippet
  // builder at the moment.
  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const [labelDraft, setLabelDraft] = useState(label);
  useEffect(() => setLabelDraft(label), [label]);

  const attrs = [`data-embed-key="${embedKey}"`];
  if (corner !== "bottom-right") attrs.push(`data-corner="${corner}"`);
  const snippet = `<script src="${origin}/widget.js" ${attrs.join(" ")} async></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveLabel() {
    const trimmed = labelDraft.trim();
    if (!trimmed || trimmed === label) return;
    try {
      await onSaveLabel(trimmed);
      toast("Saved");
    } catch {
      toast("Couldn't save — try again");
    }
  }

  // Stable identity: this is threaded into the memoized NetworkWidget below,
  // which only re-renders (and wipes its live D3 state) when a prop's
  // identity actually changes -- a fresh closure every render would trigger
  // that on every keystroke in the fields on this page.
  const handleThemeChange = useCallback(
    async (theme: "light" | "dark") => {
      try {
        await onSaveTheme(theme);
        toast("Saved");
      } catch {
        toast("Couldn't save — try again");
      }
    },
    [onSaveTheme, toast],
  );

  return (
    <div className={styles.mainCol}>
      <div className={styles.previewCard}>
        <NetworkWidget
          key={networkVersion}
          embedKey={embedKey}
          mode="inline"
          onThemeChange={handleThemeChange}
        />
      </div>

      <div className={styles.buttonPreviewWrap}>
        <div className={styles.buttonMimic}>
          <LauncherIcon />
          <span className={styles.buttonMimicLabel}>{labelDraft || label}</span>
        </div>

        <div className={styles.inputWithCounter}>
          <input
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value.slice(0, BUTTON_LABEL_MAX_LENGTH))}
            onBlur={saveLabel}
            maxLength={BUTTON_LABEL_MAX_LENGTH}
            placeholder="Button text"
            className={styles.input}
          />
          <span className={styles.inputCounter}>
            {labelDraft.length}/{BUTTON_LABEL_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Embed on your site</p>

        <div className={styles.fieldRow}>
          <span className={styles.label}>Corner</span>
          <div className={styles.cornerPickerRow}>
            <button
              type="button"
              className={`${styles.cornerOption} ${corner === "bottom-left" ? styles.cornerOptionActive : ""}`}
              onClick={() => setCorner("bottom-left")}
              aria-pressed={corner === "bottom-left"}
              aria-label="Bottom left"
            >
              <CornerGraphic corner="bottom-left" />
            </button>
            <button
              type="button"
              className={`${styles.cornerOption} ${corner === "bottom-right" ? styles.cornerOptionActive : ""}`}
              onClick={() => setCorner("bottom-right")}
              aria-pressed={corner === "bottom-right"}
              aria-label="Bottom right"
            >
              <CornerGraphic corner="bottom-right" />
            </button>
          </div>
        </div>

        <pre className={styles.snippet}>{snippet}</pre>
        <button onClick={copy} className={styles.btnPrimary}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>
    </div>
  );
}
