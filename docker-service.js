const Docker = require('dockerode');

class DockerMonitor {
  constructor() {
    // Connect to local Docker daemon
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async getContainers() {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers.map(container => ({
        id: container.Id.substring(0, 12),
        name: container.Names[0]?.replace('/', '') || 'unknown',
        image: container.Image,
        status: container.State,
        ports: container.Ports || [],
        created: container.Created
      }));
    } catch (error) {
      console.error('Error fetching containers:', error.message);
      return [];
    }
  }

  async getRunningContainers() {
    try {
      const containers = await this.docker.listContainers();
      return containers.map(container => ({
        id: container.Id.substring(0, 12),
        name: container.Names[0]?.replace('/', '') || 'unknown',
        image: container.Image,
        status: container.State,
        uptime: container.Status,
        ports: container.Ports || []
      }));
    } catch (error) {
      console.error('Error fetching running containers:', error.message);
      return [];
    }
  }

  async getContainerStats(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      
      // Calculate CPU percentage
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                       stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - 
                         stats.precpu_stats.system_cpu_usage;
      const cpuPercent = (cpuDelta / systemDelta) * 100;

      // Calculate memory usage
      const memoryUsage = stats.memory_stats.usage;
      const memoryLimit = stats.memory_stats.limit;
      const memoryPercent = (memoryUsage / memoryLimit) * 100;

      return {
        containerId: containerId.substring(0, 12),
        cpuUsage: cpuPercent.toFixed(2) + '%',
        memoryUsage: (memoryUsage / 1024 / 1024).toFixed(2) + 'MB',
        memoryLimit: (memoryLimit / 1024 / 1024).toFixed(2) + 'MB',
        memoryPercent: memoryPercent.toFixed(2) + '%'
      };
    } catch (error) {
      console.error('Error fetching container stats:', error.message);
      return null;
    }
  }

  async getDockerInfo() {
    try {
      const info = await this.docker.info();
      return {
        version: info.ServerVersion,
        containers: info.Containers,
        runningContainers: info.ContainersRunning,
        pausedContainers: info.ContainersPaused,
        stoppedContainers: info.ContainersStopped,
        images: info.Images,
        osType: info.OSType,
        architecture: info.Architecture
      };
    } catch (error) {
      console.error('Error fetching Docker info:', error.message);
      return null;
    }
  }
}

module.exports = DockerMonitor;
