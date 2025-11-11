import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Upload, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeStreams: 0,
    totalStreams: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [postsResult, usersResult, streamsResult] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("live_streams").select("status"),
      ]);

      const activeStreams = streamsResult.data?.filter(s => s.status === "live").length || 0;
      const totalStreams = streamsResult.data?.length || 0;

      setStats({
        totalPosts: postsResult.count || 0,
        totalUsers: usersResult.count || 0,
        activeStreams,
        totalStreams,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Streams</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStreams} / {stats.totalStreams}</div>
            <p className="text-xs text-muted-foreground mt-1">Active / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
