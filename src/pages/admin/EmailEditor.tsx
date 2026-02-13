import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send, Users, Newspaper, User, Eye, X, TestTube, ShieldCheck, UserPlus, CreditCard } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type RecipientType = "all_users" | "subscribers" | "specific";
type EmailTemplateType = "custom" | "otp" | "welcome" | "subscription";

interface RecipientCounts {
  allUsers: number;
  subscribers: number;
}

// HTML escaping utility to prevent XSS in email templates
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Email template HTML generator functions
const generateOtpEmailHtml = (otp: string) => {
  const safeOtp = escapeHtml(otp);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
  <div style="max-width: 320px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
    <div style="text-align: center; margin-bottom: 16px;">
      <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
      <div>
        <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
      </div>
    </div>
    
    <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 12px;">
      Your verification code:
    </p>
    
    <div style="background: #002D72; padding: 12px 16px; text-align: center; border-radius: 6px; margin-bottom: 12px;">
      <span style="font-size: 24px; font-weight: bold; letter-spacing: 6px; color: #ffffff; font-family: 'Courier New', monospace;">
        ${safeOtp}
      </span>
    </div>
    
    <p style="color: #666; text-align: center; font-size: 11px; margin: 0 0 12px;">
      Expires in <strong style="color: #FF5910;">5 min</strong>
    </p>
    
    <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
      <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
        Didn't request this? Ignore this email.
      </p>
      <div style="text-align: center; margin-bottom: 8px;">
        <a href="https://www.facebook.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://twitter.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.instagram.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.youtube.com/@MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733646.png" alt="YouTube" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
      </div>
      <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
        <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

const generateWelcomeEmailHtml = (name: string) => {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
  <div style="max-width: 320px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
    <div style="text-align: center; margin-bottom: 16px;">
      <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
      <div>
        <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
      </div>
    </div>
    
    <p style="color: #ffffff; text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 12px;">
      Welcome, ${safeName}!
    </p>
    
    <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 16px;">
      Your account has been created successfully.
    </p>
    
    <div style="background: #002D72; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <p style="color: #ffffff; font-size: 11px; margin: 0 0 8px; font-weight: bold;">What's Next:</p>
      <ul style="color: #d0d0d0; font-size: 10px; margin: 0; padding-left: 16px;">
        <li style="margin-bottom: 4px;">Choose a subscription plan</li>
        <li style="margin-bottom: 4px;">Watch live streams</li>
        <li style="margin-bottom: 4px;">Connect with fans</li>
      </ul>
    </div>
    
    <p style="color: #FF5910; text-align: center; font-size: 12px; font-weight: bold; margin: 0 0 12px;">
      Let's Go Mets!
    </p>
    
    <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
      <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
        The MetsXMFanZone Team
      </p>
      <div style="text-align: center; margin-bottom: 8px;">
        <a href="https://www.facebook.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://twitter.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.instagram.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.youtube.com/@MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733646.png" alt="YouTube" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
      </div>
      <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
        <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

const generateSubscriptionEmailHtml = (name: string, planName: string, amount: string) => {
  const safeName = escapeHtml(name);
  const safePlanName = escapeHtml(planName);
  const safeAmount = escapeHtml(amount);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background-color: #0a0a0a;">
  <div style="max-width: 320px; margin: 0 auto; background-color: #1a1a2e; border-radius: 8px; padding: 20px; border: 1px solid #2a2a3e;">
    <div style="text-align: center; margin-bottom: 16px;">
      <img src="https://metsxmfanzone.com/logo-192.png" alt="MetsXMFanZone" style="width: 60px; height: 60px; margin-bottom: 8px;" />
      <div>
        <span style="color: #002D72; font-size: 18px; font-weight: bold;">Mets</span><span style="color: #FF5910; font-size: 18px; font-weight: bold;">XM</span><span style="color: #ffffff; font-size: 18px; font-weight: bold;">FanZone</span>
      </div>
    </div>
    
    <p style="color: #4ade80; text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 12px;">
      Payment Successful!
    </p>
    
    <p style="color: #a0a0a0; text-align: center; font-size: 12px; margin: 0 0 16px;">
      Hi ${safeName}, your subscription is active.
    </p>
    
    <div style="background: #002D72; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #a0a0a0; font-size: 11px;">Plan:</span>
        <span style="color: #ffffff; font-size: 11px; font-weight: bold;">${safePlanName}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #a0a0a0; font-size: 11px;">Amount:</span>
        <span style="color: #ffffff; font-size: 11px; font-weight: bold;">$${safeAmount}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #a0a0a0; font-size: 11px;">Status:</span>
        <span style="color: #4ade80; font-size: 11px; font-weight: bold;">Active</span>
      </div>
    </div>
    
    <div style="background: #1f1f3a; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
      <p style="color: #FF5910; font-size: 10px; margin: 0 0 6px; font-weight: bold;">Your Benefits:</p>
      <p style="color: #d0d0d0; font-size: 10px; margin: 0; line-height: 1.4;">
        Live streams • Replays • Premium content • Ad-free
      </p>
    </div>
    
    <div style="border-top: 1px solid #2a2a3e; padding-top: 12px;">
      <p style="color: #555; font-size: 10px; text-align: center; margin: 0 0 10px;">
        The MetsXMFanZone Team
      </p>
      <div style="text-align: center; margin-bottom: 8px;">
        <a href="https://www.facebook.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://twitter.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.instagram.com/MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
        <a href="https://www.youtube.com/@MetsXMFanZone" style="display: inline-block; margin: 0 6px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/24/733/733646.png" alt="YouTube" style="width: 20px; height: 20px; opacity: 0.7;" />
        </a>
      </div>
      <p style="color: #444; font-size: 9px; text-align: center; margin: 0;">
        <a href="https://metsxmfanzone.com" style="color: #FF5910; text-decoration: none;">metsxmfanzone.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};

export default function EmailEditor() {
  const [activeTab, setActiveTab] = useState<EmailTemplateType>("custom");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all_users");
  const [specificEmails, setSpecificEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recipientCounts, setRecipientCounts] = useState<RecipientCounts>({ allUsers: 0, subscribers: 0 });
  const [testEmail, setTestEmail] = useState("");
  
  // Template-specific fields
  const [otpCode, setOtpCode] = useState("123456");
  const [welcomeName, setWelcomeName] = useState("Mets Fan");
  const [subscriptionName, setSubscriptionName] = useState("Mets Fan");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Premium Monthly");
  const [subscriptionAmount, setSubscriptionAmount] = useState("4.99");
  
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

  const getCurrentEmailHtml = () => {
    switch (activeTab) {
      case "otp":
        return generateOtpEmailHtml(otpCode);
      case "welcome":
        return generateWelcomeEmailHtml(welcomeName);
      case "subscription":
        return generateSubscriptionEmailHtml(subscriptionName, subscriptionPlan, subscriptionAmount);
      case "custom":
      default:
        return content;
    }
  };

  const getCurrentSubject = () => {
    switch (activeTab) {
      case "otp":
        return "Your MetsXMFanZone Verification Code";
      case "welcome":
        return "Welcome to MetsXMFanZone.com";
      case "subscription":
        return `Payment Confirmed - ${subscriptionPlan} Plan`;
      case "custom":
      default:
        return subject;
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim() || !testEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address for testing",
        variant: "destructive",
      });
      return;
    }

    // Validate custom email has subject and content
    if (activeTab === "custom" && (!subject.trim() || !content.trim())) {
      toast({
        title: "Required Fields",
        description: "Please enter both subject and content before sending a test email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);

    try {
      if (activeTab === "otp") {
        const { error } = await supabase.functions.invoke("send-otp-email", {
          body: { to: testEmail, otp: otpCode },
        });
        if (error) throw error;
      } else if (activeTab === "welcome") {
        const { error } = await supabase.functions.invoke("send-confirmation-email", {
          body: { type: "welcome", email: testEmail, name: welcomeName },
        });
        if (error) throw error;
      } else if (activeTab === "subscription") {
        const { error } = await supabase.functions.invoke("send-confirmation-email", {
          body: { 
            type: "subscription", 
            email: testEmail, 
            name: subscriptionName,
            planType: subscriptionPlan.toLowerCase().includes("annual") ? "annual" : "premium",
            amount: subscriptionAmount,
          },
        });
        if (error) throw error;
      } else {
        // Custom email
        const { error } = await supabase.functions.invoke("send-user-email", {
          body: { 
            subject, 
            content,
            recipientType: "specific",
            specificEmails: [testEmail],
          },
        });
        if (error) throw error;
      }

      toast({
        title: "Test Email Sent!",
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (activeTab === "custom" && (!subject.trim() || !content.trim())) {
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
          subject: getCurrentSubject(), 
          content: getCurrentEmailHtml(),
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
      if (activeTab === "custom") {
        setSubject("");
        setContent("");
      }
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
          Manage and test all email templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EmailTemplateType)} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="custom" className="text-xs sm:text-sm">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="otp" className="text-xs sm:text-sm">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            2FA
          </TabsTrigger>
          <TabsTrigger value="welcome" className="text-xs sm:text-sm">
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Welcome
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm">
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Test Email Section - Shown for all tabs */}
        <Card className="border-dashed border-2 border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Send Test Email
            </CardTitle>
            <CardDescription className="text-xs">
              Test the current template before sending to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button
                onClick={sendTestEmail}
                size="sm"
                variant="secondary"
                disabled={isSendingTest || !testEmail.trim()}
              >
                {isSendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2FA OTP Tab */}
        <TabsContent value="otp" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  2FA Verification Email
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure the OTP code for preview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">OTP Code (Preview)</Label>
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="font-mono text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is just for preview. Actual OTP codes are generated automatically.
                  </p>
                </div>
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Email
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0a0a] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="scale-90 origin-top-left"
                  dangerouslySetInnerHTML={{ __html: generateOtpEmailHtml(otpCode || "123456") }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Welcome Tab */}
        <TabsContent value="welcome" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Welcome Email
                </CardTitle>
                <CardDescription className="text-xs">
                  Sent when a new user creates an account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">User Name (Preview)</Label>
                  <Input
                    value={welcomeName}
                    onChange={(e) => setWelcomeName(e.target.value)}
                    placeholder="Mets Fan"
                  />
                </div>
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Email
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0a0a] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="scale-90 origin-top-left"
                  dangerouslySetInnerHTML={{ __html: generateWelcomeEmailHtml(welcomeName || "Mets Fan") }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Confirmation Email
                </CardTitle>
                <CardDescription className="text-xs">
                  Sent after successful subscription payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">User Name</Label>
                  <Input
                    value={subscriptionName}
                    onChange={(e) => setSubscriptionName(e.target.value)}
                    placeholder="Mets Fan"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Plan Name</Label>
                  <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Premium Monthly">Premium Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Amount</Label>
                  <Input
                    value={subscriptionAmount}
                    onChange={(e) => setSubscriptionAmount(e.target.value)}
                    placeholder="4.99"
                  />
                </div>
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Email
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0a0a] border-[#2a2a3e]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="scale-90 origin-top-left"
                  dangerouslySetInnerHTML={{ __html: generateSubscriptionEmailHtml(subscriptionName || "Mets Fan", subscriptionPlan, subscriptionAmount || "4.99") }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Email Tab */}
        <TabsContent value="custom" className="space-y-4">
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
        </TabsContent>
      </Tabs>

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
        <AlertDialogContent className="max-w-md max-h-[90vh] overflow-auto bg-[#0a0a0a] border-[#2a2a3e]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Email Preview</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Subject:</strong> {getCurrentSubject() || "(No subject)"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                activeTab === "custom" 
                  ? content.replace(/\{\{name\}\}/g, "John Doe").replace(/\{\{email\}\}/g, "johndoe@example.com")
                  : getCurrentEmailHtml(),
                { 
                  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'img'],
                  ALLOWED_ATTR: ['href', 'src'],
                  ALLOW_DATA_ATTR: false,
                }
              )
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
