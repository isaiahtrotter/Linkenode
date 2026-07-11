declare global {
  interface Window {
    __updateNetworkWidgetOwner?: (patch: Record<string, unknown>) => void;
  }
}

export function updateOwnerPreview(patch: Record<string, unknown>) {
  window.__updateNetworkWidgetOwner?.(patch);
}
