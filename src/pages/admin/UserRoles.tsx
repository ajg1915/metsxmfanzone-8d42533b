import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function UserRoles() {
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user roles:", error);
    } else {
      setUserRoles(data as any || []);
    }
  };

  const handleAddRole = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        throw new Error("User not found");
      }

      // Add role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: profile.id,
          role: selectedRole as "admin" | "moderator" | "user",
        }]);

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: `Role ${selectedRole} added to user`,
      });

      setEmail("");
      setSelectedRole("user");
      fetchUserRoles();
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

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed",
      });

      fetchUserRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-3xl font-bold mb-6">User Roles Management</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Assign Role
            </CardTitle>
            <CardDescription>
              Grant admin or moderator privileges to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRole} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Assign Role"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current User Roles</CardTitle>
            <CardDescription>
              Manage existing user privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles assigned yet</p>
              ) : (
                userRoles.map((userRole) => (
                  <div
                    key={userRole.id}
                    className="flex items-center justify-between p-3 bg-muted rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {userRole.profiles?.full_name || userRole.profiles?.email || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {userRole.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(userRole.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
