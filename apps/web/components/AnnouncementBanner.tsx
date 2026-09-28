// Server component – reads announcements from static data (DB integration in Milestone 4)

const DEMO_ANNOUNCEMENT = {
  active: true,
  message_hi:
    "🙏 झालरापाटन दर्शन में आपका स्वागत है। यह वेबसाइट निर्माणाधीन है। दर्शन समय की पुष्टि मंदिर समिति से करें।",
};

export function AnnouncementBanner() {
  if (!DEMO_ANNOUNCEMENT.active) return null;

  return (
    <div className="announcement-banner" role="banner" aria-live="polite">
      <span style={{ flexShrink: 0, fontSize: "1.1rem" }}>📢</span>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit" }}>
        {DEMO_ANNOUNCEMENT.message_hi}
      </p>
    </div>
  );
}
