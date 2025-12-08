import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UserSubscription {
  user_id: string;
  email: string | null;
  plan_type: string;
  status: string;
  created_at: string;
  end_date: string | null;
  subscription_id: string | null;
}

const UserManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    };

    checkAdminAndFetch();
  }, [user, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: subscriptions, error: subsError } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;

      const usersWithSubs: UserSubscription[] = profiles.map((profile) => {
        const userSub = subscriptions?.find(
          (sub) => sub.user_id === profile.id && sub.status === "active"
        );

        return {
          user_id: profile.id,
          email: profile.email,
          plan_type: userSub?.plan_type || "free",
          status: userSub?.status || "none",
          created_at: userSub?.created_at || "",
          end_date: userSub?.end_date || null,
          subscription_id: userSub?.id || null,
        };
      });

      setUsers(usersWithSubs);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const targetUser = users.find((u) => u.user_id === userId);
      
      if (newPlan === "free") {
        if (targetUser?.subscription_id) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "cancelled" })
            .eq("id", targetUser.subscription_id);

          if (error) throw error;
        }
      } else {
        if (targetUser?.subscription_id) {
          const endDate = new Date();
          if (newPlan === "premium") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (newPlan === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const { error } = await supabase
            .from("subscriptions")
            .update({
              plan_type: newPlan,
              status: "active",
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
            })
            .eq("id", targetUser.subscription_id);

          if (error) throw error;
        } else {
          const endDate = new Date();
          if (newPlan === "premium") {
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (newPlan === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const { error } = await supabase
            .from("subscriptions")
            .insert({
              user_id: userId,
              plan_type: newPlan,
              status: "active",
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              amount: newPlan === "premium" ? 9.99 : 99.99,
              currency: "USD",
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: `User plan updated to ${newPlan}`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error updating user plan:", error);
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 py-3 space-y-4 overflow-x-hidden">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">User Management</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table className="text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Plan</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">End</TableHead>
                  <TableHead className="text-xs">Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userRow) => (
                  <TableRow key={userRow.user_id}>
                    <TableCell className="font-medium max-w-[120px] sm:max-w-none truncate text-xs">
                      {userRow.email || "No email"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={userRow.plan_type === "free" ? "outline" : "secondary"} className="text-xs">
                        {userRow.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={userRow.status === "active" ? "default" : "outline"} className="text-xs">
                        {userRow.status || "none"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {userRow.end_date ? new Date(userRow.end_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userRow.plan_type}
                        onValueChange={(value) => updateUserPlan(userRow.user_id, value)}
                      >
                        <SelectTrigger className="w-20 sm:w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
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
};

export default UserManagement;
