import { getOwnProfile, getOwnWorkSamples } from "@/lib/dal";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const workSamples = await getOwnWorkSamples();

  return <ProfileForm profile={profile} workSamples={workSamples} />;
}
