import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, ExternalLink, User, Mail, Calendar, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WriterApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  reason: string | null;
  portfolio_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const WriterApplications = () => {
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<WriterApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("writer_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load writer applications",
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedApp) return;

    setProcessingId(selectedApp.id);

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from("writer_applications")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedApp.id);

      if (updateError) throw updateError;

      // If approved, add writer role
      if (action === "approve") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: selectedApp.user_id,
            role: "writer",
          });

        if (roleError && !roleError.message.includes("duplicate")) {
          console.error("Error adding writer role:", roleError);
        }
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-writer-approval-email", {
        body: {
          email: selectedApp.email,
          name: selectedApp.full_name,
          status: action === "approve" ? "approved" : "rejected",
          adminNotes: adminNotes || undefined,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: action === "approve" ? "Application Approved" : "Application Rejected",
        description: `${selectedApp.full_name}'s application has been ${action === "approve" ? "approved" : "rejected"}. An email notification has been sent.`,
      });

      setSelectedApp(null);
      setAdminNotes("");
      setDialogAction(null);
      fetchApplications();
    } catch (error: any) {
      console.error("Error processing application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openDialog = (app: WriterApplication, action: "approve" | "reject") => {
    setSelectedApp(app);
    setDialogAction(action);
    setAdminNotes("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Writer Applications</h1>
          <p className="text-muted-foreground">
            Review and manage writer applications
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </p>
        </div>
        <Button onClick={fetchApplications} variant="outline" disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Applications</h3>
            <p className="text-muted-foreground">There are no writer applications to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id} className={app.status === "pending" ? "border-yellow-500/50" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {app.full_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {app.email}
                    </CardDescription>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Why they want to write:</p>
                  <p className="text-sm">{app.reason || "No reason provided"}</p>
                </div>
                
                {app.portfolio_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Portfolio:</p>
                    <a 
                      href={app.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View Portfolio <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Applied: {new Date(app.created_at).toLocaleDateString()}
                  {app.reviewed_at && (
                    <> • Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}</>
                  )}
                </div>

                {app.admin_notes && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Admin Notes:</p>
                    <p className="text-sm text-muted-foreground">{app.admin_notes}</p>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => openDialog(app, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={processingId === app.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => openDialog(app, "reject")}
                      variant="destructive"
                      className="flex-1"
                      disabled={processingId === app.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!dialogAction} onOpenChange={() => { setDialogAction(null); setSelectedApp(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve" 
                ? `You are about to approve ${selectedApp?.full_name}'s writer application. They will receive email access to the writer portal.`
                : `You are about to reject ${selectedApp?.full_name}'s writer application. They will be notified via email.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                {dialogAction === "approve" ? "Welcome message (optional)" : "Feedback for applicant (optional)"}
              </Label>
              <Textarea
                id="adminNotes"
                placeholder={dialogAction === "approve" 
                  ? "Any notes or welcome message for the new writer..."
                  : "Provide constructive feedback..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogAction(null); setSelectedApp(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={() => dialogAction && handleAction(dialogAction)}
              className={dialogAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={dialogAction === "reject" ? "destructive" : "default"}
              disabled={processingId !== null}
            >
              {processingId ? "Processing..." : dialogAction === "approve" ? "Approve & Send Email" : "Reject & Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WriterApplications;