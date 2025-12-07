import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send, Users, Newspaper, User, Eye, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RecipientType = "all_users" | "subscribers" | "specific";

interface RecipientCounts {
  allUsers: number;
  subscribers: number;
}

export default function EmailEditor() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all_users");
  const [specificEmails, setSpecificEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recipientCounts, setRecipientCounts] = useState<RecipientCounts>({ allUsers: 0, subscribers: 0 });
  const { toast } = useToast();

  // Fetch recipient counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [profilesRes, subscribersRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).not("email", "is", null),
          supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
        ]);

        setRecipientCounts({
          allUsers: profilesRes.count || 0,
          subscribers: subscribersRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !specificEmails.includes(email) && email.includes("@")) {
      setSpecificEmails([...specificEmails, email]);
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    setSpecificEmails(specificEmails.filter(e => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const getRecipientCount = () => {
    switch (recipientType) {
      case "all_users":
        return recipientCounts.allUsers;
      case "subscribers":
        return recipientCounts.subscribers;
      case "specific":
        return specificEmails.length;
      default:
        return 0;
    }
  };

  const getRecipientLabel = () => {
    switch (recipientType) {
      case "all_users":
        return "All Registered Users";
      case "subscribers":
        return "Newsletter Subscribers";
      case "specific":
        return "Specific Recipients";
      default:
        return "";
    }
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

    if (recipientType === "specific" && specificEmails.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add at least one email address",
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
      const { data, error } = await supabase.functions.invoke("send-user-email", {
        body: { 
          subject, 
          content,
          recipientType,
          specificEmails: recipientType === "specific" ? specificEmails : undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Campaign Sent!",
        description: `Successfully sent to ${data.sent} of ${data.total} recipients`,
      });
      
      // Clear form after successful send
      setSubject("");
      setContent("");
      setSpecificEmails([]);
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const emailTemplates = [
    {
      name: "Welcome Message",
      subject: "Welcome to MetsXMFanZone!",
      content: `<h1 style="color: #002D72;">Welcome to MetsXMFanZone, {{name}}!</h1>
<p>We're thrilled to have you join our community of passionate Mets fans.</p>
<p>Here's what you can do:</p>
<ul>
  <li>Watch exclusive live streams</li>
  <li>Connect with fellow fans</li>
  <li>Get the latest Mets news and updates</li>
</ul>
<p>Let's Go Mets!</p>
<p><a href="https://metsxmfanzone.com" style="background: #FF5910; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit MetsXMFanZone</a></p>`,
    },
    {
      name: "New Content Alert",
      subject: "New Content Available on MetsXMFanZone",
      content: `<h1 style="color: #002D72;">Hey {{name}}, check out what's new!</h1>
<p>We've just added exciting new content for you:</p>
<ul>
  <li>New podcast episodes</li>
  <li>Exclusive video highlights</li>
  <li>Community updates</li>
</ul>
<p>Don't miss out!</p>
<p><a href="https://metsxmfanzone.com" style="background: #FF5910; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Watch Now</a></p>`,
    },
    {
      name: "Live Stream Reminder",
      subject: "🔴 Live Stream Starting Soon!",
      content: `<h1 style="color: #002D72;">{{name}}, we're going live!</h1>
<p>A live stream is about to start on MetsXMFanZone.</p>
<p>Join us for exclusive coverage and connect with fellow fans in real-time.</p>
<p><a href="https://metsxmfanzone.com/live" style="background: #FF5910; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join the Stream</a></p>
<p>See you there!</p>`,
    },
  ];

  const loadTemplate = (template: typeof emailTemplates[0]) => {
    setSubject(template.subject);
    setContent(template.content);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template has been loaded`,
    });
  };

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Email Editor</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Send emails to registered users and newsletter subscribers
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Compose Email
              </CardTitle>
              <CardDescription className="text-xs">
                Use {"{{name}}"} to personalize with recipient's name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Recipients</Label>
                <Select value={recipientType} onValueChange={(v) => setRecipientType(v as RecipientType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Registered Users ({recipientCounts.allUsers})
                      </div>
                    </SelectItem>
                    <SelectItem value="subscribers">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        Newsletter Subscribers ({recipientCounts.subscribers})
                      </div>
                    </SelectItem>
                    <SelectItem value="specific">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Specific Recipients
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Emails Input */}
              {recipientType === "specific" && (
                <div className="space-y-2">
                  <Label className="text-sm">Add Email Addresses</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email and press Enter"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 text-sm"
                    />
                    <Button type="button" onClick={addEmail} size="sm">
                      Add
                    </Button>
                  </div>
                  {specificEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {specificEmails.map((email) => (
                        <Badge key={email} variant="secondary" className="text-xs">
                          {email}
                          <button
                            onClick={() => removeEmail(email)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm">Email Content (HTML) *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your email content here using HTML..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="text-sm font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="sm"
                  disabled={!content.trim()}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSend}
                  variant="default"
                  size="sm"
                  disabled={isSending || !subject.trim() || !content.trim() || getRecipientCount() === 0}
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
                      Send to {getRecipientCount()} {getRecipientCount() === 1 ? "recipient" : "recipients"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Templates</CardTitle>
              <CardDescription className="text-xs">
                Click to load a template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {emailTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => loadTemplate(template)}
                >
                  {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Personalization</CardTitle>
              <CardDescription className="text-xs">
                Available variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <code className="text-xs bg-muted px-2 py-1 rounded block">{"{{name}}"} - Recipient's name</code>
              <code className="text-xs bg-muted px-2 py-1 rounded block">{"{{email}}"} - Recipient's email</code>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the email to <strong>{getRecipientCount()}</strong> {getRecipientLabel().toLowerCase()}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend}>Send Email</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Email Preview</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Subject:</strong> {subject || "(No subject)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div 
            className="border rounded-lg p-4 bg-white text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: content.replace(/\{\{name\}\}/g, "John Doe").replace(/\{\{email\}\}/g, "johndoe@example.com") 
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}