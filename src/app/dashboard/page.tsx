import {
  getOwnProfile,
  getOwnWorkSamples,
  getOwnConnectionsData,
  getNetworkDirectory,
} from "@/lib/dal";
import DashboardCanvas from "@/components/dashboard/DashboardCanvas";

export default async function DashboardPage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const [workSamples, connections, directory] = await Promise.all([
    getOwnWorkSamples(),
    getOwnConnectionsData(),
    getNetworkDirectory(),
  ]);

  return (
    <DashboardCanvas
      profile={profile}
      workSamples={workSamples}
      connections={connections}
      directory={directory}
    />
  );
}
