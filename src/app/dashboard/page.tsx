import {
  getOwnProfile,
  getOwnWorkSamples,
  getOwnConnectionsData,
  getNetworkDirectory,
  getSessionUser,
} from "@/lib/dal";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default async function Page() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const [workSamples, connections, directory, user] = await Promise.all([
    getOwnWorkSamples(),
    getOwnConnectionsData(),
    getNetworkDirectory(),
    getSessionUser(),
  ]);

  return (
    <DashboardPage
      profile={profile}
      workSamples={workSamples}
      connections={connections}
      directory={directory}
      email={user?.email ?? null}
    />
  );
}
