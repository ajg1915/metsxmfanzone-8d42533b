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

export default function NewsletterGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [sections, setSections] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a newsletter topic",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-newsletter", {
        body: {
          topic,
          tone,
          audience,
          sections,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast({
        title: "Newsletter Generated!",
        description: "Your AI-powered newsletter is ready",
      });
    } catch (error: any) {
      console.error("Error generating newsletter:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate newsletter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Newsletter content copied to clipboard",
    });
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject line before sending",
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
        body: {
          subject,
          content: generatedContent,
        },
      });

      if (error) throw error;

      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent to ${data.sent} subscribers`,
      });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">AI Newsletter Generator</h2>
        <p className="text-muted-foreground">
          Generate engaging email newsletters powered by AI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Newsletter Parameters
            </CardTitle>
            <CardDescription>
              Configure your newsletter details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Latest Mets Updates, Spring Training Recap"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Mets fans, sports enthusiasts"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sections">Sections to Include</Label>
              <Textarea
                id="sections"
                placeholder="e.g., game highlights, player stats, upcoming events"
                value={sections}
                onChange={(e) => setSections(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Newsletter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Generated newsletter content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter newsletter subject line"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button
                    onClick={handleSend}
                    variant="default"
                    size="sm"
                    className="flex-1"
                    disabled={isSending || !subject.trim()}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Newsletter
                      </>
                    )}
                  </Button>
                </div>
                <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto bg-muted/50">
                  <div
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Generate a newsletter to see the preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
