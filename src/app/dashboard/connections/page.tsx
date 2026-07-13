import { getOwnConnectionsData, getNetworkDirectory } from "@/lib/dal";
import ConnectionsSection from "@/components/dashboard/ConnectionsSection";
import NetworkDirectory from "@/components/dashboard/NetworkDirectory";
import styles from "@/components/dashboard/widget-ui.module.css";

export default async function ConnectionsPage() {
  const [connections, directory] = await Promise.all([
    getOwnConnectionsData(),
    getNetworkDirectory(),
  ]);

  return (
    <div className={styles.connectionsPage}>
      <ConnectionsSection
        incoming={connections.incoming}
        outgoing={connections.outgoing}
        accepted={connections.accepted}
      />
      <NetworkDirectory initialDirectory={directory} />
    </div>
  );
}
