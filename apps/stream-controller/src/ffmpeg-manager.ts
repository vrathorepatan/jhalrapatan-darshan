import { spawn, ChildProcess } from "child_process";

export interface FFmpegStats {
  running: boolean;
  bitrate: number;
  uptime: number;
  startedAt: Date | null;
  lastRestartAt: Date | null;
  reconnectCount: number;
}

export class FFmpegManager {
  private process: ChildProcess | null = null;
  private isShuttingDown = false;
  private reconnectAttempts = 0;
  private startedAt: Date | null = null;
  private lastRestartAt: Date | null = null;
  private currentBitrate = 0;

  constructor(
    private cameraUrl: string,
    private youtubeRtmpUrl: string,
    private youtubeStreamKey: string,
    private facebookRtmpUrl?: string,
    private facebookStreamKey?: string,
    private targetBitrateKbps: number = 2800
  ) {}

  public start(): void {
    if (this.process) return;

    this.isShuttingDown = false;
    this.startedAt = new Date();
    this.lastRestartAt = new Date();

    console.log(`[FFMPEG] Starting ingest from: ${this.cameraUrl.replace(/:[^:]*@/, ":***@")}`);

    // Build FFmpeg command args
    // Inputs: RTSP/RTMP with TCP transport for maximum reliability over packet loss
    const ytOutput = `${this.youtubeRtmpUrl}/${this.youtubeStreamKey}`;
    const fbOutput =
      this.facebookRtmpUrl && this.facebookStreamKey
        ? `${this.facebookRtmpUrl}/${this.facebookStreamKey}`
        : null;

    const args: string[] = [
      "-hide_banner",
      "-loglevel", "warning",
      "-rtsp_transport", "tcp",
      "-i", this.cameraUrl,
      // Video encoding settings optimized for 24x7 temple live stream
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-b:v", `${this.targetBitrateKbps}k`,
      "-maxrate", `${Math.round(this.targetBitrateKbps * 1.15)}k`,
      "-bufsize", `${this.targetBitrateKbps * 2}k`,
      "-pix_fmt", "yuv420p",
      "-g", "60", // 2-second keyframe interval at 30 fps
      "-keyint_min", "60",
      "-sc_threshold", "0",
      // Audio encoding
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-ac", "2",
    ];

    if (fbOutput) {
      // Tee muxer to stream simultaneously to YouTube and Facebook
      args.push(
        "-f", "tee",
        "-map", "0:v",
        "-map", "0:a",
        `[f=flv:onfail=ignore]${ytOutput}|[f=flv:onfail=ignore]${fbOutput}`
      );
    } else {
      args.push("-f", "flv", ytOutput);
    }

    try {
      this.process = spawn("ffmpeg", args);

      this.process.stdout?.on("data", (data) => {
        this.parseFfmpegOutput(data.toString());
      });

      this.process.stderr?.on("data", (data) => {
        this.parseFfmpegOutput(data.toString());
      });

      this.process.on("error", (err) => {
        console.error("[FFMPEG ERROR]", err.message);
      });

      this.process.on("exit", (code, signal) => {
        console.warn(`[FFMPEG EXIT] Process exited with code ${code}, signal: ${signal}`);
        this.process = null;
        this.currentBitrate = 0;

        if (!this.isShuttingDown) {
          this.scheduleReconnect();
        }
      });
    } catch (err) {
      console.error("[FFMPEG SPAWN ERROR]", err);
      this.scheduleReconnect();
    }
  }

  public stop(): void {
    this.isShuttingDown = true;
    if (this.process) {
      console.log("[FFMPEG] Stopping stream...");
      this.process.kill("SIGTERM");
      this.process = null;
    }
    this.currentBitrate = 0;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    // Exponential backoff: 3s, 6s, 12s, max 30s
    const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`[FFMPEG] Reconnecting in ${delay / 1000}s (Attempt #${this.reconnectAttempts})...`);
    setTimeout(() => {
      if (!this.isShuttingDown) {
        this.start();
      }
    }, delay);
  }

  private parseFfmpegOutput(text: string): void {
    // Parse bitrate e.g. "bitrate=2840.5kbits/s"
    const match = text.match(/bitrate=\s*([0-9.]+)\s*kbits\/s/);
    if (match && match[1]) {
      this.currentBitrate = Math.round(parseFloat(match[1]));
      this.reconnectAttempts = 0; // reset backoff on successful frames
    }
  }

  public getStats(): FFmpegStats {
    const isRunning = Boolean(this.process && !this.process.killed);
    const uptime = this.startedAt && isRunning
      ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000)
      : 0;

    return {
      running: isRunning,
      bitrate: isRunning ? this.currentBitrate || this.targetBitrateKbps : 0,
      uptime,
      startedAt: this.startedAt,
      lastRestartAt: this.lastRestartAt,
      reconnectCount: this.reconnectAttempts,
    };
  }
}
