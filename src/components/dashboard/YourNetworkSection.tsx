"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { removeConnection } from "@/app/dashboard/connections/actions";
import { MiniAvatar } from "./ConnectionsSection";
import ConfirmDialog from "./ConfirmDialog";
import ConnectionProfileModal from "./ConnectionProfileModal";
import { useToast } from "./ToastProvider";
import styles from "./widget-ui.module.css";

type OtherProfile =
  | { id: string; name: string; avatar_url: string | null; user_id: string | null }
  | undefined;
type MergeSuggestion = { id: string; name: string; avatar_url: string | null } | null;
type AcceptedRow = {
  request: { id: string };
  other: OtherProfile;
  note: string;
  endorsement: string;
  mergeSuggestion?: MergeSuggestion;
  // Set once a merge invitation has been sent and is still awaiting a
  // response -- see inviteMergeConnection.
  pendingMergeTarget?: MergeSuggestion;
};

const FILTER_THRESHOLD = 6;
const VISIBLE_CAP = 8;

export default function YourNetworkSection({
  accepted,
  owner,
}: {
  accepted: AcceptedRow[];
  owner: { id: string; name: string; avatar_url: string | null };
}) {
  const router = useRouter();
  const toast = useToast();
  const [acceptedState, setAcceptedState] = useState(accepted);
  const [query, setQuery] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ requestId: string; name: string } | null>(null);

  useEffect(() => setAcceptedState(accepted), [accepted]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return acceptedState;
    return acceptedState.filter((row) =>
      (row.other?.name ?? "").toLowerCase().includes(trimmed),
    );
  }, [acceptedState, query]);

  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_CAP);
  const hiddenCount = filtered.length - visible.length;
  const selectedRow = acceptedState.find((r) => r.request.id === selectedRequestId) ?? null;

  function handleConfirmRemove() {
    if (!removeTarget) return;
    const { requestId } = removeTarget;
    setRemoveTarget(null);
    setAcceptedState((prev) => prev.filter((r) => r.request.id !== requestId));
    removeConnection(requestId)
      .then(() => router.refresh())
      .catch((err) => {
        toast(err instanceof Error ? err.message : "Couldn't remove connection.");
        router.refresh();
      });
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Your network</p>

      {acceptedState.length > FILTER_THRESHOLD && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name"
          className={styles.input}
          style={{ width: "100%", marginBottom: 10 }}
        />
      )}

      <div className={styles.networkGrid}>
        {visible.map(({ request, other, note, endorsement }) => {
          const isPlaceholder = !!other && !other.user_id;
          return (
            <div key={request.id} className={styles.networkCard}>
              <button
                type="button"
                className={styles.networkCardHeader}
                onClick={() => setSelectedRequestId(request.id)}
              >
                <span className={styles.searchDropdownIdentity}>
                  <MiniAvatar url={other?.avatar_url} name={other?.name ?? "?"} />
                  <span className={styles.connectionName}>{other?.name ?? "Unknown"}</span>
                  {isPlaceholder && <span className={styles.badge}>Unclaimed</span>}
                </span>
                <span className={styles.networkRowMeta}>
                  {note && <span className={styles.networkDot} title="Has a private note" />}
                  {endorsement && (
                    <span className={styles.networkStar} title="Has a recommendation">
                      ★
                    </span>
                  )}
                  <span className={styles.networkChevron}>›</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className={styles.emptyState}>
          {acceptedState.length === 0 ? "No connections yet." : "No matches."}
        </p>
      )}

      {hiddenCount > 0 && (
        <div className={styles.networkShowMoreRow}>
          <button type="button" className={styles.smallLinkBtn} onClick={() => setShowAll(true)}>
            Show {hiddenCount} more
          </button>
        </div>
      )}

      {selectedRow && (
        <ConnectionProfileModal
          row={selectedRow}
          owner={owner}
          onClose={() => setSelectedRequestId(null)}
          onRequestRemove={(name) => {
            setSelectedRequestId(null);
            setRemoveTarget({ requestId: selectedRow.request.id, name });
          }}
          onDeleted={(requestId) => {
            setSelectedRequestId(null);
            setAcceptedState((prev) => prev.filter((r) => r.request.id !== requestId));
          }}
        />
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove connection?"
        message={
          removeTarget
            ? `${removeTarget.name} will no longer be shown in your network, and you'll no longer be shown in theirs.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
