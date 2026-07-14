"use client";

import { useEffect, useMemo, useState } from "react";
import { saveConnectionNote, saveEndorsement } from "@/app/dashboard/connections/actions";
import { MiniAvatar } from "./ConnectionsSection";
import styles from "./widget-ui.module.css";

type OtherProfile = { id: string; name: string; avatar_url: string | null } | undefined;
type AcceptedRow = {
  request: { id: string };
  other: OtherProfile;
  note: string;
  endorsement: string;
};

const NOTE_MAX_LENGTH = 80;
const FILTER_THRESHOLD = 6;

export default function YourNetworkSection({ accepted }: { accepted: AcceptedRow[] }) {
  const [acceptedState, setAcceptedState] = useState(accepted);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => setAcceptedState(accepted), [accepted]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return acceptedState;
    return acceptedState.filter((row) =>
      (row.other?.name ?? "").toLowerCase().includes(trimmed),
    );
  }, [acceptedState, query]);

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

      <ul className={styles.networkList}>
        {filtered.map(({ request, other, note, endorsement }) => {
          const isOpen = expandedId === request.id;
          return (
            <li key={request.id} className={styles.networkRow}>
              <button
                type="button"
                className={styles.networkRowHeader}
                onClick={() => setExpandedId(isOpen ? null : request.id)}
              >
                <span className={styles.searchDropdownIdentity}>
                  <MiniAvatar url={other?.avatar_url} name={other?.name ?? "?"} />
                  <span className={styles.connectionName}>{other?.name ?? "Unknown"}</span>
                </span>
                <span className={styles.networkRowMeta}>
                  {note && <span className={styles.networkDot} title="Has a private note" />}
                  {endorsement && (
                    <span className={styles.networkStar} title="Has a recommendation">
                      ★
                    </span>
                  )}
                  <span className={styles.networkChevron}>{isOpen ? "−" : "+"}</span>
                </span>
              </button>

              {isOpen && (
                <div className={styles.networkRowBody}>
                  <form action={saveConnectionNote} className={styles.noteForm}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input
                      name="note"
                      defaultValue={note}
                      maxLength={NOTE_MAX_LENGTH}
                      placeholder="How do you know them? (private)"
                      className={styles.input}
                    />
                    <button type="submit" className={styles.smallLinkBtn}>
                      Save
                    </button>
                  </form>
                  {other && (
                    <form
                      action={async (formData) => {
                        await saveEndorsement(
                          other.id,
                          (formData.get("endorsement") as string) ?? "",
                        );
                      }}
                      className={styles.noteForm}
                    >
                      <input
                        name="endorsement"
                        defaultValue={endorsement}
                        placeholder="Write a public recommendation…"
                        className={styles.input}
                      />
                      <button type="submit" className={styles.smallLinkBtn}>
                        Save
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className={styles.emptyState}>
            {acceptedState.length === 0 ? "No connections yet." : "No matches."}
          </li>
        )}
      </ul>
    </div>
  );
}
