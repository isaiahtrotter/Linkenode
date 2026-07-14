"use client";

import type { ReactNode } from "react";
import type { CanvasFrame } from "@/lib/dashboard/useCanvasTransform";
import styles from "./canvas.module.css";

export default function Frame({ frame, children }: { frame: CanvasFrame; children: ReactNode }) {
  return (
    <div
      data-frame
      data-frame-id={frame.id}
      className={styles.frame}
      style={{ left: frame.x, top: frame.y, width: frame.width }}
    >
      <p className={styles.frameLabel}>{frame.label}</p>
      <div className={styles.frameBody}>{children}</div>
    </div>
  );
}
