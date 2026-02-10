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
    <header className="h-11 border-b flex items-center justify-between px-2 sm:px-3 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <SidebarTrigger className="h-7 w-7 flex-shrink-0" />
        {!isOnDashboard && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="h-7 text-xs px-2 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
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
    // Check if already verified this session (either via PIN-only or traditional auth)
    const verified = sessionStorage.getItem("admin_verified");
    const verifiedAt = sessionStorage.getItem("admin_verified_at");
    const adminUserId = sessionStorage.getItem("admin_user_id");
    const storedFingerprint = sessionStorage.getItem("admin_device_fingerprint");
    
    if (verified === "true" && verifiedAt) {
      // Check if verification is still valid (24 hour max)
      const verifiedTime = new Date(verifiedAt);
      const hoursSinceVerification = (Date.now() - verifiedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVerification < 24) {
        setPinVerified(true);
        
        // If using PIN-only auth (no Supabase user), verify device fingerprint
        if (adminUserId && !user) {
          setPinOnlyAuth(true);
          // Validate device fingerprint matches
          generateDeviceFingerprint().then(currentFp => {
            if (storedFingerprint && storedFingerprint !== currentFp) {
              // Device mismatch - clear session and require re-auth
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
        // Expired, clear it
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
      // Check for PIN-only authentication first
      const adminUserId = sessionStorage.getItem("admin_user_id");
      const pinVerifiedSession = sessionStorage.getItem("admin_verified") === "true";
      
      if (adminUserId && pinVerifiedSession && !user) {
        // PIN-only auth - verify the user is still an admin in database
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

      // Traditional auth flow
      if (!loading && !user) {
        // No user and no PIN auth - redirect to portal
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
        
        // If not already PIN verified, require PIN
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

  // For PIN-only auth, we don't have a Supabase user
  if (!isAdmin && !pinOnlyAuth) {
    return null;
  }

  // Show PIN verification if needed (only for traditional auth flow)
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
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
          <AdminHeader navigate={navigate} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-3 md:p-4 max-w-full
            [&_h1]:text-base [&_h1]:sm:text-lg [&_h1]:md:text-xl
            [&_h2]:text-sm [&_h2]:sm:text-base [&_h2]:md:text-lg
            [&_h3]:text-xs [&_h3]:sm:text-sm [&_h3]:md:text-base
            [&_.container]:px-0 [&_.container]:sm:px-2 [&_.container]:max-w-full [&_.container]:mx-0
            [&_.card]:text-sm [&_.card-header]:p-2 [&_.card-header]:sm:p-3 [&_.card-content]:p-2 [&_.card-content]:sm:p-3
            [&_input]:text-sm [&_input]:h-8
            [&_textarea]:text-sm
            [&_select]:text-sm
            [&_button]:text-xs [&_button]:sm:text-sm
            [&_label]:text-xs
            [&_.badge]:text-xs
            [&_table]:text-xs [&_table]:sm:text-sm
            [&_th]:p-1.5 [&_th]:sm:p-2 [&_th]:text-xs
            [&_td]:p-1.5 [&_td]:sm:p-2
            [&_.max-w-7xl]:max-w-full
            [&_.max-w-6xl]:max-w-full
            [&_.max-w-5xl]:max-w-full
            [&_.text-3xl]:text-base [&_.text-3xl]:sm:text-lg [&_.text-3xl]:md:text-xl
            [&_.text-2xl]:text-sm [&_.text-2xl]:sm:text-base [&_.text-2xl]:md:text-lg
            [&_.px-4]:px-1 [&_.px-4]:sm:px-2 [&_.px-4]:md:px-4
            [&_.px-6]:px-2 [&_.px-6]:sm:px-3 [&_.px-6]:md:px-6
            [&_.py-6]:py-2 [&_.py-6]:sm:py-3 [&_.py-6]:md:py-6
            [&_.gap-4]:gap-2 [&_.gap-4]:sm:gap-3 [&_.gap-4]:md:gap-4
            [&_.gap-6]:gap-2 [&_.gap-6]:sm:gap-3 [&_.gap-6]:md:gap-4
            [&_.space-y-6>*+*]:mt-2 [&_.space-y-6>*+*]:sm:mt-3 [&_.space-y-6>*+*]:md:mt-4
            [&_.pt-6]:pt-2 [&_.pt-6]:sm:pt-3 [&_.pt-6]:md:pt-6
          ">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
