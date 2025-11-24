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
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, ImageIcon, Loader2, Eye } from "lucide-react";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";

interface TutorialStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url?: string;
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
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutorial Management</h1>
          <p className="text-muted-foreground">Manage the onboarding steps shown on the main page.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={steps.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Tutorial
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add New Step"}
          </Button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Step" : "Create New Step"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Welcome to the Fan Zone"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Explain this feature..."
                      required
                      className="h-32"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="step_number">Step Sequence Number</Label>
                    <Input
                      id="step_number"
                      type="number"
                      min="1"
                      value={formData.step_number}
                      onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Visible to Users</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update Step" : "Create Step"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List Section */}
      <div className="grid gap-4">
        {steps.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            No tutorial steps found. Create one to get started.
          </div>
        )}

        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all ${!step.is_active ? "opacity-60 bg-muted/50" : "hover:shadow-md"}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Reorder Controls */}
                <div className="flex flex-row md:flex-col border rounded-lg p-1 bg-background shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleReorder(step.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <div className="text-center text-xs font-bold py-1">{step.step_number}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleReorder(step.id, "down")}
                    disabled={index === steps.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Image Preview */}
                <div className="w-full md:w-48 h-32 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden border">
                  {step.image_url ? (
                    <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {step.title}
                        {!step.is_active && <Badge variant="secondary">Hidden</Badge>}
                      </h3>
                      <p className="text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(step)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(step.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPreview && (
        <OnboardingWalkthrough 
          onComplete={() => setShowPreview(false)}
          previewMode={true}
          previewSteps={steps}
        />
      )}
    </div>
  );
}
