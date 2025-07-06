import { CognitionDaemon, ChatEvent, SystemInjection, SystemInput } from './CognitionDaemon';

class DaemonService {
  private static instance: DaemonService;
  private daemon: CognitionDaemon | null = null;
  private isInitializing = false;

  private constructor() {}

  static getInstance(): DaemonService {
    if (!DaemonService.instance) {
      DaemonService.instance = new DaemonService();
    }
    return DaemonService.instance;
  }

  async initializeDaemon(): Promise<void> {
    if (this.daemon && this.daemon.isHealthy()) {
      console.log("🧠 [DaemonService] Daemon already running and healthy");
      return;
    }

    if (this.isInitializing) {
      console.log("🧠 [DaemonService] Daemon initialization already in progress");
      return;
    }

    this.isInitializing = true;
    
    try {
      console.log("🧠 [DaemonService] Starting CognitionDaemon...");
      this.daemon = new CognitionDaemon();
      await this.daemon.boot();
      console.log("🧠 [DaemonService] CognitionDaemon started successfully");
    } catch (error) {
      console.error("🧠 [DaemonService] Error starting daemon:", error);
      this.daemon = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async getDaemon(): Promise<CognitionDaemon> {
    if (!this.daemon || !this.daemon.isHealthy()) {
      await this.initializeDaemon();
    }
    
    if (!this.daemon) {
      throw new Error("Failed to initialize daemon");
    }
    
    return this.daemon;
  }

  async observeChat(chatEvent: ChatEvent): Promise<void> {
    try {
      const daemon = await this.getDaemon();
      await daemon.observe(chatEvent);
    } catch (error) {
      console.error("🧠 [DaemonService] Error observing chat:", error);
    }
  }

  async getSystemInjections(): Promise<(SystemInjection | SystemInput)[]> {
    try {
      const daemon = await this.getDaemon();
      return await daemon.inject();
    } catch (error) {
      console.error("🧠 [DaemonService] Error getting injections:", error);
      return [];
    }
  }

  async getDaemonState() {
    try {
      const daemon = await this.getDaemon();
      return daemon.getState();
    } catch (error) {
      console.error("🧠 [DaemonService] Error getting state:", error);
      return null;
    }
  }

  async shutdownDaemon(): Promise<void> {
    if (this.daemon) {
      console.log("🧠 [DaemonService] Shutting down daemon...");
      await this.daemon.shutdown();
      this.daemon = null;
    }
  }

  isHealthy(): boolean {
    return this.daemon?.isHealthy() ?? false;
  }
}

// Export singleton instance
export const daemonService = DaemonService.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🧠 [DaemonService] Received SIGINT, shutting down gracefully...');
  await daemonService.shutdownDaemon();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🧠 [DaemonService] Received SIGTERM, shutting down gracefully...');
  await daemonService.shutdownDaemon();
  process.exit(0);
});