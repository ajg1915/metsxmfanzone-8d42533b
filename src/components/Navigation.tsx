import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Play, Users, Trophy, VideoIcon, Menu, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold">
              <span className="text-foreground">MetsXMFanZone</span>
              <span className="text-primary">.com</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink 
              to="/live" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Live
            </NavLink>
            <NavLink 
              to="/community" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Community
            </NavLink>
            <NavLink 
              to="/replays" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <VideoIcon className="w-3 h-3" />
              Replays
            </NavLink>
            <NavLink 
              to="/plans" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Plans
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button 
                onClick={() => navigate("/admin")} 
                variant="outline" 
                size="sm"
                className="hidden md:flex text-xs"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Button>
            )}
            {user ? (
              <Button size="sm" className="hidden md:flex text-xs" onClick={handleAuthClick}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex text-xs"
                  onClick={() => navigate("/auth?mode=login")}
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  className="hidden md:flex text-xs"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleAuthClick}>
              {user ? "Sign Out" : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
