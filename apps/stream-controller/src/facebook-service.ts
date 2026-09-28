export class FacebookService {
  constructor(
    private pageId?: string,
    private pageAccessToken?: string
  ) {}

  public isConfigured(): boolean {
    return Boolean(this.pageId && this.pageAccessToken);
  }

  /**
   * Create Facebook Live Video at slot start
   */
  public async createLiveVideo(
    title: string,
    description: string
  ): Promise<{ id: string; streamUrl?: string } | null> {
    if (!this.isConfigured()) {
      console.log(`[FACEBOOK MOCK] createLiveVideo: "${title}"`);
      return { id: `fb-mock-${Date.now()}` };
    }

    try {
      console.log(`[FACEBOOK] Creating live video for Page ${this.pageId}...`);
      const url = `https://graph.facebook.com/v19.0/${this.pageId}/live_videos`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status: "LIVE_NOW",
          access_token: this.pageAccessToken,
        }),
      });

      if (!res.ok) {
        console.error("[FACEBOOK LIVE ERROR]", await res.text());
        return null;
      }

      const data = await res.json();
      console.log(`[FACEBOOK] Live video created: ${data.id}`);
      return { id: data.id, streamUrl: data.secure_stream_url };
    } catch (err) {
      console.error("[FACEBOOK API ERROR]", err);
      return null;
    }
  }

  /**
   * End Facebook Live Video at slot end
   */
  public async endLiveVideo(liveVideoId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log(`[FACEBOOK MOCK] Ended live video ${liveVideoId}`);
      return true;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${liveVideoId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          end_live_video: true,
          access_token: this.pageAccessToken,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("[FACEBOOK END VIDEO ERROR]", err);
      return false;
    }
  }
}
