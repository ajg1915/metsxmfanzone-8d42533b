import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Crown } from "lucide-react";

interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  profiles: {
    email: string;
    full_name: string;
  };
}

export default function UserSubscriptions() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState<"premium" | "annual">("premium");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile info for each subscription
      const subsWithProfiles = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", sub.user_id)
            .single();

          return {
            ...sub,
            profiles: profile || { email: "N/A", full_name: "Unknown" },
          };
        })
      );

      setSubscriptions(subsWithProfiles as any);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Find the user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has an active subscription
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", profile.id)
        .eq("status", "active")
        .single();

      if (existingSub) {
        toast({
          title: "Error",
          description: "User already has an active subscription",
          variant: "destructive",
        });
        return;
      }

      // Create a new subscription
      const endDate = new Date();
      if (planType === "premium") {
        endDate.setMonth(endDate.getMonth() + 1); // 1 month
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
      }

      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: profile.id,
          plan_type: planType,
          status: "active",
          amount: planType === "premium" ? 9.99 : 99.99,
          currency: "USD",
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} access granted to ${email}`,
      });

      setEmail("");
      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", end_date: new Date().toISOString() })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Access revoked successfully",
      });

      fetchSubscriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "active" ? "default" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getPlanBadge = (planType: string) => {
    return (
      <Badge variant="outline" className="gap-1">
        <Crown className="h-3 w-3" />
        {planType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grant Premium Access</CardTitle>
          <CardDescription>
            Give users full access to all premium content and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-type">Plan Type</Label>
              <Select value={planType} onValueChange={(value: "premium" | "annual") => setPlanType(value)}>
                <SelectTrigger id="plan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium (Monthly)</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Grant Access"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>
            Manage all users with premium access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : subscriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active subscriptions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.profiles?.full_name || "Unknown"}
                    </TableCell>
                    <TableCell>{sub.profiles?.email || "N/A"}</TableCell>
                    <TableCell>{getPlanBadge(sub.plan_type)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      {sub.end_date
                        ? new Date(sub.end_date).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeAccess(sub.id)}
                        disabled={loading || sub.status !== "active"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
