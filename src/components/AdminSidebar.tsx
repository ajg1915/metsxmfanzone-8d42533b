import { Home, FileText, Shield, Video, Radio, Bell, Mic, CreditCard, TrendingUp, MessageSquare, ChevronDown, Film, Users, Calendar, Image, Mail, PlaySquare, Megaphone, QrCode, BookOpen, CalendarDays, Trophy, UserCog, Send, Wallpaper, Activity, PenLine, Eye, HeartPulse, Globe, Settings, Layers } from "lucide-react";
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

const mainItems = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Hero Slides", url: "/admin/hero", icon: Layers },
];

const mediaItems = [
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Videos", url: "/admin/video-gallery-management", icon: Video },
  { title: "Podcasts", url: "/admin/podcasts", icon: Mic },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "SEO", url: "/admin/seo", icon: Globe },
  { title: "QR Codes", url: "/admin/qr-generator", icon: QrCode },
];

const liveManagementItems = [
  { title: "Live Streams", url: "/admin/live-streams", icon: Radio },
  { title: "Podcast Live", url: "/admin/podcast-live-stream", icon: Mic },
  { title: "Replays", url: "/admin/stream-replays", icon: PlaySquare },
  { title: "TV Schedule", url: "/admin/tv-schedule", icon: Calendar },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Spring Training", url: "/admin/spring-training", icon: Trophy },
];

const userItems = [
  { title: "Feedback", url: "/admin/feedbacks", icon: MessageSquare },
  { title: "Posts", url: "/admin/posts", icon: FileText },
  { title: "Business Ads", url: "/admin/business-ads", icon: Megaphone },
  { title: "Writer Apps", url: "/admin/writer-applications", icon: PenLine },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Users", url: "/admin/user-management", icon: UserCog },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Website Stats", url: "/admin/realtime-analytics", icon: TrendingUp },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [mediaOpen, setMediaOpen] = useState(true);
  const [liveManagementOpen, setLiveManagementOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-1 py-2">
        {/* Main Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive: active }) =>
                        `flex items-center gap-2 ${active || isActive(item.url)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted/50"}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Media Section */}
        <SidebarGroup>
          <Collapsible open={mediaOpen} onOpenChange={setMediaOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Media</span>
                </div>
                <ChevronDown 
                  className={`h-3 w-3 transition-transform flex-shrink-0 ${mediaOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mediaItems.map((item) => (
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

        {/* Live Management Section */}
        <SidebarGroup>
          <Collapsible open={liveManagementOpen} onOpenChange={setLiveManagementOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Live</span>
                </div>
                <ChevronDown 
                  className={`h-3 w-3 transition-transform flex-shrink-0 ${liveManagementOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {liveManagementItems.map((item) => (
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

        {/* User Management Section */}
        <SidebarGroup>
          <Collapsible open={userOpen} onOpenChange={setUserOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs font-medium">Users</span>
                </div>
                <ChevronDown 
                  className={`h-3 w-3 transition-transform flex-shrink-0 ${userOpen ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}