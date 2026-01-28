import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Instagram, Twitter, Share2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
  storyTitle: string;
  mediaUrl: string;
}

interface SocialConnection {
  platform: string;
  page_name: string | null;
  account_username: string | null;
  status: string;
}

export const SocialShareDialog = ({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  mediaUrl,
}: SocialShareDialogProps) => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState(storyTitle);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("social_media_connections")
      .select("platform, page_name, account_username, status")
      .eq("status", "active");
    setConnections(data || []);
    setLoading(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      fetchConnections();
      setCaption(storyTitle);
      setSelectedPlatforms([]);
    }
    onOpenChange(isOpen);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const getFullMediaUrl = () => {
    if (mediaUrl.startsWith("http")) return mediaUrl;
    const { data } = supabase.storage.from("stories").getPublicUrl(mediaUrl);
    return data.publicUrl;
  };

  const handlePost = async () => {
    if (selectedPlatforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" });
      return;
    }

    setPosting(true);
    const results: { platform: string; success: boolean; error?: string }[] = [];
    const fullMediaUrl = getFullMediaUrl();

    for (const platform of selectedPlatforms) {
      try {
        const connection = connections.find((c) => c.platform === platform);
        if (!connection) continue;

        const { data: connData } = await supabase
          .from("social_media_connections")
          .select("access_token, page_id")
          .eq("platform", platform)
          .single();

        if (!connData) {
          results.push({ platform, success: false, error: "No connection found" });
          continue;
        }

        let functionName = `post-to-${platform}`;
        let body: Record<string, unknown> = {
          imageUrl: fullMediaUrl,
          caption,
        };

        if (platform === "facebook") {
          body.pageId = connData.page_id;
          body.accessToken = connData.access_token;
        } else if (platform === "instagram") {
          body.instagramAccountId = connData.page_id;
          body.accessToken = connData.access_token;
        } else if (platform === "twitter") {
          const creds = JSON.parse(connData.access_token);
          body = { ...body, ...creds };
        }

        const { data, error } = await supabase.functions.invoke(functionName, { body });

        if (error || data?.error) {
          results.push({ platform, success: false, error: data?.error || error?.message });
        } else {
          results.push({ platform, success: true });
          // Record the post
          await supabase.from("social_media_posts").insert({
            story_id: storyId,
            platform,
            external_post_id: data.postId,
            external_post_url: data.postUrl,
            caption,
            status: "posted",
            posted_at: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.push({ platform, success: false, error: message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    if (successCount > 0 && failCount === 0) {
      toast({ title: "Success!", description: `Posted to ${successCount} platform(s)` });
      onOpenChange(false);
    } else if (successCount > 0) {
      toast({
        title: "Partial Success",
        description: `Posted to ${successCount}, failed on ${failCount}`,
      });
    } else {
      toast({
        title: "Failed",
        description: results[0]?.error || "Could not post to any platform",
        variant: "destructive",
      });
    }

    setPosting(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return <Facebook className="w-4 h-4" />;
      case "instagram": return <Instagram className="w-4 h-4" />;
      case "twitter": return <Twitter className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Post to Social Media
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Platforms</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground mt-2">Loading...</p>
            ) : connections.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No connected accounts. Go to Settings → Social Media to connect.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {connections.map((conn) => (
                  <div
                    key={conn.platform}
                    className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => togglePlatform(conn.platform)}
                  >
                    <Checkbox checked={selectedPlatforms.includes(conn.platform)} />
                    {getPlatformIcon(conn.platform)}
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{conn.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.page_name || conn.account_username || "Connected"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePost} disabled={posting || selectedPlatforms.length === 0}>
            {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            {posting ? "Posting..." : "Post Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
