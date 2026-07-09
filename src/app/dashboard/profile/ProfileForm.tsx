"use client";

import { useActionState } from "react";
import type { Profile, WorkSample } from "@/lib/dal";
import { updateProfile, addWorkSample, removeWorkSample } from "./actions";
import styles from "./profile.module.css";

export default function ProfileForm({
  profile,
  workSamples,
}: {
  profile: Profile;
  workSamples: WorkSample[];
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    { error: null },
  );
  const [sampleState, sampleAction, samplePending] = useActionState(
    addWorkSample,
    { error: null },
  );

  return (
    <div>
      <h1>Your profile</h1>

      <form action={profileAction} className={styles.form}>
        {profileState.error && <p className={styles.error}>{profileState.error}</p>}

        <label className={styles.label} htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={profile.name}
          required
          className={styles.input}
        />

        <label className={styles.label} htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          rows={3}
          className={styles.textarea}
        />

        <label className={styles.label} htmlFor="website">
          Website
        </label>
        <input
          id="website"
          name="website"
          defaultValue={profile.website ?? ""}
          placeholder="yoursite.com"
          className={styles.input}
        />

        <label className={styles.label} htmlFor="avatar_url">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://..."
          className={styles.input}
        />

        <button type="submit" disabled={profilePending} className={styles.saveBtn}>
          {profilePending ? "Saving…" : "Save profile"}
        </button>
      </form>

      <h2 className={styles.sectionTitle}>Work samples</h2>
      <ul className={styles.sampleList}>
        {workSamples.map((sample) => (
          <li key={sample.id} className={styles.sampleRow}>
            <span className={styles.sampleUrl}>{sample.url}</span>
            <form action={removeWorkSample.bind(null, sample.id)}>
              <button type="submit" className={styles.removeBtn}>
                Remove
              </button>
            </form>
          </li>
        ))}
        {workSamples.length === 0 && (
          <li className={styles.emptyState}>No work samples yet.</li>
        )}
      </ul>

      <form action={sampleAction} className={styles.addSampleForm}>
        {sampleState.error && <p className={styles.error}>{sampleState.error}</p>}
        <input
          name="url"
          placeholder="https://example.com/screenshot.png"
          className={styles.input}
        />
        <button type="submit" disabled={samplePending} className={styles.saveBtn}>
          {samplePending ? "Adding…" : "Add"}
        </button>
      </form>
    </div>
  );
}
