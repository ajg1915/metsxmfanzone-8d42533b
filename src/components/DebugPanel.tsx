import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DebugPanel = () => {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { tier, isPremium, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const handleForceRefresh = async () => {
    toast({
      title: "Refreshing session...",
      description: "Please wait",
    });

    // Sign out and redirect to auth
    await signOut();
    window.location.href = '/auth';
  };

  const handleTestAdminQuery = async () => {
    if (!user) {
      toast({
        title: "No user",
        description: "Please log in first",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id);

    toast({
      title: "Admin Query Result",
      description: error 
        ? `Error: ${error.message}` 
        : `Found ${data?.length || 0} roles: ${data?.map(d => d.role).join(', ') || 'none'}`,
      variant: error ? "destructive" : "default",
    });

    console.log('Admin query test:', { data, error, userId: user.id });
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-[32rem] overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          🔍 Debug Panel
          <Button size="sm" variant="ghost" onClick={handleForceRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <strong>Auth Status:</strong>
          <div className="ml-2 mt-1 space-y-1">
            <div>Loading: {authLoading ? '⏳' : '✅'}</div>
            <div className="break-all">User ID: {user?.id || '❌ None'}</div>
            <div>Email: {user?.email || '❌ None'}</div>
            <div>Session: {session ? '✅ Active' : '❌ None'}</div>
          </div>
        </div>

        <div>
          <strong>Subscription Status:</strong>
          <div className="ml-2 mt-1 space-y-1">
            <div>Loading: {subLoading ? '⏳' : '✅'}</div>
            <div>Tier: <Badge variant={isPremium ? "default" : "secondary"}>{tier}</Badge></div>
            <div>Is Premium: {isPremium ? '✅' : '❌'}</div>
          </div>
        </div>

        <div>
          <strong>Admin Status:</strong>
          <div className="ml-2 mt-1 space-y-1">
            <div>Loading: {adminLoading ? '⏳' : '✅'}</div>
            <div>Is Admin: {isAdmin ? '✅ YES' : '❌ NO'}</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <strong>Expected Values:</strong>
          <div className="ml-2 mt-1 text-muted-foreground space-y-1">
            <div>Email: ajg1915@gmail.com</div>
            <div>User ID: 924a804c-5dd5-40cc-afbe-f272eaef713f</div>
            <div>Should be: Admin ✅ + Annual ✅</div>
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={handleTestAdminQuery}
          >
            Test Admin Query
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            className="w-full"
            onClick={handleForceRefresh}
          >
            Force Sign Out & Re-login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
