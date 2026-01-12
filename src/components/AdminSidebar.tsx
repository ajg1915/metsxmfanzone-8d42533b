import { 
  Home, FileText, Shield, Video, Radio, Bell, Mic, CreditCard, TrendingUp, 
  MessageSquare, ChevronDown, Film, Users, Calendar, Image, Mail, PlaySquare, 
  Megaphone, QrCode, BookOpen, CalendarDays, Trophy, UserCog, Send, Wallpaper, 
  Activity, PenLine, Eye, HeartPulse, Globe, Settings, Layers, Sparkles, 
  Tv, Newspaper, ClipboardList, Star
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Home / Overview items
const homeItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Hero Slides", url: "/admin/hero", icon: Layers },
  { title: "Backgrounds", url: "/admin/backgrounds", icon: Wallpaper },
  { title: "Tutorials", url: "/admin/tutorials", icon: BookOpen },
  { title: "Predictions", url: "/admin/predictions", icon: Sparkles },
  { title: "Fan Outlook", url: "/admin/talent-assessments", icon: Star },
];

// Content & Media items - Blog, Stories, Videos, Podcasts, Newsletter
const mediaItems = [
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Stories", url: "/admin/stories", icon: Sparkles },
  { title: "Videos", url: "/admin/video-gallery-management", icon: Video },
  { title: "Video Creator", url: "/admin/video-creator", icon: Film },
  { title: "Podcasts", url: "/admin/podcasts", icon: Mic },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Email Editor", url: "/admin/email-editor", icon: Send },
];

// Settings items (moved to prominent position)
const settingsNavItems = [
  { title: "Admin Settings", url: "/admin/settings", icon: Settings },
  { title: "News Tracker", url: "/admin/news-tracker", icon: Newspaper },
  { title: "TV Schedule", url: "/admin/tv-schedule", icon: Tv },
];

// Live & Streaming
const liveItems = [
  { title: "Live Streams", url: "/admin/live-streams", icon: Radio },
  { title: "Game Alerts", url: "/admin/game-notifications", icon: Bell },
  { title: "Stream Health", url: "/admin/stream-health", icon: HeartPulse },
  { title: "Replays", url: "/admin/stream-replays", icon: PlaySquare },
  { title: "Podcast Live", url: "/admin/podcast-live-stream", icon: Mic },
];

// Events & Schedules
const eventsItems = [
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Spring Training", url: "/admin/spring-training", icon: Trophy },
];

// Users & Community - Users, Roles, Subscriptions, Feedback, Posts, etc.
const usersItems = [
  { title: "Users", url: "/admin/user-management", icon: UserCog },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Writer Apps", url: "/admin/writer-applications", icon: PenLine },
  { title: "Podcaster Apps", url: "/admin/podcaster-applications", icon: Mic },
];

// Community Content - Posts, Feedback, Business Ads
const communityItems = [
  { title: "Posts", url: "/admin/posts", icon: FileText },
  { title: "Feedback", url: "/admin/feedbacks", icon: MessageSquare },
  { title: "Business Ads", url: "/admin/business-ads", icon: Megaphone },
];

// Analytics & SEO
const analyticsItems = [
  { title: "Daily Reports", url: "/admin/daily-reports", icon: ClipboardList },
  { title: "Real-Time Stats", url: "/admin/realtime-analytics", icon: TrendingUp },
  { title: "Activity Logs", url: "/admin/activity", icon: Activity },
  { title: "SEO Settings", url: "/admin/seo", icon: Globe },
  { title: "QR Codes", url: "/admin/qr-generator", icon: QrCode },
];


export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [homeOpen, setHomeOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(true);
  const [liveOpen, setLiveOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const [communityOpen, setCommunityOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const renderCollapsibleSection = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    items: typeof homeItems,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    const Icon = icon;
    return (
      <SidebarGroup>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-medium">{title}</span>
              </div>
              <ChevronDown 
                className={`h-3 w-3 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className={({ isActive: active }) =>
                          `flex items-center gap-2 pl-4 ${active || isActive(item.url)
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-muted/50"}`
                        }
                      >
                        <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-1 py-2">
        {/* Home / Overview */}
        {renderCollapsibleSection("Home", Home, homeItems, homeOpen, setHomeOpen)}

        {/* Settings (prominent position) */}
        {renderCollapsibleSection("Settings", Settings, settingsNavItems, liveOpen, setLiveOpen)}

        {/* Content & Media */}
        {renderCollapsibleSection("Content", Film, mediaItems, mediaOpen, setMediaOpen)}

        {/* Live & Streaming */}
        {renderCollapsibleSection("Live", Radio, liveItems, eventsOpen, setEventsOpen)}

        {/* Events & Schedules */}
        {renderCollapsibleSection("Events", CalendarDays, eventsItems, eventsOpen, setEventsOpen)}

        {/* Users & Accounts */}
        {renderCollapsibleSection("Users", Users, usersItems, usersOpen, setUsersOpen)}

        {/* Community Content */}
        {renderCollapsibleSection("Community", MessageSquare, communityItems, communityOpen, setCommunityOpen)}

        {/* Analytics & SEO */}
        {renderCollapsibleSection("Analytics", TrendingUp, analyticsItems, analyticsOpen, setAnalyticsOpen)}

      </SidebarContent>
    </Sidebar>
  );
}
