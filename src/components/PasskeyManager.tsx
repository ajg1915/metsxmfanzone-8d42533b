import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Fingerprint, Trash2, Plus, Smartphone, Loader2 } from "lucide-react";
import { format } from "date-fns";
import BiometricEnrollment from "./BiometricEnrollment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Passkey {
  id: string;
  credential_id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

const PasskeyManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);

  const fetchPasskeys = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_passkeys")
        .select("id, credential_id, device_name, created_at, last_used_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPasskeys(data || []);
    } catch (error) {
      console.error("Error fetching passkeys:", error);
      toast({
        title: "Error",
        description: "Failed to load passkeys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, [user]);

  const handleDeletePasskey = async (passkeyId: string) => {
    setDeleting(passkeyId);

    try {
      const { error } = await supabase
        .from("user_passkeys")
        .delete()
        .eq("id", passkeyId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setPasskeys((prev) => prev.filter((pk) => pk.id !== passkeyId));
      toast({
        title: "Passkey removed",
        description: "The passkey has been removed from your account.",
      });
    } catch (error) {
      console.error("Error deleting passkey:", error);
      toast({
        title: "Error",
        description: "Failed to remove passkey",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleNewPasskeyComplete = () => {
    setShowAddNew(false);
    fetchPasskeys();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-primary" />
          Biometric Login
        </CardTitle>
        <CardDescription>
          Manage your passkeys for quick and secure sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {passkeys.length === 0 && !showAddNew ? (
          <div className="text-center py-6">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No passkeys registered yet. Add one to sign in faster.
            </p>
            <Button onClick={() => setShowAddNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Passkey
            </Button>
          </div>
        ) : (
          <>
            {showAddNew && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <BiometricEnrollment 
                  showAsCard={false}
                  showTitle={false}
                  onComplete={handleNewPasskeyComplete}
                  onSkip={() => setShowAddNew(false)}
                />
              </div>
            )}

            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Fingerprint className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {passkey.device_name || "Unknown Device"}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Added {format(new Date(passkey.created_at), "MMM d, yyyy")}</span>
                      {passkey.last_used_at && (
                        <>
                          <span>•</span>
                          <span>Last used {format(new Date(passkey.last_used_at), "MMM d, yyyy")}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleting === passkey.id}
                    >
                      {deleting === passkey.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Passkey?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove "{passkey.device_name || "Unknown Device"}" from your account.
                        You won't be able to use it to sign in anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePasskey(passkey.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            {passkeys.length > 0 && !showAddNew && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAddNew(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Passkey
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PasskeyManager;
