import { Home, Users, FileText, Upload, Settings, Shield, Video, Radio, Bell, Mic, CreditCard } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Blog Management", url: "/admin/blog", icon: FileText },
  { title: "Video Management", url: "/admin/videos", icon: Video },
  { title: "Podcast Management", url: "/admin/podcasts", icon: Mic },
  { title: "Live Streams", url: "/admin/live-streams", icon: Radio },
  { title: "Live Notifications", url: "/admin/live-notifications", icon: Bell },
  { title: "Content Management", url: "/admin/content", icon: Upload },
  { title: "Posts Management", url: "/admin/posts", icon: FileText },
  { title: "User Roles", url: "/admin/roles", icon: Shield },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
