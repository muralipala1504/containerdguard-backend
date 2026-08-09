const k8s = require('@kubernetes/client-node');
const path = require('path');
const os = require('os');

class K8sMonitor {
  constructor() {
    this.kc = new k8s.KubeConfig();
    const kubeConfigPath = path.join(os.homedir(), '.kube', 'k3d-config');
    this.kc.loadFromFile(kubeConfigPath);
    this.kc.clusters[0].skipTLSVerify = true;
    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
  }

  async getClusterInfo() {
    try {
      const res = await this.k8sApi.listNode();
      const items = res.items || res.body?.items || [];
      return {
        nodes: items.length,
        nodeList: items.map(node => ({
          name: node.metadata.name,
          status: node.status.conditions.find(c => c.type === 'Ready')?.status,
          kubeletVersion: node.status.nodeInfo.kubeletVersion,
          cpu: node.status.allocatable?.cpu,
          memory: node.status.allocatable?.memory
        }))
      };
    } catch (error) {
      console.error('Error fetching cluster info:', error.message);
      return null;
    }
  }

  async getAllPods() {
    try {
      const res = await this.k8sApi.listPodForAllNamespaces();
      const items = res.items || res.body?.items || [];
      return items.map(pod => ({
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        status: pod.status.phase,
        containers: pod.spec.containers.length,
        restarts: pod.status.containerStatuses?.[0]?.restartCount || 0,
        createdAt: pod.metadata.creationTimestamp,
        image: pod.spec.containers[0]?.image
      }));
    } catch (error) {
      console.error('Error fetching all pods:', error.message);
      return [];
    }
  }
}

module.exports = K8sMonitor;
