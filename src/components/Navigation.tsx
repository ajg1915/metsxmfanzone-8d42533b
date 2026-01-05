import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  X, 
  Home,
  Radio,
  Users,
  BookOpen,
  Headphones,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
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
  const [scrolled, setScrolled] = useState(false);
  
  const isHomePage = location.pathname === "/";

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
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
        const [roleRes, profileRes] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single(),
          supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()
        ]);

        setIsAdmin(!!roleRes.data);
        if (profileRes.data) {
          setUserProfile(profileRes.data);
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
    setMobileMenuOpen(false);
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

  const navLinks = [
    { path: "/", label: "Home", icon: Home, protected: false },
    { path: "/spring-training-live", label: "Spring Training", icon: Radio, protected: true },
    { path: "/community", label: "Community", icon: Users, protected: true },
    { path: "/blog", label: "Blog", icon: BookOpen, protected: true },
    { path: "/podcast", label: "Podcast", icon: Headphones, protected: true },
    { path: "/events", label: "Events", icon: Calendar, protected: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <UpgradePrompt open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
      
      {/* Modern Glass Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled 
            ? "bg-background/85 backdrop-blur-2xl border-b border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)]" 
            : "bg-background/60 backdrop-blur-xl border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Left Section: Back Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {!isHomePage && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-muted/60 hover:bg-muted transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 text-foreground" />
                </button>
              )}
              
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group" 
                onClick={() => navigate("/")}
              >
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <img 
                    src={logo} 
                    alt="MetsXMFanZone Logo" 
                    className="relative h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    MetsXMFanZone
                  </span>
                  <span className="text-[10px] text-primary font-medium">.com</span>
                </div>
              </div>
            </div>
            
            {/* Center Section: Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-0.5 p-1 bg-muted/40 rounded-full backdrop-blur-sm">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => link.protected ? handleProtectedNavigation(link.path) : navigate(link.path)}
                    className={`relative px-3 xl:px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${
                      isActive(link.path)
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {/* Active Background Pill */}
                    {isActive(link.path) && (
                      <span className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25 animate-in fade-in zoom-in-95 duration-200" />
                    )}
                    {/* Hover Background */}
                    <span className="absolute inset-0 bg-muted/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                      style={{ display: isActive(link.path) ? 'none' : 'block' }} 
                    />
                    <span className="relative z-10 flex items-center gap-1.5">
                      <link.icon className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">{link.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section: Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-all duration-300 group">
                      <Avatar className="h-7 w-7 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage src={userProfile.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                          {userProfile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground max-w-[80px] truncate">
                        {userProfile.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-all group-data-[state=open]:rotate-180 duration-200" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    sideOffset={8}
                    className="w-56 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl p-1"
                  >
                    <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                      <p className="text-sm font-semibold text-foreground">{userProfile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem 
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer gap-2.5 py-2.5 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      Dashboard
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => navigate("/admin")}
                        className="cursor-pointer gap-2.5 py-2.5 rounded-lg transition-colors"
                      >
                        <Shield className="h-4 w-4 text-primary" />
                        Admin Portal
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem 
                      onClick={handleAuthClick}
                      className="cursor-pointer gap-2.5 py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/auth?mode=login")}
                    className="rounded-full text-sm font-medium h-9 px-4 hover:bg-muted/60"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate("/plans")}
                    className="rounded-full h-9 px-4 bg-gradient-to-r from-primary via-primary to-primary/90 hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Get Started
                  </Button>
                </div>
              )}
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full bg-muted/50 hover:bg-muted border border-border/40 transition-all duration-300 hover:scale-105 active:scale-95">
                    <Menu className="h-5 w-5 text-foreground" />
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-full sm:w-[340px] bg-background/98 backdrop-blur-2xl border-l border-border/30 p-0 overflow-hidden"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/30">
                      <div className="flex items-center gap-2" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
                        <img src={logo} alt="Logo" className="h-8 w-auto" />
                        <div className="flex flex-col leading-none">
                          <span className="text-sm font-bold text-foreground">MetsXMFanZone</span>
                          <span className="text-[10px] text-primary">.com</span>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <button className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </SheetClose>
                    </div>

                    {/* Mobile User Card */}
                    {user && (
                      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-muted/40 to-muted/20">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/30 shadow-lg">
                            <AvatarImage src={userProfile.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                              {userProfile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{userProfile.full_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                      <div className="space-y-1">
                        {navLinks.map((link, index) => (
                          <button
                            key={link.path}
                            onClick={() => link.protected ? handleProtectedNavigation(link.path) : (navigate(link.path), setMobileMenuOpen(false))}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                              isActive(link.path)
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "text-foreground hover:bg-muted/60"
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${
                              isActive(link.path) 
                                ? "bg-primary-foreground/20" 
                                : "bg-muted/60"
                            }`}>
                              <link.icon className="h-4.5 w-4.5" />
                            </div>
                            <span className="font-medium">{link.label}</span>
                          </button>
                        ))}
                        
                        {!user && (
                          <NavLink 
                            to="/plans" 
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted/60 transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted/60">
                              <Sparkles className="h-4.5 w-4.5" />
                            </div>
                            <span className="font-medium">Plans</span>
                          </NavLink>
                        )}
                      </div>

                      {/* Mobile User Actions */}
                      {user && (
                        <>
                          <div className="my-4 h-px bg-border/40" />
                          <div className="space-y-1">
                            <button
                              onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted/60 transition-all"
                            >
                              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted/60">
                                <LayoutDashboard className="h-4.5 w-4.5" />
                              </div>
                              <span className="font-medium">Dashboard</span>
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-foreground hover:bg-muted/60 transition-all"
                              >
                                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted/60">
                                  <Shield className="h-4.5 w-4.5" />
                                </div>
                                <span className="font-medium">Admin Portal</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile Footer */}
                    <div className="p-4 border-t border-border/30 bg-muted/20 safe-area-bottom">
                      {user ? (
                        <Button 
                          variant="outline" 
                          onClick={handleAuthClick}
                          className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            variant="outline"
                            onClick={() => { navigate("/auth?mode=login"); setMobileMenuOpen(false); }}
                            className="w-full h-12 rounded-xl border-border/50"
                          >
                            Sign In
                          </Button>
                          <Button 
                            onClick={() => { navigate("/plans"); setMobileMenuOpen(false); }}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/30"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get Started Free
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
      
      {/* Spacer */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default Navigation;
