import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, ImageIcon, Loader2, Eye, Target } from "lucide-react";
import SpotlightTour from "@/components/SpotlightTour";

interface TutorialStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url?: string | null;
  target_selector?: string | null;
  is_active: boolean;
  created_at: string;
}

export default function TutorialManagement() {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    step_number: 1,
    title: "",
    description: "",
    image_url: "",
    target_selector: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorial_steps")
        .select("*")
        .order("step_number", { ascending: true });

      if (error) throw error;
      setSteps((data || []) as TutorialStep[]);

      // Auto-set next step number based on length
      if (!editingId) {
        setFormData((prev) => ({ ...prev, step_number: (data?.length || 0) + 1 }));
      }
    } catch (error: any) {
      toast({
        title: "Error fetching steps",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const { error } = await supabase.from("tutorial_steps").update(formData).eq("id", editingId);

        if (error) throw error;
        toast({ title: "Tutorial step updated" });
      } else {
        const { error } = await supabase.from("tutorial_steps").insert([formData]);

        if (error) throw error;
        toast({ title: "Tutorial step created" });
      }

      resetForm();
      fetchSteps();
    } catch (error: any) {
      toast({
        title: "Error saving step",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (step: TutorialStep) => {
    setFormData({
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      image_url: step.image_url || "",
      target_selector: step.target_selector || "",
      is_active: step.is_active,
    });
    setEditingId(step.id);
    setShowForm(true);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from("tutorial_steps").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Step deleted" });
      fetchSteps();
    } catch (error: any) {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (stepId: string, direction: "up" | "down") => {
    const currentIndex = steps.findIndex((s) => s.id === stepId);
    if (currentIndex === -1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= steps.length) return;

    const currentStep = steps[currentIndex];
    const swapStep = steps[swapIndex];

    try {
      // Optimistic UI update
      const newSteps = [...steps];
      newSteps[currentIndex] = { ...currentStep, step_number: swapStep.step_number };
      newSteps[swapIndex] = { ...swapStep, step_number: currentStep.step_number };
      newSteps.sort((a, b) => a.step_number - b.step_number);
      setSteps(newSteps);

      // Update DB
      const { error: error1 } = await supabase
        .from("tutorial_steps")
        .update({ step_number: swapStep.step_number })
        .eq("id", currentStep.id);

      const { error: error2 } = await supabase
        .from("tutorial_steps")
        .update({ step_number: currentStep.step_number })
        .eq("id", swapStep.id);

      if (error1 || error2) throw error1 || error2;
    } catch (error: any) {
      toast({
        title: "Reorder failed",
        description: error.message,
        variant: "destructive",
      });
      fetchSteps(); // Revert on error
    }
  };

  const resetForm = () => {
    setFormData({
      step_number: steps.length + 1,
      title: "",
      description: "",
      image_url: "",
      target_selector: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl font-bold">Tutorial Management</h1>
          <p className="text-xs text-muted-foreground">Manage onboarding steps</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            disabled={steps.length === 0}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
            {showForm ? "Cancel" : "Add Step"}
          </Button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="border border-primary/20">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">{editingId ? "Edit Step" : "Create New Step"}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Welcome to the Fan Zone"
                    required
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step_number" className="text-xs">Step #</Label>
                  <Input
                    id="step_number"
                    type="number"
                    min="1"
                    value={formData.step_number}
                    onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })}
                    required
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain this feature..."
                  required
                  className="h-16 text-sm resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="target_selector" className="text-xs flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Target Selector (CSS)
                  </Label>
                  <Input
                    id="target_selector"
                    value={formData.target_selector}
                    onChange={(e) => setFormData({ ...formData, target_selector: e.target.value })}
                    placeholder="#stories-section or .hero-section"
                    className="h-8 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Element to spotlight (e.g., #hero, .live-section)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-xs">Image URL (Optional fallback)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-xs">Visible</Label>
              </div>
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                <Save className="w-3 h-3 mr-1" />
                {editingId ? "Update" : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List Section */}
      <div className="space-y-2">
        {steps.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tutorial steps. Create one to get started.
          </div>
        )}

        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`${!step.is_active ? "opacity-60 bg-muted/50" : ""}`}
          >
            <CardContent className="p-3">
              <div className="flex gap-3 items-center">
                {/* Reorder & Number */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleReorder(step.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-bold text-muted-foreground">{step.step_number}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleReorder(step.id, "down")}
                    disabled={index === steps.length - 1}
                  >
                    <MoveDown className="w-3 h-3" />
                  </Button>
                </div>

                {/* Image */}
                <div className="w-16 h-12 bg-muted rounded shrink-0 flex items-center justify-center overflow-hidden border">
                  {step.image_url ? (
                    <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate flex items-center gap-1">
                    {step.title}
                    {step.target_selector && <Target className="w-3 h-3 text-primary" />}
                    {!step.is_active && <Badge variant="secondary" className="text-[10px] px-1 py-0">Hidden</Badge>}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{step.description}</p>
                  {step.target_selector && (
                    <code className="text-[10px] text-primary/70 font-mono">{step.target_selector}</code>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(step)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(step.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPreview && (
        <SpotlightTour 
          onComplete={() => setShowPreview(false)}
          previewMode={true}
          previewSteps={steps}
        />
      )}
    </div>
  );
}
