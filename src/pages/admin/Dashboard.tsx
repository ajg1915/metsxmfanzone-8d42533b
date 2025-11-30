import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Upload, Activity, Radio, ClipboardList, HelpCircle, ArrowRight, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeStreams: 0,
    totalStreams: 0,
    totalBlogs: 0,
    totalLineupCards: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [postsResult, usersResult, streamsResult, blogsResult, lineupCardsResult] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("live_streams").select("status"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("lineup_cards").select("*", { count: "exact", head: true }),
      ]);

      const activeStreams = streamsResult.data?.filter(s => s.status === "live").length || 0;
      const totalStreams = streamsResult.data?.length || 0;

      setStats({
        totalPosts: postsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeStreams,
        totalStreams,
        totalBlogs: blogsResult.count || 0,
        totalLineupCards: lineupCardsResult.count || 0,
      });
    };

    fetchStats();
  }, []);

  const quickAccessItems = [
    {
      title: "Blog Management",
      description: "Create and manage blog posts",
      icon: FileText,
      url: "/admin/blog",
      stat: `${stats.totalBlogs} Posts`,
    },
    {
      title: "Live Streams",
      description: "Manage live streaming content",
      icon: Radio,
      url: "/admin/live-streams",
      stat: `${stats.activeStreams} Live`,
    },
    {
      title: "Lineup Cards",
      description: "Manage daily lineup cards",
      icon: ClipboardList,
      url: "/admin/lineup-card-management",
      stat: `${stats.totalLineupCards} Cards`,
    },
    {
      title: "User Management",
      description: "Manage users and subscriptions",
      icon: UserCog,
      url: "/admin/user-management",
      stat: `${stats.totalUsers} Users`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-2 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Dashboard Overview</h2>
        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              How to Use
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Admin Portal Navigation Guide</DialogTitle>
              <DialogDescription>
                Learn how to navigate and use the admin portal effectively
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Quick Access Cards</h3>
                <p className="text-sm text-muted-foreground">
                  Use the quick access cards below to jump directly to the most commonly used features: Blog Management, Live Streams, Lineup Cards, and User Management.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Sidebar Navigation</h3>
                <p className="text-sm text-muted-foreground">
                  The sidebar on the left organizes all admin features into categories:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <span className="font-medium">Media</span> - Manage blogs, videos, podcasts, and newsletters</li>
                  <li>• <span className="font-medium">Live Management</span> - Control live streams, stories, and events</li>
                  <li>• <span className="font-medium">User</span> - Manage users, posts, and subscriptions</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Common Tasks</h3>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-sm">Creating a Live Stream</p>
                    <p className="text-xs text-muted-foreground">Navigate to Live Management → Live Streams → Add Live Stream. Enter stream URL, assign to pages, and set status.</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-sm">Publishing a Blog Post</p>
                    <p className="text-xs text-muted-foreground">Go to Media → Blog Management → Create New Post. Write content, add featured image, and toggle Published switch.</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-sm">Managing Users</p>
                    <p className="text-xs text-muted-foreground">Access User → User Management to view all users, change subscription plans, and manage accounts.</p>
                  </div>
                  <div className="border-l-2 border-primary pl-3">
                    <p className="font-medium text-sm">Setting Up Lineup Cards</p>
                    <p className="text-xs text-muted-foreground">Visit Live Management → Lineup Cards to create daily lineup cards with game details and player information.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Need More Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Each management page includes intuitive forms and buttons. Look for "Add New", "Create", or "+" buttons to create content, and "Edit" or pencil icons to modify existing items.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-medium">Total Users</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-medium">Total Posts</CardTitle>
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-medium">Live Streams</CardTitle>
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{stats.activeStreams} / {stats.totalStreams}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Active / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-medium">System Status</CardTitle>
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-green-500">Online</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold mb-3">Quick Access</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(item.url)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <CardTitle className="text-sm mb-1">{item.title}</CardTitle>
                  <CardDescription className="text-xs mb-2">
                    {item.description}
                  </CardDescription>
                  <p className="text-xs font-semibold text-primary">{item.stat}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
