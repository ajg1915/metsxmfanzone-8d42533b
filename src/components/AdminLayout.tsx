import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && !user) {
        navigate("/auth");
        return;
      }

      if (user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        if (error || !data) {
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAdmin(true);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, loading, navigate, toast]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <header className="h-11 border-b flex items-center justify-between px-2 sm:px-3 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <SidebarTrigger className="h-7 w-7 flex-shrink-0" />
              <h1 className="text-xs sm:text-sm font-semibold truncate">Admin</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="h-7 text-xs px-2 flex-shrink-0"
            >
              <Home className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Back to Site</span>
            </Button>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-3 [&_h1]:text-lg [&_h1]:sm:text-xl [&_h2]:text-base [&_h2]:sm:text-lg [&_h3]:text-sm [&_h3]:sm:text-base [&_.container]:px-0 [&_.container]:sm:px-2 [&_.container]:py-2 [&_.container]:sm:py-3 [&_.container]:max-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
