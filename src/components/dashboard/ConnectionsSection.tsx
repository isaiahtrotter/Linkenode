"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  searchProfilesByName,
  sendConnectionRequest,
  cancelConnectionRequest,
  respondToRequest,
  saveConnectionNote,
  saveEndorsement,
  type SearchResult,
} from "@/app/dashboard/connections/actions";
import styles from "./widget-ui.module.css";

type OtherProfile = { id: string; name: string; avatar_url: string | null } | undefined;
type RequestRow = { request: { id: string }; other: OtherProfile };
type AcceptedRow = {
  request: { id: string };
  other: OtherProfile;
  note: string;
  endorsement: string;
};

const SEARCH_DEBOUNCE_MS = 200;
const NOTE_MAX_LENGTH = 80;

function MiniAvatar({ url, name }: { url: string | null | undefined; name: string }) {
  return (
    <span
      className={styles.miniAvatar}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    >
      {!url && name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function ConnectionsSection({
  incoming,
  outgoing,
  accepted,
}: {
  incoming: RequestRow[];
  outgoing: RequestRow[];
  accepted: AcceptedRow[];
}) {
  const router = useRouter();
  const [incomingState, setIncomingState] = useState(incoming);
  const [outgoingState, setOutgoingState] = useState(outgoing);
  const [acceptedState, setAcceptedState] = useState(accepted);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => setIncomingState(incoming), [incoming]);
  useEffect(() => setOutgoingState(outgoing), [outgoing]);
  useEffect(() => setAcceptedState(accepted), [accepted]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(async () => {
      const { results, error } = await searchProfilesByName(trimmed);
      if (seq !== requestSeq.current) return; // a newer keystroke superseded this
      setResults(results);
      setSearchError(error);
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSendRequest(id: string) {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "pending_outgoing" } : r)),
    );
    sendConnectionRequest(id).catch((err) => {
      setResults((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "not_connected" } : r)),
      );
      setActionError(err instanceof Error ? err.message : "Couldn't send request.");
    });
  }

  function handleAccept(requestId: string) {
    const item = incomingState.find((i) => i.request.id === requestId);
    setIncomingState((prev) => prev.filter((i) => i.request.id !== requestId));
    if (item) {
      setAcceptedState((prev) => [
        ...prev,
        { request: item.request, other: item.other, note: "", endorsement: "" },
      ]);
    }
    respondToRequest(requestId, true).catch((err) => {
      setActionError(err instanceof Error ? err.message : "Couldn't accept request.");
      router.refresh();
    });
  }

  function handleDecline(requestId: string) {
    setIncomingState((prev) => prev.filter((i) => i.request.id !== requestId));
    respondToRequest(requestId, false).catch((err) => {
      setActionError(err instanceof Error ? err.message : "Couldn't decline request.");
      router.refresh();
    });
  }

  function handleCancel(requestId: string) {
    setOutgoingState((prev) => prev.filter((o) => o.request.id !== requestId));
    cancelConnectionRequest(requestId).catch((err) => {
      setActionError(err instanceof Error ? err.message : "Couldn't cancel request.");
      router.refresh();
    });
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Connections</p>

      <div className={styles.searchWrap}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search by name"
          className={styles.input}
        />
        {isOpen && query.trim() && (
          <div className={styles.searchDropdown}>
            {isSearching && <div className={styles.searchDropdownItem}>Searching…</div>}
            {!isSearching && searchError && (
              <div className={styles.searchDropdownItem}>{searchError}</div>
            )}
            {!isSearching && !searchError && results.length === 0 && (
              <div className={styles.searchDropdownItem}>No matches.</div>
            )}
            {!isSearching &&
              results.map((r, index) => (
                <div
                  key={r.id}
                  className={styles.searchDropdownItem}
                  style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}
                >
                  <span className={styles.searchDropdownIdentity}>
                    <MiniAvatar url={r.avatar_url} name={r.name} />
                    <span>{r.name}</span>
                  </span>
                  {r.status === "not_connected" && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSendRequest(r.id)}
                    >
                      Send request
                    </button>
                  )}
                  {r.status === "pending_outgoing" && (
                    <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                  )}
                  {r.status === "pending_incoming" && (
                    <span className={`${styles.badge} ${styles.badgeIncoming}`}>
                      Wants to connect
                    </span>
                  )}
                  {r.status === "connected" && (
                    <span className={`${styles.badge} ${styles.badgeConnected}`}>Connected</span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {actionError && <p className={styles.error}>{actionError}</p>}

      {incomingState.length > 0 && (
        <>
          <p className={styles.cardLabel} style={{ marginTop: 20 }}>
            Incoming requests
          </p>
          <ul className={styles.list}>
            {incomingState.map(({ request, other }) => (
              <li key={request.id} className={styles.row}>
                <span className={styles.searchDropdownIdentity}>
                  <MiniAvatar url={other?.avatar_url} name={other?.name ?? "?"} />
                  <span>{other?.name ?? "Unknown"}</span>
                </span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className={styles.smallLinkBtn}
                    onClick={() => handleDecline(request.id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {outgoingState.length > 0 && (
        <>
          <p className={styles.cardLabel} style={{ marginTop: 20 }}>
            Outgoing requests
          </p>
          <ul className={styles.list}>
            {outgoingState.map(({ request, other }) => (
              <li key={request.id} className={styles.row}>
                <span className={styles.searchDropdownIdentity}>
                  <MiniAvatar url={other?.avatar_url} name={other?.name ?? "?"} />
                  <span>{other?.name ?? "Unknown"}</span>
                </span>
                <div className={styles.rowActions}>
                  <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                  <button
                    type="button"
                    className={styles.smallLinkBtn}
                    onClick={() => handleCancel(request.id)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={styles.cardLabel} style={{ marginTop: 20 }}>
        Your network
      </p>
      <ul className={styles.list}>
        {acceptedState.map(({ request, other, note, endorsement }) => (
          <li key={request.id} className={styles.connectionCard}>
            <span className={styles.searchDropdownIdentity}>
              <MiniAvatar url={other?.avatar_url} name={other?.name ?? "?"} />
              <span className={styles.connectionName}>{other?.name ?? "Unknown"}</span>
            </span>
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
                  await saveEndorsement(other.id, (formData.get("endorsement") as string) ?? "");
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
          </li>
        ))}
        {acceptedState.length === 0 && (
          <li className={styles.emptyState}>No connections yet.</li>
        )}
      </ul>
    </div>
  );
}
