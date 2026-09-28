export interface YouTubeBroadcast {
  id: string;
  title: string;
  status: "created" | "ready" | "testing" | "live" | "complete";
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export class YouTubeService {
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(
    private clientId?: string,
    private clientSecret?: string,
    private refreshToken?: string,
    private persistentStreamId?: string
  ) {}

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.refreshToken);
  }

  private async getValidAccessToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;

    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      console.log("[YOUTUBE] Refreshing OAuth access token...");
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
          refresh_token: this.refreshToken!,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("[YOUTUBE AUTH ERROR]", err);
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken;
    } catch (err) {
      console.error("[YOUTUBE TOKEN REFRESH FAILED]", err);
      return null;
    }
  }

  /**
   * Create a scheduled live broadcast
   */
  public async createBroadcast(
    title: string,
    description: string,
    startTimeIso: string,
    endTimeIso: string
  ): Promise<string | null> {
    const token = await this.getValidAccessToken();
    if (!token) {
      console.log(`[YOUTUBE MOCK] createBroadcast: "${title}" (${startTimeIso} - ${endTimeIso})`);
      return `yt-mock-${Date.now()}`;
    }

    try {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              title,
              description,
              scheduledStartTime: startTimeIso,
              scheduledEndTime: endTimeIso,
            },
            status: {
              privacyStatus: "public",
              selfDeclaredMadeForKids: false,
            },
            contentDetails: {
              enableAutoStart: false,
              enableAutoStop: false,
              recordFromStart: true,
            },
          }),
        }
      );

      if (!res.ok) {
        console.error("[YOUTUBE CREATE BROADCAST FAILED]", await res.text());
        return null;
      }

      const data = await res.json();
      const broadcastId = data.id;
      console.log(`[YOUTUBE] Broadcast created successfully: ${broadcastId}`);

      if (this.persistentStreamId) {
        await this.bindToStream(broadcastId, this.persistentStreamId);
      }

      return broadcastId;
    } catch (err) {
      console.error("[YOUTUBE API ERROR]", err);
      return null;
    }
  }

  public async bindToStream(broadcastId: string, streamId: string): Promise<boolean> {
    const token = await this.getValidAccessToken();
    if (!token) return true;

    try {
      const url = `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcastId}&part=id,contentDetails&streamId=${streamId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async transitionBroadcast(
    broadcastId: string,
    status: "live" | "complete"
  ): Promise<boolean> {
    const token = await this.getValidAccessToken();
    if (!token) {
      console.log(`[YOUTUBE MOCK] Transitioned broadcast ${broadcastId} to: ${status}`);
      return true;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=${status}&id=${broadcastId}&part=status`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log(`[YOUTUBE] Transitioned broadcast ${broadcastId} to ${status}`);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`[YOUTUBE TRANSITION ERROR (${status})]`, err);
      return false;
    }
  }
}
