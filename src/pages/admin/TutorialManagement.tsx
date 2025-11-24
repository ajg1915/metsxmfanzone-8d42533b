import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown } from "lucide-react";

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from("tutorial_steps")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Tutorial step updated successfully" });
      } else {
        const { error } = await supabase
          .from("tutorial_steps")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Tutorial step created successfully" });
      }

      resetForm();
      fetchSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tutorial step?")) return;

    try {
      const { error } = await supabase
        .from("tutorial_steps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Tutorial step deleted successfully" });
      fetchSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (stepId: string, direction: "up" | "down") => {
    const currentStep = steps.find(s => s.id === stepId);
    if (!currentStep) return;

    const newNumber = direction === "up" 
      ? currentStep.step_number - 1 
      : currentStep.step_number + 1;

    const swapStep = steps.find(s => s.step_number === newNumber);
    if (!swapStep) return;

    try {
      // Swap the step numbers
      const { error: error1 } = await supabase
        .from("tutorial_steps")
        .update({ step_number: newNumber })
        .eq("id", currentStep.id);

      const { error: error2 } = await supabase
        .from("tutorial_steps")
        .update({ step_number: currentStep.step_number })
        .eq("id", swapStep.id);

      if (error1 || error2) throw error1 || error2;
      
      toast({ title: "Step order updated" });
      fetchSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tutorial Walkthrough Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Step"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Tutorial Step" : "Create Tutorial Step"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="step_number">Step Number</Label>
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Welcome to MetsXMFanZone!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Your ultimate destination for New York Mets content..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... or /src/assets/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={!step.is_active ? "opacity-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(step.id, "up")}
                      disabled={index === 0}
                      className="h-6 w-6"
                    >
                      <MoveUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(step.id, "down")}
                      disabled={index === steps.length - 1}
                      className="h-6 w-6"
                    >
                      <MoveDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Step {step.step_number}: {step.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(step)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(step.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {step.image_url && (
              <CardContent>
                <img 
                  src={step.image_url} 
                  alt={step.title}
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
