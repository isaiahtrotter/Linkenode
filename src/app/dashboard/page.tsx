import {
  getOwnProfile,
  getOwnWorkSamples,
  getOwnConnectionsData,
  getNetworkDirectory,
} from "@/lib/dal";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default async function Page() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const [workSamples, connections, directory] = await Promise.all([
    getOwnWorkSamples(),
    getOwnConnectionsData(),
    getNetworkDirectory(),
  ]);

  return (
    <DashboardPage
      profile={profile}
      workSamples={workSamples}
      connections={connections}
      directory={directory}
    />
  );
}
