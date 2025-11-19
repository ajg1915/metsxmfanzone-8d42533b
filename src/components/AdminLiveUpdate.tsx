import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminUpdate {
  id: string;
  welcome_message: string;
  topics: string[];
  created_at: string;
}

interface AdminLiveUpdateProps {
  liveStreamId?: string;
}

export default function AdminLiveUpdate({ liveStreamId }: AdminLiveUpdateProps) {
  const [update, setUpdate] = useState<AdminUpdate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (liveStreamId) {
      fetchAdminUpdate();
    } else {
      setLoading(false);
    }
  }, [liveStreamId]);

  const fetchAdminUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from("live_stream_admin_updates")
        .select("*")
        .eq("live_stream_id", liveStreamId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUpdate(data);
    } catch (error) {
      console.error("Error fetching admin update:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!update) return null;

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-background mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          Welcome from the Admin Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription className="text-foreground">
            {update.welcome_message}
          </AlertDescription>
        </Alert>

        {update.topics && update.topics.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Today's Topics:
            </h4>
            <div className="flex flex-wrap gap-2">
              {update.topics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
