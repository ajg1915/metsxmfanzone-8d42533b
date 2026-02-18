import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Users, UserCheck, UserX } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

interface MemberRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  plan_type: string;
  status: string;
  end_date: string | null;
  roles: string[];
  created_at: string;
}

export default function MembersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });
      if (profilesError) throw profilesError;

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, plan_type, status, end_date")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map<string, string[]>();
      roles?.forEach(r => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      const membersData: MemberRow[] = (profiles || []).map(profile => {
        const activeSub = subscriptions?.find(s => s.user_id === profile.id && s.status === "active")
          || subscriptions?.find(s => s.user_id === profile.id);

        return {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          plan_type: activeSub?.plan_type || "free",
          status: activeSub?.status || "none",
          end_date: activeSub?.end_date || null,
          roles: roleMap.get(profile.id) || [],
          created_at: profile.created_at || "",
        };
      });

      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({ title: "Error", description: "Failed to load members", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async (userId: string, email: string | null) => {
    try {
      const response = await supabase.functions.invoke("delete-user-account", {
        body: { user_id: userId },
      });
      if (response.error) throw response.error;
      toast({ title: "Deleted", description: `${email || "User"} permanently deleted.` });
      fetchMembers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: "Failed to delete user account", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-affirmative";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === "active").length;
  const inactiveMembers = members.filter(m => m.status !== "active").length;

  return (
    <div className="space-y-4 mt-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-affirmative">{activeMembers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-affirmative opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-destructive">{inactiveMembers}</p>
              </div>
              <UserX className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{m.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.email || "No email"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.plan_type === "free" ? "outline" : "secondary"} className="text-xs capitalize">
                        {m.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(m.status)}`}>
                        {m.status || "none"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {m.roles.length > 0 ? m.roles.map(r => (
                          <Badge key={r} variant="outline" className="text-xs capitalize">{r}</Badge>
                        )) : <span className="text-xs text-muted-foreground">member</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {m.end_date ? new Date(m.end_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {m.user_id !== user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Permanently delete <strong>{m.email || "this user"}</strong>? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUserAccount(m.user_id, m.email)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
