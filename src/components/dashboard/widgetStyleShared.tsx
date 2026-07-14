"use client";

import { useMemo, useState } from "react";
import type { ButtonHoverStyle, WidgetSettings } from "@/lib/dal";
import styles from "./widget-ui.module.css";

export const MAX_CORNER_RADIUS = 30;

// Keep in sync with FONT_OPTIONS in public/network-widget/widget.js.
export const FONT_OPTIONS: { id: string; label: string; family: string; google: string | null }[] = [
  { id: "system", label: "System default", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", google: null },
  { id: "inter", label: "Inter", family: "'Inter', sans-serif", google: "Inter:wght@400;500;600;700" },
  { id: "roboto", label: "Roboto", family: "'Roboto', sans-serif", google: "Roboto:wght@400;500;700" },
  { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif", google: "Poppins:wght@400;500;600;700" },
  { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", google: "Montserrat:wght@400;500;600;700" },
  { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif", google: "Space+Grotesk:wght@400;500;600;700" },
  { id: "dm-sans", label: "DM Sans", family: "'DM Sans', sans-serif", google: "DM+Sans:wght@400;500;700" },
  { id: "work-sans", label: "Work Sans", family: "'Work Sans', sans-serif", google: "Work+Sans:wght@400;500;600;700" },
  { id: "nunito", label: "Nunito", family: "'Nunito', sans-serif", google: "Nunito:wght@400;600;700" },
  { id: "playfair-display", label: "Playfair Display", family: "'Playfair Display', serif", google: "Playfair+Display:wght@400;600;700" },
  { id: "merriweather", label: "Merriweather", family: "'Merriweather', serif", google: "Merriweather:wght@400;700" },
  { id: "lora", label: "Lora", family: "'Lora', serif", google: "Lora:wght@400;500;600;700" },
  { id: "space-mono", label: "Space Mono", family: "'Space Mono', monospace", google: "Space+Mono:wght@400;700" },
  { id: "jetbrains-mono", label: "JetBrains Mono", family: "'JetBrains Mono', monospace", google: "JetBrains+Mono:wght@400;500;700" },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", google: "Oswald:wght@400;500;600;700" },
  { id: "bebas-neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", google: "Bebas+Neue" },
];
export const FONT_BY_ID = new Map(FONT_OPTIONS.map((f) => [f.id, f]));

export const DEFAULT_SETTINGS: WidgetSettings = {
  theme: "light",
  cornerRadius: 24,
  shadow: 60,
  buttonFontSize: 13,
  buttonFontWeight: 600,
  buttonLetterSpacing: 0,
  buttonPaddingX: 16,
  buttonPaddingY: 14,
  buttonBorderColor: "#e0ded8",
  buttonBorderWidth: 1,
  buttonBorderRadius: 14,
  buttonBackgroundColor: "#faf9f6",
  buttonHoverStyle: "scale",
  buttonFontFamily: "system",
};

export const HOVER_STYLES: { value: ButtonHoverStyle; label: string }[] = [
  { value: "scale", label: "Scale" },
  { value: "lift", label: "Lift" },
  { value: "glow", label: "Glow" },
  { value: "darken", label: "Darken" },
  { value: "none", label: "None" },
];

export const HOVER_STYLE_CLASS: Record<ButtonHoverStyle, string | undefined> = {
  scale: undefined,
  lift: "hoverLift",
  glow: "hoverGlow",
  darken: "hoverDarken",
  none: "hoverNone",
};

export function shadowCss(intensity: number): string {
  if (intensity <= 0) return "none";
  const offsetY = Math.round(8 + (intensity / 100) * 12);
  const blur = Math.round(20 + (intensity / 100) * 40);
  const opacity = ((intensity / 100) * 0.25).toFixed(3);
  return `0 ${offsetY}px ${blur}px rgba(0,0,0,${opacity})`;
}

export function LauncherIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" style={{ flexShrink: 0 }}>
      <line x1="32" y1="32" x2="14" y2="18" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="50" y2="16" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="16" y2="46" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="48" y2="48" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" />
      <circle cx="14" cy="18" r="6" fill="#D94F2B" />
      <circle cx="50" cy="16" r="6" fill="#AC57D6" />
      <circle cx="16" cy="46" r="6" fill="#128A66" />
      <circle cx="48" cy="48" r="6" fill="#C2477F" />
      <circle cx="32" cy="32" r="9" fill="#1D69E0" />
    </svg>
  );
}

export function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selected = FONT_BY_ID.get(value) ?? FONT_OPTIONS[0];
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return FONT_OPTIONS;
    return FONT_OPTIONS.filter((f) => f.label.toLowerCase().includes(trimmed));
  }, [query]);

  return (
    <div className={styles.searchWrap}>
      <input
        value={isOpen ? query : selected.label}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search fonts…"
        className={styles.input}
      />
      {isOpen && (
        <div className={styles.searchDropdown}>
          {filtered.length === 0 && (
            <div className={styles.searchDropdownItem}>No matches.</div>
          )}
          {filtered.map((f, index) => (
            <div
              key={f.id}
              className={styles.searchDropdownItem}
              style={{
                fontFamily: f.family,
                animationDelay: `${Math.min(index, 6) * 20}ms`,
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(f.id);
                setIsOpen(false);
                setQuery("");
              }}
            >
              <span>{f.label}</span>
              {f.id === value && <span style={{ fontFamily: "inherit" }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
