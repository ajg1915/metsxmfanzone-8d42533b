import { 
  Home, FileText, Shield, Video, Radio, Bell, Mic, CreditCard, TrendingUp, 
  MessageSquare, ChevronDown, Film, Users, Calendar, Image, Mail, PlaySquare, 
  Megaphone, QrCode, BookOpen, CalendarDays, Trophy, UserCog, Send, Wallpaper, 
  Activity, PenLine, Eye, HeartPulse, Globe, Settings, Layers, Sparkles, 
  Tv, Newspaper, ClipboardList, Star, BarChart3, Share2
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

const homeItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Hero Slides", url: "/admin/hero", icon: Layers },
  { title: "Backgrounds", url: "/admin/backgrounds", icon: Wallpaper },
  { title: "Tutorials", url: "/admin/tutorials", icon: BookOpen },
  { title: "Predictions", url: "/admin/predictions", icon: Sparkles },
  { title: "Fan Outlook", url: "/admin/talent-assessments", icon: Star },
];

const mediaItems = [
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Stories", url: "/admin/stories", icon: Sparkles },
  { title: "AI Images", url: "/admin/ai-images", icon: Image },
  { title: "Videos", url: "/admin/video-gallery-management", icon: Video },
  { title: "Video Creator", url: "/admin/video-creator", icon: Film },
  { title: "Podcasts", url: "/admin/podcasts", icon: Mic },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Email Editor", url: "/admin/email-editor", icon: Send },
];

const settingsNavItems = [
  { title: "Admin Settings", url: "/admin/settings", icon: Settings },
  { title: "Social Media", url: "/admin/social-media", icon: Share2 },
  { title: "News Tracker", url: "/admin/news-tracker", icon: Newspaper },
  { title: "TV Schedule", url: "/admin/tv-schedule", icon: Tv },
];

const liveItems = [
  { title: "Live Streams", url: "/admin/live-streams", icon: Radio },
  { title: "Push Notifications", url: "/admin/game-notifications", icon: Bell },
  { title: "Game Alerts", url: "/admin/game-alerts", icon: Megaphone },
  { title: "Stream Health", url: "/admin/stream-health", icon: HeartPulse },
  { title: "Replays", url: "/admin/stream-replays", icon: PlaySquare },
  { title: "Podcast Live", url: "/admin/podcast-live-stream", icon: Mic },
  { title: "Podcast Schedule", url: "/admin/podcast-schedule", icon: CalendarDays },
];

const eventsItems = [
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Spring Training", url: "/admin/spring-training", icon: Trophy },
];

const usersItems = [
  { title: "Users", url: "/admin/user-management", icon: UserCog },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Writer Apps", url: "/admin/writer-applications", icon: PenLine },
  { title: "Podcaster Apps", url: "/admin/podcaster-applications", icon: Mic },
];

const communityItems = [
  { title: "Posts", url: "/admin/posts", icon: FileText },
  { title: "Feedback", url: "/admin/feedbacks", icon: MessageSquare },
  { title: "Business Ads", url: "/admin/business-ads", icon: Megaphone },
  { title: "Polls", url: "/admin/polls", icon: BarChart3 },
];

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
  const [mediaOpen, setMediaOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const renderSection = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    items: typeof homeItems,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    const Icon = icon;
    const hasActive = items.some(item => isActive(item.url));
    
    return (
      <SidebarGroup className="py-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className={`flex items-center justify-between w-full rounded-md px-2 py-1 transition-colors
              ${hasActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
            `}>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">{title}</span>
              </div>
              <ChevronDown 
                className={`h-3 w-3 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} className="h-7">
                        <NavLink
                          to={item.url}
                          className={`flex items-center gap-1.5 pl-3 rounded-md text-[11px] transition-colors
                            ${active
                              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`
                          }
                        >
                          <item.icon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-0.5 py-1.5 px-1">
        {renderSection("Home", Home, homeItems, homeOpen, setHomeOpen)}
        {renderSection("Settings", Settings, settingsNavItems, settingsOpen, setSettingsOpen)}
        {renderSection("Content", Film, mediaItems, mediaOpen, setMediaOpen)}
        {renderSection("Live", Radio, liveItems, liveOpen, setLiveOpen)}
        {renderSection("Events", CalendarDays, eventsItems, eventsOpen, setEventsOpen)}
        {renderSection("Users", Users, usersItems, usersOpen, setUsersOpen)}
        {renderSection("Community", MessageSquare, communityItems, communityOpen, setCommunityOpen)}
        {renderSection("Analytics", TrendingUp, analyticsItems, analyticsOpen, setAnalyticsOpen)}
      </SidebarContent>
    </Sidebar>
  );
}
