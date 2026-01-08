import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Mic, ExternalLink, Loader2, Clock, User, Mail, Phone } from "lucide-react";

interface PodcasterApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  experience: string | null;
  podcast_topic: string;
  sample_url: string | null;
  equipment_description: string | null;
  availability: string | null;
  social_links: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function PodcasterApplicationsManagement() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PodcasterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<PodcasterApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("podcaster_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: "approved" | "rejected") => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("podcaster_applications")
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: status === "approved" ? "Application Approved" : "Application Rejected",
        description: `The podcaster application has been ${status}.`,
      });

      setSelectedApplication(null);
      setAdminNotes("");
      fetchApplications();
    } catch (error: any) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>;
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Podcaster Applications
          </h1>
          <p className="text-muted-foreground">
            Review and manage podcaster applications
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-yellow-500/20 rounded-full">
            <span className="text-yellow-400 font-medium">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mic className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No applications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{application.full_name}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-primary font-medium">{application.podcast_topic}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {application.email}
                      </span>
                      {application.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {application.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedApplication(application);
                      setAdminNotes(application.admin_notes || "");
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Review Application
            </DialogTitle>
            <DialogDescription>
              Review the podcaster application details
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-medium">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                </div>

                {selectedApplication.phone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">Podcast Topic/Focus</label>
                  <p className="font-medium text-primary">{selectedApplication.podcast_topic}</p>
                </div>

                {selectedApplication.experience && (
                  <div>
                    <label className="text-sm text-muted-foreground">Experience</label>
                    <p className="text-sm">{selectedApplication.experience}</p>
                  </div>
                )}

                {selectedApplication.sample_url && (
                  <div>
                    <label className="text-sm text-muted-foreground">Sample Content</label>
                    <a 
                      href={selectedApplication.sample_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      View Sample <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {selectedApplication.equipment_description && (
                  <div>
                    <label className="text-sm text-muted-foreground">Equipment</label>
                    <p className="text-sm">{selectedApplication.equipment_description}</p>
                  </div>
                )}

                {selectedApplication.availability && (
                  <div>
                    <label className="text-sm text-muted-foreground">Availability</label>
                    <p className="text-sm">{selectedApplication.availability}</p>
                  </div>
                )}

                {selectedApplication.social_links && (
                  <div>
                    <label className="text-sm text-muted-foreground">Social Media</label>
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.social_links}</p>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "approved")}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "rejected")}
                    disabled={processing}
                    variant="destructive"
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              )}

              {selectedApplication.status !== "pending" && (
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    This application was {selectedApplication.status} on{" "}
                    {selectedApplication.reviewed_at 
                      ? new Date(selectedApplication.reviewed_at).toLocaleDateString()
                      : "N/A"
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}