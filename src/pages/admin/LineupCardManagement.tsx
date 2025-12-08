import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineupPlayer {
  position: number;
  name: string;
  fieldPosition: string;
  imageUrl?: string;
}

interface StartingPitcher {
  name: string;
  hand: string;
  era: string;
  strikeouts: string;
}

export default function LineupCardManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    game_date: "",
    game_time: "",
    opponent: "",
    location: "",
    notes: "",
    published: false,
  });
  const [lineup, setLineup] = useState<LineupPlayer[]>([
    { position: 1, name: "", fieldPosition: "", imageUrl: "" },
    { position: 2, name: "", fieldPosition: "", imageUrl: "" },
    { position: 3, name: "", fieldPosition: "", imageUrl: "" },
    { position: 4, name: "", fieldPosition: "", imageUrl: "" },
    { position: 5, name: "", fieldPosition: "", imageUrl: "" },
    { position: 6, name: "", fieldPosition: "", imageUrl: "" },
    { position: 7, name: "", fieldPosition: "", imageUrl: "" },
    { position: 8, name: "", fieldPosition: "", imageUrl: "" },
    { position: 9, name: "", fieldPosition: "", imageUrl: "" },
  ]);
  const [pitcher, setPitcher] = useState<StartingPitcher>({
    name: "",
    hand: "RHP",
    era: "",
    strikeouts: "",
  });

  const { data: lineupCards } = useQuery({
    queryKey: ["lineup-cards-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lineup_cards")
        .select("*")
        .order("game_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        lineup_data: lineup as any,
        starting_pitcher: pitcher as any,
      };

      if (editingId) {
        const { error } = await supabase
          .from("lineup_cards")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lineup_cards").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Lineup card saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["lineup-cards-admin"] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error saving lineup card", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lineup_cards")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Lineup card deleted" });
      queryClient.invalidateQueries({ queryKey: ["lineup-cards-admin"] });
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      game_date: "",
      game_time: "",
      opponent: "",
      location: "",
      notes: "",
      published: false,
    });
    setLineup([
      { position: 1, name: "", fieldPosition: "", imageUrl: "" },
      { position: 2, name: "", fieldPosition: "", imageUrl: "" },
      { position: 3, name: "", fieldPosition: "", imageUrl: "" },
      { position: 4, name: "", fieldPosition: "", imageUrl: "" },
      { position: 5, name: "", fieldPosition: "", imageUrl: "" },
      { position: 6, name: "", fieldPosition: "", imageUrl: "" },
      { position: 7, name: "", fieldPosition: "", imageUrl: "" },
      { position: 8, name: "", fieldPosition: "", imageUrl: "" },
      { position: 9, name: "", fieldPosition: "", imageUrl: "" },
    ]);
    setPitcher({ name: "", hand: "RHP", era: "", strikeouts: "" });
  };

  const loadForEdit = (card: any) => {
    setEditingId(card.id);
    setFormData({
      game_date: card.game_date.split("T")[0],
      game_time: card.game_time,
      opponent: card.opponent,
      location: card.location || "",
      notes: card.notes || "",
      published: card.published,
    });
    setLineup((card.lineup_data as unknown as LineupPlayer[]) || []);
    setPitcher((card.starting_pitcher as unknown as StartingPitcher) || { name: "", hand: "RHP", era: "", strikeouts: "" });
  };

  return (
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold">Lineup Cards</h1>
        <Button onClick={resetForm} variant="outline" size="sm" className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" />
          New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Create"} Lineup Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Game Date</Label>
              <Input
                type="date"
                value={formData.game_date}
                onChange={(e) =>
                  setFormData({ ...formData, game_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Game Time</Label>
              <Input
                placeholder="7:10 PM EST"
                value={formData.game_time}
                onChange={(e) =>
                  setFormData({ ...formData, game_time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Opponent</Label>
              <Input
                placeholder="Atlanta Braves"
                value={formData.opponent}
                onChange={(e) =>
                  setFormData({ ...formData, opponent: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="Citi Field"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Game notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Batting Order</h3>
            <div className="space-y-3">
              {lineup.map((player, index) => (
                <div key={index} className="p-2 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-primary text-sm">{player.position}</span>
                    <Input
                      placeholder="Player"
                      value={player.name}
                      onChange={(e) => {
                        const newLineup = [...lineup];
                        newLineup[index].name = e.target.value;
                        setLineup(newLineup);
                      }}
                      className="flex-1 h-8 text-xs"
                    />
                    <Input
                      placeholder="Pos"
                      value={player.fieldPosition}
                      onChange={(e) => {
                        const newLineup = [...lineup];
                        newLineup[index].fieldPosition = e.target.value;
                        setLineup(newLineup);
                      }}
                      className="w-16 h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2 text-sm">Starting Pitcher</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="md:col-span-2">
                <Label>Pitcher Name</Label>
                <Input
                  value={pitcher.name}
                  onChange={(e) =>
                    setPitcher({ ...pitcher, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Hand</Label>
                <Input
                  placeholder="RHP"
                  value={pitcher.hand}
                  onChange={(e) =>
                    setPitcher({ ...pitcher, hand: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>ERA</Label>
                <Input
                  placeholder="2.85"
                  value={pitcher.era}
                  onChange={(e) =>
                    setPitcher({ ...pitcher, era: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Strikeouts</Label>
                <Input
                  placeholder="150"
                  value={pitcher.strikeouts}
                  onChange={(e) =>
                    setPitcher({ ...pitcher, strikeouts: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <Label>Published</Label>
            </div>
            <Button onClick={() => saveMutation.mutate()}>
              <Save className="w-4 h-4 mr-2" />
              Save Lineup Card
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Lineup Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lineupCards?.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {new Date(card.game_date).toLocaleDateString()} - vs{" "}
                    {card.opponent}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {card.game_time} • {card.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadForEdit(card)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(card.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
