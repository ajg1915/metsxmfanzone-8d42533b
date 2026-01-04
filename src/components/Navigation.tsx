import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Play, Users, Menu, Shield, User, LogOut, LayoutDashboard, X, Trophy, CalendarDays, ArrowLeft } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({ full_name: null, avatar_url: null });
  
  const isHomePage = location.pathname === "/";
  
  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const checkAdminAndProfile = async () => {
      if (user) {
        // Check admin role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        setIsAdmin(!!roleData);

        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }
      } else {
        setIsAdmin(false);
        setUserProfile({ full_name: null, avatar_url: null });
      }
    };

    checkAdminAndProfile();
  }, [user]);

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      navigate("/auth");
    } else if (path === "/live" && (tier === "free" || !tier)) {
      setShowUpgradePrompt(true);
    } else {
      navigate(path);
    }
  };

  const handleAuthClick = async () => {
    if (user) {
      setMobileMenuOpen(false);
      await signOut();
      navigate("/logout");
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <UpgradePrompt open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src={logo} 
                alt="MetsXMFanZone Logo" 
                className="h-8 w-auto"
              />
              <div className="text-xs font-semibold">
                <span className="text-foreground">MetsXMFanZone</span>
                <span className="text-primary">.com</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <button
              onClick={() => handleProtectedNavigation("/spring-training-live")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Spring Training
            </button>
            <button
              onClick={() => handleProtectedNavigation("/community")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Community
            </button>
            <button
              onClick={() => handleProtectedNavigation("/blog")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Blog
            </button>
            <button
              onClick={() => handleProtectedNavigation("/podcast")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Podcast
            </button>
            <button
              onClick={() => handleProtectedNavigation("/events")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Events
            </button>
            {!user && (
              <NavLink 
                to="/plans" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Plans
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-1.5 text-xs h-8 px-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={userProfile.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="text-[10px]">
                          {userProfile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate">{userProfile.full_name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Portal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAuthClick}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex text-xs h-8 px-3"
                  onClick={() => navigate("/auth?mode=login")}
                >
                  Login
                </Button>
                <Button 
                  size="sm" 
                  className="hidden md:flex text-xs h-8 px-3"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            {/* Single mobile menu for all users */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 touch-target">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-0 safe-area-bottom">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-lg font-bold text-primary">MetsXMFanZone</SheetTitle>
                  <SheetDescription className="text-xs">
                    Your Home for Mets Coverage
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col p-4 stagger-children">
                  <NavLink 
                    to="/" 
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg touch-target"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="w-4 h-4" />
                    Home
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProtectedNavigation("/spring-training-live");
                    }}
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg text-left touch-target"
                  >
                    <Play className="w-4 h-4" />
                    Spring Training
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProtectedNavigation("/community");
                    }}
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg text-left touch-target"
                  >
                    <Users className="w-4 h-4" />
                    Community
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProtectedNavigation("/blog");
                    }}
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg text-left touch-target"
                  >
                    <Menu className="w-4 h-4" />
                    Blog
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProtectedNavigation("/podcast");
                    }}
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg text-left touch-target"
                  >
                    <Play className="w-4 h-4" />
                    Podcast
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleProtectedNavigation("/events");
                    }}
                    className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg text-left touch-target"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Events
                  </button>
                  {!user && (
                    <NavLink 
                      to="/plans" 
                      className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-3 px-3 rounded-lg touch-target"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Plans
                    </NavLink>
                  )}
                  
                  <div className="border-t border-border pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={userProfile.avatar_url || undefined} alt="Profile" />
                              <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                                {userProfile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{userProfile.full_name || user.email}</p>
                              <p className="text-xs text-muted-foreground">Logged in</p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            navigate("/dashboard");
                            setMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-11"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                        {isAdmin && (
                          <Button 
                            onClick={() => {
                              navigate("/admin");
                              setMobileMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Portal
                          </Button>
                        )}
                        <Button 
                          onClick={async () => {
                            await handleAuthClick();
                          }}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=login");
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full h-11"
                        >
                          Login
                        </Button>
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=signup");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full h-11"
                        >
                          Sign Up Free
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navigation;
