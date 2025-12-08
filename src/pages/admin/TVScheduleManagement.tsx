import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div>
        <h1 className="text-lg sm:text-xl font-bold">TV Schedule</h1>
        <p className="text-xs text-muted-foreground">ESPN & MLB Networks</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Network</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESPN Network">ESPN</SelectItem>
                    <SelectItem value="MLB Network">MLB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Time Slot</Label>
                <Input
                  placeholder="7:00 PM ET"
                  value={formData.time_slot}
                  onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Show Title</Label>
              <Input
                value={formData.show_title}
                onChange={(e) => setFormData({ ...formData, show_title: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_live}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                />
                <Label className="text-xs">Live</Label>
              </div>
              <Button type="submit" size="sm" className="h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{schedules.length} Schedules</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-6">No schedules</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-sm truncate">{schedule.show_title}</span>
                      <Badge variant="outline" className="text-[10px] px-1">{schedule.network.replace(" Network", "")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{schedule.time_slot}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={schedule.is_live}
                      onCheckedChange={() => toggleLiveStatus(schedule.id, schedule.is_live)}
                    />
                    <Button variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(schedule.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TVScheduleManagement;
