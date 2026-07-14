"use client";

import { useActionState, useState } from "react";
import type { Profile } from "@/lib/dal";
import { updateProfile } from "@/app/dashboard/profile/actions";
import { updateOwnerPreview } from "@/lib/widgetLiveUpdate";
import AvatarUpload from "./AvatarUpload";
import styles from "./widget-ui.module.css";

const BIO_MAX_LENGTH = 80;

export default function ProfileSection({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, {
    error: null,
  });
  const [bioLength, setBioLength] = useState((profile.bio ?? "").length);

  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Your profile</p>

      <AvatarUpload profileId={profile.id} currentUrl={profile.avatar_url} />

      <form action={formAction}>
        {state.error && <p className={styles.error}>{state.error}</p>}

        <div className={styles.fieldRowGroup}>
          <div className={styles.fieldRow}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              defaultValue={profile.name}
              onChange={(e) => updateOwnerPreview({ name: e.target.value })}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.label} htmlFor="website">
              Website
            </label>
            <input
              id="website"
              name="website"
              defaultValue={profile.website ?? ""}
              onChange={(e) => updateOwnerPreview({ website: e.target.value })}
              placeholder="yoursite.com"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <label className={styles.label} htmlFor="bio">
            Bio
          </label>
          <div className={styles.inputWithCounter}>
            <input
              id="bio"
              name="bio"
              type="text"
              maxLength={BIO_MAX_LENGTH}
              defaultValue={profile.bio ?? ""}
              onChange={(e) => {
                updateOwnerPreview({ bio: e.target.value });
                setBioLength(e.target.value.length);
              }}
              className={styles.input}
            />
            <span className={styles.inputCounter}>
              {bioLength}/{BIO_MAX_LENGTH}
            </span>
          </div>
        </div>

        <button type="submit" disabled={pending} className={styles.btnPrimary}>
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
