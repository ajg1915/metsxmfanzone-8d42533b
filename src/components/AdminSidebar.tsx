import { Home, FileText, Shield, Video, Radio, Bell, Mic, CreditCard, TrendingUp, MessageSquare, ChevronDown, Film, Users, Calendar, Image, Mail, PlaySquare, Megaphone, QrCode } from "lucide-react";
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
];

const mediaItems = [
  { title: "Blog Management", url: "/admin/blog", icon: FileText },
  { title: "Video Management", url: "/admin/videos", icon: Video },
  { title: "Podcast Management", url: "/admin/podcasts", icon: Mic },
  { title: "AI Voice Generator", url: "/admin/podcast-ai", icon: Mic },
  { title: "Newsletter Editor", url: "/admin/newsletter", icon: Mail },
  { title: "QR Code Generator", url: "/admin/qr-generator", icon: QrCode },
];

const liveManagementItems = [
  { title: "Live Streams", url: "/admin/live-streams", icon: Radio },
  { title: "Podcast Live Stream", url: "/admin/podcast-live-stream", icon: Mic },
  { title: "Stream Replays", url: "/admin/stream-replays", icon: PlaySquare },
  { title: "Live Updates", url: "/admin/live-updates", icon: MessageSquare },
  { title: "Live Notifications", url: "/admin/live-notifications", icon: Bell },
  { title: "Stories", url: "/admin/stories", icon: Image },
  { title: "Mets News Tracker", url: "/admin/mets-news", icon: TrendingUp },
  { title: "TV Schedule", url: "/admin/tv-schedule", icon: Calendar },
];

const userItems = [
  { title: "Feedback", url: "/admin/feedbacks", icon: MessageSquare },
  { title: "Posts", url: "/admin/posts", icon: FileText },
  { title: "Business Ads", url: "/admin/business-ads", icon: Megaphone },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
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
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent className="gap-2">
        {/* Main Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: active }) =>
                        active || isActive(item.url)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
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
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  {open && <span>Media</span>}
                </div>
                {open && (
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${mediaOpen ? "rotate-180" : ""}`}
                  />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mediaItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive: active }) =>
                            active || isActive(item.url)
                              ? "bg-primary text-primary-foreground font-medium pl-6"
                              : "hover:bg-muted/50 pl-6"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {open && <span className="text-sm">{item.title}</span>}
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
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  {open && <span>Live Management</span>}
                </div>
                {open && (
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${liveManagementOpen ? "rotate-180" : ""}`}
                  />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {liveManagementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive: active }) =>
                            active || isActive(item.url)
                              ? "bg-primary text-primary-foreground font-medium pl-6"
                              : "hover:bg-muted/50 pl-6"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {open && <span className="text-sm">{item.title}</span>}
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
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-muted/50 rounded-md px-2 py-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {open && <span>User</span>}
                </div>
                {open && (
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${userOpen ? "rotate-180" : ""}`}
                  />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive: active }) =>
                            active || isActive(item.url)
                              ? "bg-primary text-primary-foreground font-medium pl-6"
                              : "hover:bg-muted/50 pl-6"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {open && <span className="text-sm">{item.title}</span>}
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
