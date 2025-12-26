import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PenLine, FileText, Clock, CheckCircle, XCircle, Plus, LogOut, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  approval_status: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function WriterDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isWriter, setIsWriter] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<BlogPost[]>([]);

  useEffect(() => {
    const checkWriterAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth?mode=login");
        return;
      }

      // Check if user is a writer
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasWriterRole = roles?.some(r => r.role === "writer" || r.role === "admin");
      
      if (!hasWriterRole) {
        toast({
          title: "Access Denied",
          description: "You don't have writer permissions.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsWriter(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch writer's articles
      const { data: articlesData, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, published, approval_status, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(articlesData || []);
      }

      setLoading(false);
    };

    checkWriterAccess();
  }, [user, authLoading, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth?mode=login");
  };

  const getStatusBadge = (post: BlogPost) => {
    if (post.approval_status === "approved" && post.published) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>;
    }
    if (post.approval_status === "approved") {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Approved</Badge>;
    }
    if (post.approval_status === "rejected") {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
  };

  const stats = {
    total: articles.length,
    pending: articles.filter(a => a.approval_status === "pending").length,
    approved: articles.filter(a => a.approval_status === "approved").length,
    published: articles.filter(a => a.published && a.approval_status === "approved").length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isWriter) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenLine className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Writer Portal</h1>
              <p className="text-sm text-muted-foreground">Create and manage your articles</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "W"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">
                {profile?.full_name || profile?.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Articles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Article Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Articles</h2>
          <Button asChild>
            <Link to="/writer/new-article">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
              <p className="text-muted-foreground mb-4">
                Start writing your first article to share with the community.
              </p>
              <Button asChild>
                <Link to="/writer/new-article">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Article
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <Card key={article.id} className="hover:bg-accent/5 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{article.title}</h3>
                        {getStatusBadge(article)}
                      </div>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(article.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/writer/edit/${article.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </CardTitle>
            <CardDescription>Manage your writer profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg">
                  {profile?.full_name?.charAt(0) || "W"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profile?.full_name || "Writer"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <Button variant="outline" className="ml-auto" asChild>
                <Link to="/dashboard">
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
