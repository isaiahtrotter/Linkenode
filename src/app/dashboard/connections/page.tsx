import { getOwnConnectionsData, getNetworkDirectory } from "@/lib/dal";
import ConnectionsSection from "@/components/dashboard/ConnectionsSection";
import YourNetworkSection from "@/components/dashboard/YourNetworkSection";
import NetworkDirectory from "@/components/dashboard/NetworkDirectory";
import styles from "@/components/dashboard/widget-ui.module.css";

export default async function ConnectionsPage() {
  const [connections, directory] = await Promise.all([
    getOwnConnectionsData(),
    getNetworkDirectory(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.mainCol}>
        <ConnectionsSection incoming={connections.incoming} outgoing={connections.outgoing} />
      </div>

      <div className={styles.mainCol}>
        <YourNetworkSection accepted={connections.accepted} />
      </div>

      <div className={styles.mainCol}>
        <NetworkDirectory initialDirectory={directory} />
      </div>
    </div>
  );
}
