import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Tv, FileText, MessageSquare, Trophy, Newspaper, Dot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type NotificationItem = {
  id: string;
  type: "live" | "game_alert" | "story" | "blog" | "post";
  title: string;
  message: string;
  time: string;
  link?: string;
  isNew: boolean;
};

const typeConfig = {
  live: { icon: Tv, label: "Live Now", color: "text-red-500" },
  game_alert: { icon: Trophy, label: "Game Alert", color: "text-amber-500" },
  story: { icon: MessageSquare, label: "New Story", color: "text-blue-500" },
  blog: { icon: Newspaper, label: "New Article", color: "text-emerald-500" },
  post: { icon: FileText, label: "New Post", color: "text-purple-500" },
};

const NotificationsPanel = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("notificationsLastSeen");
    setLastSeen(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchNotifications();
  }, [open]);

  useEffect(() => {
    // Fetch count on mount
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!lastSeen) {
      setUnreadCount(notifications.length);
    } else {
      setUnreadCount(notifications.filter(n => new Date(n.time) > new Date(lastSeen)).length);
    }
  }, [notifications, lastSeen]);

  const fetchNotifications = async () => {
    const items: NotificationItem[] = [];
    const since = new Date();
    since.setDate(since.getDate() - 7); // Last 7 days
    const sinceISO = since.toISOString();

    // Fetch in parallel
    const [liveStreams, gameAlerts, stories, blogPosts] = await Promise.all([
      supabase
        .from("live_streams")
        .select("id, title, status, updated_at")
        .in("status", ["live", "scheduled"])
        .eq("published", true)
        .gte("updated_at", sinceISO)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("game_alerts")
        .select("id, title, message, severity, created_at, link_url")
        .eq("is_active", true)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("stories")
        .select("id, title, created_at, link_url")
        .eq("published", true)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("blog_posts")
        .select("id, title, slug, published_at")
        .eq("published", true)
        .gte("published_at", sinceISO)
        .order("published_at", { ascending: false })
        .limit(5),
    ]);

    // Map live streams
    (liveStreams.data || []).forEach((s) => {
      items.push({
        id: `live-${s.id}`,
        type: "live",
        title: s.status === "live" ? "🔴 LIVE NOW" : "Coming Soon",
        message: s.title,
        time: s.updated_at,
        link: "/metsxmfanzone-tv",
        isNew: !lastSeen || new Date(s.updated_at) > new Date(lastSeen),
      });
    });

    // Map game alerts
    (gameAlerts.data || []).forEach((a) => {
      items.push({
        id: `alert-${a.id}`,
        type: "game_alert",
        title: a.title,
        message: a.message,
        time: a.created_at,
        link: a.link_url || undefined,
        isNew: !lastSeen || new Date(a.created_at) > new Date(lastSeen),
      });
    });

    // Map stories
    (stories.data || []).forEach((s) => {
      items.push({
        id: `story-${s.id}`,
        type: "story",
        title: "New Story",
        message: s.title,
        time: s.created_at,
        link: s.link_url || "/",
        isNew: !lastSeen || new Date(s.created_at) > new Date(lastSeen),
      });
    });

    // Map blog posts
    (blogPosts.data || []).forEach((b) => {
      items.push({
        id: `blog-${b.id}`,
        type: "blog",
        title: "New Article",
        message: b.title,
        time: b.published_at || "",
        link: `/blog/${b.slug}`,
        isNew: !lastSeen || new Date(b.published_at || "") > new Date(lastSeen),
      });
    });

    // Sort by time descending
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(items);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const now = new Date().toISOString();
      localStorage.setItem("notificationsLastSeen", now);
      setLastSeen(now);
      setUnreadCount(0);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-3 border-b border-border/40">
          <SheetTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full pb-20">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((n) => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${n.isNew ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      if (n.link) {
                        setOpen(false);
                        window.location.href = n.link;
                      }
                    }}
                  >
                    <div className={`mt-0.5 p-2 rounded-full bg-muted ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                        {n.isNew && <Dot className="w-4 h-4 text-red-500 -ml-1" />}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {n.time ? formatDistanceToNow(new Date(n.time), { addSuffix: true }) : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
