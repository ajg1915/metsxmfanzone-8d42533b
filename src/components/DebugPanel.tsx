import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DebugPanel = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { tier, isPremium, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 max-h-96 overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm">🔍 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Auth Status:</strong>
          <div className="ml-2 mt-1">
            <div>Loading: {authLoading ? '⏳' : '✅'}</div>
            <div>User ID: {user?.id || '❌ None'}</div>
            <div>Email: {user?.email || '❌ None'}</div>
            <div>Session: {session ? '✅ Active' : '❌ None'}</div>
          </div>
        </div>

        <div>
          <strong>Subscription Status:</strong>
          <div className="ml-2 mt-1">
            <div>Loading: {subLoading ? '⏳' : '✅'}</div>
            <div>Tier: <Badge variant={isPremium ? "default" : "secondary"}>{tier}</Badge></div>
            <div>Is Premium: {isPremium ? '✅' : '❌'}</div>
          </div>
        </div>

        <div>
          <strong>Admin Status:</strong>
          <div className="ml-2 mt-1">
            <div>Loading: {adminLoading ? '⏳' : '✅'}</div>
            <div>Is Admin: {isAdmin ? '✅' : '❌'}</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <strong>Expected Values:</strong>
          <div className="ml-2 mt-1 text-muted-foreground">
            <div>Email: ajg1915@gmail.com</div>
            <div>Should be: Admin ✅ + Annual ✅</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
