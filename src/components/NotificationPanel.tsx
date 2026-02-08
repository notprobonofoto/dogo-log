import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Bell, PawPrint, Utensils, MoreHorizontal, Send, Clock } from "lucide-react";

interface Notification {
  id: string;
  from_profile_id: string;
  from_name?: string;
  type: "walk" | "feed" | "other";
  scheduled_time: string | null;
  note: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { profile, householdId, householdMembers } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendType, setSendType] = useState<"walk" | "feed" | "other">("walk");
  const [sendTime, setSendTime] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  const fetchNotifications = async () => {
    if (!householdId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        profiles:from_profile_id (name)
      `)
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    setNotifications(
      (data || []).map((n: any) => ({
        id: n.id,
        from_profile_id: n.from_profile_id,
        from_name: n.profiles?.name,
        type: n.type,
        scheduled_time: n.scheduled_time,
        note: n.note,
        is_read: n.is_read,
        created_at: n.created_at,
      }))
    );
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  };

  const sendNotification = async () => {
    if (!profile || !householdId) return;

    setSending(true);

    const { error } = await supabase.from("notifications").insert({
      household_id: householdId,
      from_profile_id: profile.id,
      type: sendType,
      scheduled_time: sendTime || null,
      note: sendNote.trim() || null,
    });

    if (error) {
      console.error("Error sending notification:", error);
    } else {
      setSendType("walk");
      setSendTime("");
      setSendNote("");
      setShowSendForm(false);
      fetchNotifications();
    }

    setSending(false);
  };

  const typeIcons = {
    walk: <PawPrint className="w-5 h-5 text-primary" />,
    feed: <Utensils className="w-5 h-5 text-accent" />,
    other: <MoreHorizontal className="w-5 h-5 text-muted-foreground" />,
  };

  const typeLabels = {
    walk: t("walkRequest"),
    feed: t("feedRequest"),
    other: t("other"),
  };

  const unreadCount = notifications.filter((n) => !n.is_read && n.from_profile_id !== profile?.id).length;

  return (
    <div className="bg-card rounded-xl p-4 mb-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">{t("notifications")}</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Send notification button */}
      <button
        onClick={() => setShowSendForm(!showSendForm)}
        className="w-full py-2 mb-4 rounded-lg bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {t("sendRequest")}
      </button>

      {/* Send form */}
      {showSendForm && (
        <div className="bg-background rounded-lg p-3 mb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["walk", "feed", "other"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSendType(type)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  sendType === type ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {typeIcons[type]}
                <span className="text-xs">{typeLabels[type]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <input
              type="time"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              placeholder={t("time")}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="text"
            value={sendNote}
            onChange={(e) => setSendNote(e.target.value)}
            placeholder={t("optionalNote")}
            maxLength={100}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={sendNotification}
            disabled={sending}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
          >
            {sending ? "..." : t("send")}
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-4">{t("noNotifications")}</p>
        ) : (
          notifications.map((n) => {
            const isOwn = n.from_profile_id === profile?.id;
            const isUnread = !n.is_read && !isOwn;

            return (
              <div
                key={n.id}
                onClick={() => isUnread && markAsRead(n.id)}
                className={`p-3 rounded-lg transition-all ${
                  isUnread ? "bg-primary/10 cursor-pointer" : "bg-background"
                } ${isOwn ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {typeIcons[n.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {isOwn ? t("youSent") : n.from_name} {typeLabels[n.type]}
                    </p>
                    {n.scheduled_time && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {n.scheduled_time}
                      </p>
                    )}
                    {n.note && <p className="text-xs text-muted-foreground mt-1">{n.note}</p>}
                  </div>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
