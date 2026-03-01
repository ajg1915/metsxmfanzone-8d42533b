import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MessageSquare, Eye, Search, Loader2, Bell } from "lucide-react";

interface ToastPrompt {
  id: string;
  name: string;
  location: string;
  title: string;
  description: string;
  variant: string;
  trigger_type: string;
  trigger_condition: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const LOCATIONS = [
  { value: "global", label: "Global (All Pages)" },
  { value: "auth", label: "Authentication" },
  { value: "pricing", label: "Pricing / Plans" },
  { value: "checkout", label: "Checkout" },
  { value: "dashboard", label: "Dashboard" },
  { value: "community", label: "Community" },
  { value: "admin-portal", label: "Admin Portal" },
  { value: "confirm-account", label: "Account Confirmation" },
  { value: "streams", label: "Live Streams" },
  { value: "blog", label: "Blog" },
  { value: "podcast", label: "Podcast" },
];

const VARIANTS = [
  { value: "default", label: "Default" },
  { value: "destructive", label: "Destructive (Error)" },
];

const TRIGGER_TYPES = [
  { value: "manual", label: "Manual (Code Triggered)" },
  { value: "action", label: "User Action" },
  { value: "auto", label: "Automatic" },
  { value: "scheduled", label: "Scheduled" },
];

const emptyPrompt: Omit<ToastPrompt, "id" | "created_at" | "updated_at"> = {
  name: "",
  location: "global",
  title: "",
  description: "",
  variant: "default",
  trigger_type: "manual",
  trigger_condition: "",
  is_active: true,
  display_order: 0,
};

export default function ToastPromptManagement() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<ToastPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<ToastPrompt>>(emptyPrompt);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("toast_prompts")
      .select("*")
      .order("location")
      .order("display_order");

    if (error) {
      toast({ title: "Error", description: "Failed to load toast prompts", variant: "destructive" });
    } else {
      setPrompts((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPrompt.name || !editingPrompt.title || !editingPrompt.description) {
      toast({ title: "Missing fields", description: "Name, title, and description are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      name: editingPrompt.name,
      location: editingPrompt.location || "global",
      title: editingPrompt.title,
      description: editingPrompt.description,
      variant: editingPrompt.variant || "default",
      trigger_type: editingPrompt.trigger_type || "manual",
      trigger_condition: editingPrompt.trigger_condition || null,
      is_active: editingPrompt.is_active ?? true,
      display_order: editingPrompt.display_order || 0,
    };

    if (editingPrompt.id) {
      const { error } = await supabase
        .from("toast_prompts")
        .update(payload)
        .eq("id", editingPrompt.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update prompt", variant: "destructive" });
      } else {
        toast({ title: "Updated", description: "Toast prompt updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from("toast_prompts")
        .insert(payload);

      if (error) {
        toast({ title: "Error", description: "Failed to create prompt", variant: "destructive" });
      } else {
        toast({ title: "Created", description: "New toast prompt created" });
      }
    }

    setSaving(false);
    setEditorOpen(false);
    setEditingPrompt(emptyPrompt);
    fetchPrompts();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("toast_prompts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete prompt", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Toast prompt removed" });
      fetchPrompts();
    }
    setDeleting(null);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("toast_prompts")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (!error) {
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentActive } : p));
    }
  };

  const openEditor = (prompt?: ToastPrompt) => {
    setEditingPrompt(prompt ? { ...prompt } : { ...emptyPrompt });
    setEditorOpen(true);
  };

  const handlePreview = (prompt: ToastPrompt) => {
    toast({
      title: prompt.title,
      description: prompt.description,
      variant: prompt.variant === "destructive" ? "destructive" : undefined,
    });
  };

  const filtered = prompts.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = filterLocation === "all" || p.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const locationLabel = (loc: string) => LOCATIONS.find(l => l.value === loc)?.label || loc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Toast Prompt Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all toast notifications and prompts across the website.
          </p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="w-4 h-4" />
          New Prompt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {LOCATIONS.map(loc => (
                  <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{prompts.length}</p>
            <p className="text-xs text-muted-foreground">Total Prompts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{prompts.filter(p => p.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{prompts.filter(p => !p.is_active).length}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{prompts.filter(p => p.variant === "destructive").length}</p>
            <p className="text-xs text-muted-foreground">Error Toasts</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No toast prompts found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(prompt => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium text-sm">{prompt.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {locationLabel(prompt.location)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{prompt.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">{prompt.trigger_type}</TableCell>
                      <TableCell>
                        <Badge variant={prompt.variant === "destructive" ? "destructive" : "secondary"} className="text-xs">
                          {prompt.variant}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={prompt.is_active}
                          onCheckedChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(prompt)} title="Preview">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(prompt)} title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(prompt.id)}
                            disabled={deleting === prompt.id}
                            title="Delete"
                          >
                            {deleting === prompt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPrompt.id ? "Edit Toast Prompt" : "Create Toast Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Prompt Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Free Plan Confirmation"
                value={editingPrompt.name || ""}
                onChange={e => setEditingPrompt(p => ({ ...p, name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Internal name for identification</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={editingPrompt.location || "global"} onValueChange={v => setEditingPrompt(p => ({ ...p, location: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(loc => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={editingPrompt.trigger_type || "manual"} onValueChange={v => setEditingPrompt(p => ({ ...p, trigger_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Toast Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Toast heading text"
                value={editingPrompt.title || ""}
                onChange={e => setEditingPrompt(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Toast message body"
                value={editingPrompt.description || ""}
                onChange={e => setEditingPrompt(p => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Variant</Label>
                <Select value={editingPrompt.variant || "default"} onValueChange={v => setEditingPrompt(p => ({ ...p, variant: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VARIANTS.map(v => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingPrompt.display_order || 0}
                  onChange={e => setEditingPrompt(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trigger Condition</Label>
              <Input
                placeholder="e.g. free_plan_select, signup_success"
                value={editingPrompt.trigger_condition || ""}
                onChange={e => setEditingPrompt(p => ({ ...p, trigger_condition: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Code identifier for when this toast fires</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editingPrompt.is_active ?? true}
                onCheckedChange={v => setEditingPrompt(p => ({ ...p, is_active: v }))}
              />
              <Label>Active</Label>
            </div>

            {/* Live Preview */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
              <div className={`rounded-lg border p-3 ${editingPrompt.variant === "destructive" ? "border-destructive bg-destructive/10" : "border-border bg-card"}`}>
                <p className={`font-semibold text-sm ${editingPrompt.variant === "destructive" ? "text-destructive" : "text-foreground"}`}>
                  {editingPrompt.title || "Toast Title"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {editingPrompt.description || "Toast description goes here..."}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingPrompt.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
