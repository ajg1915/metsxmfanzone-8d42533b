import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TVSchedule {
  id: string;
  network: string;
  show_title: string;
  description?: string;
  time_slot: string;
  is_live: boolean;
}

const TVScheduleManagement = () => {
  const [schedules, setSchedules] = useState<TVSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    network: "ESPN Network",
    show_title: "",
    description: "",
    time_slot: "",
    is_live: false,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("tv_schedules")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch TV schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("tv_schedules").insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "TV schedule added successfully",
      });

      setFormData({
        network: "ESPN Network",
        show_title: "",
        description: "",
        time_slot: "",
        is_live: false,
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add TV schedule",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("tv_schedules").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "TV schedule deleted successfully",
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete TV schedule",
        variant: "destructive",
      });
    }
  };

  const toggleLiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tv_schedules")
        .update({ is_live: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Live status updated",
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update live status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">TV Schedule Management</h1>
        <p className="text-muted-foreground">
          Manage TV schedules for ESPN Network and MLB Network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Schedule
          </CardTitle>
          <CardDescription>Add a new show to the TV schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="network">Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value) =>
                  setFormData({ ...formData, network: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESPN Network">ESPN Network</SelectItem>
                  <SelectItem value="MLB Network">MLB Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="show_title">Show Title</Label>
              <Input
                id="show_title"
                value={formData.show_title}
                onChange={(e) =>
                  setFormData({ ...formData, show_title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="time_slot">Time Slot</Label>
              <Input
                id="time_slot"
                placeholder="e.g., 7:00 PM ET"
                value={formData.time_slot}
                onChange={(e) =>
                  setFormData({ ...formData, time_slot: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_live"
                checked={formData.is_live}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_live: checked })
                }
              />
              <Label htmlFor="is_live">Currently Live</Label>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Schedules
          </CardTitle>
          <CardDescription>
            {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No schedules found. Add your first TV schedule above.
            </p>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {schedule.show_title}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            ({schedule.network})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Time: {schedule.time_slot}
                        </p>
                        {schedule.description && (
                          <p className="text-sm">{schedule.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={schedule.is_live}
                              onCheckedChange={() =>
                                toggleLiveStatus(schedule.id, schedule.is_live)
                              }
                            />
                            <Label>
                              {schedule.is_live ? "Live Now" : "Not Live"}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TVScheduleManagement;
