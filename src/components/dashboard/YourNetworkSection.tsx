"use client";

import { useEffect, useState } from "react";
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

export default function YourNetworkSection({ accepted }: { accepted: AcceptedRow[] }) {
  const [acceptedState, setAcceptedState] = useState(accepted);

  useEffect(() => setAcceptedState(accepted), [accepted]);

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Your network</p>
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
