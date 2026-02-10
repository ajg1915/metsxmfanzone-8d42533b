import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { AdminPinVerification } from "@/components/AdminPinVerification";
import { generateDeviceFingerprint } from "@/utils/deviceFingerprint";

function AdminHeader({ navigate }: { navigate: (path: string | number) => void }) {
  const location = useLocation();
  const isOnDashboard = location.pathname === "/admin" || location.pathname === "/admin/";

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1 as unknown as string);
    } else {
      navigate("/admin");
    }
  };

  return (
    <header className="h-10 border-b border-border/40 flex items-center justify-between px-2 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="h-7 w-7 flex-shrink-0" />
        {!isOnDashboard && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="h-6 text-[11px] px-1.5 gap-0.5"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        <span className="text-xs font-medium text-muted-foreground truncate">Admin</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="h-6 text-[11px] px-1.5 flex-shrink-0"
      >
        <Home className="w-3 h-3 sm:mr-1" />
        <span className="hidden sm:inline">Site</span>
      </Button>
    </header>
  );
}

export function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsPinVerification, setNeedsPinVerification] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinOnlyAuth, setPinOnlyAuth] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("admin_verified");
    const verifiedAt = sessionStorage.getItem("admin_verified_at");
    const adminUserId = sessionStorage.getItem("admin_user_id");
    const storedFingerprint = sessionStorage.getItem("admin_device_fingerprint");
    
    if (verified === "true" && verifiedAt) {
      const verifiedTime = new Date(verifiedAt);
      const hoursSinceVerification = (Date.now() - verifiedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVerification < 24) {
        setPinVerified(true);
        
        if (adminUserId && !user) {
          setPinOnlyAuth(true);
          generateDeviceFingerprint().then(currentFp => {
            if (storedFingerprint && storedFingerprint !== currentFp) {
              sessionStorage.removeItem("admin_verified");
              sessionStorage.removeItem("admin_verified_at");
              sessionStorage.removeItem("admin_user_id");
              sessionStorage.removeItem("admin_session_token");
              sessionStorage.removeItem("admin_device_fingerprint");
              navigate("/admin-portal");
            }
          });
        }
      } else {
        sessionStorage.removeItem("admin_verified");
        sessionStorage.removeItem("admin_verified_at");
        sessionStorage.removeItem("admin_user_id");
        sessionStorage.removeItem("admin_session_token");
        sessionStorage.removeItem("admin_device_fingerprint");
      }
    }
  }, [navigate, user]);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminUserId = sessionStorage.getItem("admin_user_id");
      const pinVerifiedSession = sessionStorage.getItem("admin_verified") === "true";
      
      if (adminUserId && pinVerifiedSession && !user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", adminUserId)
          .eq("role", "admin")
          .single();

        if (!roleData) {
          toast({
            title: "Access Denied",
            description: "Admin privileges have been revoked",
            variant: "destructive",
          });
          sessionStorage.removeItem("admin_verified");
          sessionStorage.removeItem("admin_user_id");
          navigate("/admin-portal");
          return;
        }

        setIsAdmin(true);
        setPinOnlyAuth(true);
        setPinVerified(true);
        setChecking(false);
        return;
      }

      if (!loading && !user) {
        navigate("/admin-portal");
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
        
        if (!pinVerified) {
          setNeedsPinVerification(true);
        }
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user, loading, navigate, toast, pinVerified]);

  const handlePinVerified = () => {
    setPinVerified(true);
    setNeedsPinVerification(false);
  };

  const handlePinCancel = () => {
    navigate("/admin-portal");
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin && !pinOnlyAuth) {
    return null;
  }

  if (needsPinVerification && !pinVerified && user) {
    const userId = user?.id || sessionStorage.getItem("admin_user_id");
    if (!userId) {
      navigate("/admin-portal");
      return null;
    }
    return (
      <AdminPinVerification
        userId={userId}
        onVerified={handlePinVerified}
        onCancel={handlePinCancel}
      />
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-0">
          <AdminHeader navigate={navigate} />
          <main className="admin-main flex-1 overflow-x-hidden overflow-y-auto p-1.5 sm:p-2 md:p-4 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
