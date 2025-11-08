import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SEOSetting {
  id: string;
  page_path: string;
  page_name: string;
  title: string;
  description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  canonical_url: string;
  robots: string;
  created_at: string;
  updated_at: string;
}

export default function SEOManagement() {
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SEOSetting | null>(null);
  const [formData, setFormData] = useState({
    page_path: "",
    page_name: "",
    title: "",
    description: "",
    keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_card: "summary_large_image",
    canonical_url: "",
    robots: "index, follow",
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("page_name", { ascending: true });

      if (error) throw error;
      setSeoSettings(data || []);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: SEOSetting) => {
    setSelectedSetting(setting);
    setFormData({
      page_path: setting.page_path,
      page_name: setting.page_name,
      title: setting.title,
      description: setting.description,
      keywords: setting.keywords || "",
      og_title: setting.og_title || "",
      og_description: setting.og_description || "",
      og_image: setting.og_image || "",
      twitter_card: setting.twitter_card || "summary_large_image",
      canonical_url: setting.canonical_url || "",
      robots: setting.robots || "index, follow",
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedSetting(null);
    setFormData({
      page_path: "",
      page_name: "",
      title: "",
      description: "",
      keywords: "",
      og_title: "",
      og_description: "",
      og_image: "",
      twitter_card: "summary_large_image",
      canonical_url: "",
      robots: "index, follow",
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedSetting) {
        // Update existing
        const { error } = await supabase
          .from("seo_settings")
          .update(formData)
          .eq("id", selectedSetting.id);

        if (error) throw error;
        toast.success("SEO settings updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("seo_settings")
          .insert([formData]);

        if (error) throw error;
        toast.success("SEO settings created successfully");
      }

      setIsEditDialogOpen(false);
      fetchSEOSettings();
    } catch (error: any) {
      console.error("Error saving SEO settings:", error);
      toast.error(error.message || "Failed to save SEO settings");
    }
  };

  const handleDelete = async () => {
    if (!selectedSetting) return;

    try {
      const { error } = await supabase
        .from("seo_settings")
        .delete()
        .eq("id", selectedSetting.id);

      if (error) throw error;

      toast.success("SEO settings deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedSetting(null);
      fetchSEOSettings();
    } catch (error) {
      console.error("Error deleting SEO settings:", error);
      toast.error("Failed to delete SEO settings");
    }
  };

  const filteredSettings = seoSettings.filter(
    (setting) =>
      setting.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.page_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading SEO settings...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">SEO Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage meta tags, titles, and descriptions for all pages
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add SEO Settings
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by page name, path, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredSettings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No SEO settings found
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSettings.map((setting) => (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{setting.page_name}</CardTitle>
                    <CardDescription className="mt-1">
                      Path: {setting.page_path}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(setting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSetting(setting);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Title:</span> {setting.title}
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>{" "}
                    {setting.description}
                  </div>
                  {setting.keywords && (
                    <div>
                      <span className="font-semibold">Keywords:</span> {setting.keywords}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Robots:</span> {setting.robots}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSetting ? "Edit SEO Settings" : "Create SEO Settings"}
            </DialogTitle>
            <DialogDescription>
              Configure SEO meta tags for this page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page_path">Page Path *</Label>
                <Input
                  id="page_path"
                  placeholder="/about"
                  value={formData.page_path}
                  onChange={(e) =>
                    setFormData({ ...formData, page_path: e.target.value })
                  }
                  disabled={!!selectedSetting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page_name">Page Name *</Label>
                <Input
                  id="page_name"
                  placeholder="About"
                  value={formData.page_name}
                  onChange={(e) =>
                    setFormData({ ...formData, page_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Meta Title * (50-60 characters)</Label>
              <Input
                id="title"
                placeholder="Amazing Page Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Meta Description * (120-160 characters)
              </Label>
              <Textarea
                id="description"
                placeholder="A compelling description of your page"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="mets, baseball, mlb"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_title">Open Graph Title</Label>
              <Input
                id="og_title"
                placeholder="Leave empty to use meta title"
                value={formData.og_title}
                onChange={(e) =>
                  setFormData({ ...formData, og_title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_description">Open Graph Description</Label>
              <Textarea
                id="og_description"
                placeholder="Leave empty to use meta description"
                value={formData.og_description}
                onChange={(e) =>
                  setFormData({ ...formData, og_description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">Open Graph Image URL</Label>
              <Input
                id="og_image"
                placeholder="https://example.com/image.jpg"
                value={formData.og_image}
                onChange={(e) =>
                  setFormData({ ...formData, og_image: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="twitter_card">Twitter Card Type</Label>
                <Input
                  id="twitter_card"
                  value={formData.twitter_card}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter_card: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Robots Meta Tag</Label>
                <Input
                  id="robots"
                  placeholder="index, follow"
                  value={formData.robots}
                  onChange={(e) =>
                    setFormData({ ...formData, robots: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonical_url">Canonical URL</Label>
              <Input
                id="canonical_url"
                placeholder="https://metsxmfanzone.com/page"
                value={formData.canonical_url}
                onChange={(e) =>
                  setFormData({ ...formData, canonical_url: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the SEO settings for{" "}
              <strong>{selectedSetting?.page_name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
