import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Globe, FileText, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Plus, Pencil, Trash2, Eye } from "lucide-react";

interface SEOSetting {
  id: string;
  page_name: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  canonical_url: string | null;
  robots: string | null;
  created_at: string;
  updated_at: string;
}

const defaultPages = [
  { name: "Home", path: "/" },
  { name: "Spring Training Live", path: "/spring-training-live" },
  { name: "Blog", path: "/blog" },
  { name: "Podcast", path: "/podcast" },
  { name: "Community", path: "/community" },
  { name: "Plans", path: "/plans" },
  { name: "Help Center", path: "/help-center" },
  { name: "Contact", path: "/contact" },
  { name: "FAQs", path: "/faqs" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Video Gallery", path: "/video-gallery" },
];

export default function SEOManagement() {
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<Partial<SEOSetting> | null>(null);
  const [saving, setSaving] = useState(false);
  const [seoScore, setSeoScore] = useState({ score: 0, issues: 0, warnings: 0, passed: 0 });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .order("page_name");

    if (error) {
      console.error("Error fetching SEO settings:", error);
      toast.error("Failed to load SEO settings");
    } else {
      setSeoSettings(data || []);
      calculateSEOScore(data || []);
    }
    setLoading(false);
  };

  const calculateSEOScore = (settings: SEOSetting[]) => {
    let passed = 0;
    let warnings = 0;
    let issues = 0;

    settings.forEach((setting) => {
      // Check title length (50-60 chars ideal)
      if (setting.title.length >= 50 && setting.title.length <= 60) passed++;
      else if (setting.title.length > 0) warnings++;
      else issues++;

      // Check description length (150-160 chars ideal)
      if (setting.description.length >= 150 && setting.description.length <= 160) passed++;
      else if (setting.description.length > 0) warnings++;
      else issues++;

      // Check keywords
      if (setting.keywords && setting.keywords.length > 10) passed++;
      else warnings++;

      // Check OG image
      if (setting.og_image) passed++;
      else warnings++;
    });

    const total = passed + warnings + issues;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;
    setSeoScore({ score, issues, warnings, passed });
  };

  const handleSave = async () => {
    if (!currentSetting?.page_name || !currentSetting?.page_path || !currentSetting?.title || !currentSetting?.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    const isNew = !currentSetting.id;

    if (isNew) {
      const { error } = await supabase.from("seo_settings").insert({
        page_name: currentSetting.page_name,
        page_path: currentSetting.page_path,
        title: currentSetting.title,
        description: currentSetting.description,
        keywords: currentSetting.keywords || null,
        og_title: currentSetting.og_title || null,
        og_description: currentSetting.og_description || null,
        og_image: currentSetting.og_image || null,
        twitter_card: currentSetting.twitter_card || "summary_large_image",
        canonical_url: currentSetting.canonical_url || null,
        robots: currentSetting.robots || "index, follow",
      });

      if (error) {
        console.error("Error creating SEO setting:", error);
        toast.error("Failed to create SEO setting");
      } else {
        toast.success("SEO setting created successfully");
        setEditDialogOpen(false);
        fetchSEOSettings();
      }
    } else {
      const { error } = await supabase
        .from("seo_settings")
        .update({
          page_name: currentSetting.page_name,
          page_path: currentSetting.page_path,
          title: currentSetting.title,
          description: currentSetting.description,
          keywords: currentSetting.keywords || null,
          og_title: currentSetting.og_title || null,
          og_description: currentSetting.og_description || null,
          og_image: currentSetting.og_image || null,
          twitter_card: currentSetting.twitter_card || "summary_large_image",
          canonical_url: currentSetting.canonical_url || null,
          robots: currentSetting.robots || "index, follow",
        })
        .eq("id", currentSetting.id);

      if (error) {
        console.error("Error updating SEO setting:", error);
        toast.error("Failed to update SEO setting");
      } else {
        toast.success("SEO setting updated successfully");
        setEditDialogOpen(false);
        fetchSEOSettings();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO setting?")) return;

    const { error } = await supabase.from("seo_settings").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete SEO setting");
    } else {
      toast.success("SEO setting deleted");
      fetchSEOSettings();
    }
  };

  const openEditDialog = (setting?: SEOSetting) => {
    setCurrentSetting(setting || { robots: "index, follow", twitter_card: "summary_large_image" });
    setEditDialogOpen(true);
  };

  const filteredSettings = seoSettings.filter(
    (s) =>
      s.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.page_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="w-full max-w-full px-1 sm:px-2 py-2 sm:py-3 overflow-x-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold">SEO Management</h2>
          <p className="text-xs text-muted-foreground">Manage page titles, descriptions, and meta tags</p>
        </div>
        <Button size="sm" onClick={() => openEditDialog()} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Page SEO
        </Button>
      </div>

      {/* SEO Score Overview */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-[10px] sm:text-xs font-medium">SEO Score</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(seoScore.score)}`}>
              {seoScore.score}%
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="pb-1 pt-3 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-medium">Passed</CardTitle>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{seoScore.passed}</div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="pb-1 pt-3 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-medium">Warnings</CardTitle>
            <AlertCircle className="h-3 w-3 text-yellow-500" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">{seoScore.warnings}</div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="pb-1 pt-3 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] sm:text-xs font-medium">Issues</CardTitle>
            <AlertCircle className="h-3 w-3 text-red-500" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl sm:text-2xl font-bold text-red-500">{seoScore.issues}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="pages" className="text-xs px-3 h-7">Pages</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs px-3 h-7">SEO Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-3 space-y-3">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchSEOSettings} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {/* SEO Settings Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Page</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredSettings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No SEO settings found. Add your first page SEO settings.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="text-xs">
                            <div className="font-medium">{setting.page_name}</div>
                            <div className="text-muted-foreground">{setting.page_path}</div>
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">
                            {setting.title}
                          </TableCell>
                          <TableCell className="text-xs max-w-[250px] truncate hidden md:table-cell">
                            {setting.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={setting.title.length >= 50 && setting.description.length >= 150 ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {setting.title.length >= 50 && setting.description.length >= 150 ? "Optimized" : "Needs Work"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => window.open(setting.page_path, "_blank")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => openEditDialog(setting)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive"
                                onClick={() => handleDelete(setting.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://search.google.com/search-console", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Google Search Console</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">Monitor your search performance and indexing status</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://developers.facebook.com/tools/debug/", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Facebook Debugger</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">Debug Open Graph tags for Facebook sharing</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://cards-dev.twitter.com/validator", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Twitter Card Validator</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">Preview how your content appears on Twitter</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://www.linkedin.com/post-inspector/", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">LinkedIn Post Inspector</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">Preview LinkedIn sharing appearance</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://www.metsxmfanzone.com/sitemap.xml", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">View Sitemap</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">View your XML sitemap for search engines</CardDescription>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open("https://www.metsxmfanzone.com/robots.txt", "_blank")}>
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">View Robots.txt</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <CardDescription className="text-xs">View crawler directives for search engines</CardDescription>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{currentSetting?.id ? "Edit" : "Add"} Page SEO</DialogTitle>
            <DialogDescription className="text-xs">
              Configure SEO settings for this page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Page Name *</Label>
                <Input
                  placeholder="Home"
                  value={currentSetting?.page_name || ""}
                  onChange={(e) => setCurrentSetting({ ...currentSetting, page_name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Page Path *</Label>
                <Input
                  placeholder="/"
                  value={currentSetting?.page_path || ""}
                  onChange={(e) => setCurrentSetting({ ...currentSetting, page_path: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Title * <span className="text-muted-foreground">({currentSetting?.title?.length || 0}/60 chars)</span>
              </Label>
              <Input
                placeholder="Page Title | MetsXMFanZone"
                value={currentSetting?.title || ""}
                onChange={(e) => setCurrentSetting({ ...currentSetting, title: e.target.value })}
                className="h-8 text-xs"
                maxLength={70}
              />
              <p className="text-[10px] text-muted-foreground">Ideal: 50-60 characters</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                Description * <span className="text-muted-foreground">({currentSetting?.description?.length || 0}/160 chars)</span>
              </Label>
              <Textarea
                placeholder="A compelling description of this page..."
                value={currentSetting?.description || ""}
                onChange={(e) => setCurrentSetting({ ...currentSetting, description: e.target.value })}
                className="text-xs min-h-[60px]"
                maxLength={170}
              />
              <p className="text-[10px] text-muted-foreground">Ideal: 150-160 characters</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Keywords</Label>
              <Input
                placeholder="mets, baseball, live games, fan community"
                value={currentSetting?.keywords || ""}
                onChange={(e) => setCurrentSetting({ ...currentSetting, keywords: e.target.value })}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Comma-separated keywords</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">OG Image URL</Label>
              <Input
                placeholder="https://www.metsxmfanzone.com/og-image.png"
                value={currentSetting?.og_image || ""}
                onChange={(e) => setCurrentSetting({ ...currentSetting, og_image: e.target.value })}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Recommended: 1200x630 pixels</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Canonical URL</Label>
                <Input
                  placeholder="https://www.metsxmfanzone.com/"
                  value={currentSetting?.canonical_url || ""}
                  onChange={(e) => setCurrentSetting({ ...currentSetting, canonical_url: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Robots</Label>
                <Input
                  placeholder="index, follow"
                  value={currentSetting?.robots || ""}
                  onChange={(e) => setCurrentSetting({ ...currentSetting, robots: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save SEO Settings"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
