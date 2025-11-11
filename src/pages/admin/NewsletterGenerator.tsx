import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Copy, Send } from "lucide-react";
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

export default function NewsletterEditor() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Newsletter content copied to clipboard",
    });
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter both subject and content before sending",
        variant: "destructive",
      });
      return;
    }
    setShowSendDialog(true);
  };

  const confirmSend = async () => {
    setShowSendDialog(false);
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { subject, content },
      });

      if (error) throw error;

      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${data.sent} subscribers`,
      });
      
      // Clear form after successful send
      setSubject("");
      setContent("");
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Newsletter Editor</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Create and send newsletters to your subscribers
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Create Newsletter
          </CardTitle>
          <CardDescription className="text-xs">
            Compose your newsletter content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm">Email Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter newsletter subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm">Newsletter Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your newsletter content here... You can use HTML formatting."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Tip: You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={!content.trim()}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Content
            </Button>
            <Button
              onClick={handleSend}
              variant="default"
              size="sm"
              disabled={isSending || !subject.trim() || !content.trim()}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Subscribers
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Newsletter to All Subscribers?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the newsletter to all active subscribers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend}>Send Newsletter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
