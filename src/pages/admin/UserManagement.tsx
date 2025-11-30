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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== "ajg1915@gmail.com") {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userRow) => (
                  <TableRow key={userRow.user_id}>
                    <TableCell className="font-medium">
                      {userRow.email || "No email"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          userRow.plan_type === "free"
                            ? "outline"
                            : userRow.plan_type === "annual"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {userRow.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          userRow.status === "active"
                            ? "default"
                            : userRow.status === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {userRow.status || "none"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userRow.end_date
                        ? new Date(userRow.end_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userRow.plan_type}
                        onValueChange={(value) =>
                          updateUserPlan(userRow.user_id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
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
