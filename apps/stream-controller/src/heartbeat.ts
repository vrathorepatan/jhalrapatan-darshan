import { FFmpegStats } from "./ffmpeg-manager.js";

export class HeartbeatReporter {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private webApiUrl: string,
    private token: string,
    private getFfmpegStats: () => FFmpegStats,
    private intervalMs: number = 30000
  ) {}

  public start(): void {
    if (this.timer) return;
    this.send();
    this.timer = setInterval(() => this.send(), this.intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async send(): Promise<void> {
    const stats = this.getFfmpegStats();
    const endpoint = `${this.webApiUrl.replace(/\/$/, "")}/api/stream/heartbeat`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          ingestConnected: stats.running,
          bitrate: stats.bitrate,
          uptime: stats.uptime,
        }),
      });

      if (!res.ok) {
        console.warn(`[HEARTBEAT WARN] Server responded with status ${res.status}`);
      }
    } catch (err: any) {
      console.warn(`[HEARTBEAT DROP] Could not reach web API: ${err.message}`);
    }
  }
}
