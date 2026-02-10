import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, Shield, LogOut, LayoutDashboard, ArrowLeft, Users, CalendarDays, RefreshCw, Sparkles, Tv, ChevronDown } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";
import liveStreamIcon from "@/assets/live-streaming-icon.png";
import podcastIcon from "@/assets/podcast-icon.png";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({ full_name: null, avatar_url: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tvScheduleOpen, setTvScheduleOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };
  
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
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
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
          
          <div className="hidden md:flex items-center gap-3 text-xs">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <button
              onClick={() => handleProtectedNavigation("/podcast")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Podcast
            </button>
            {user && (
              <button
                onClick={() => navigate("/mets-roster")}
                className="text-foreground hover:text-primary transition-colors"
              >
                Roster
              </button>
            )}
            
            {/* TV Schedule Dropdown - Hover Based */}
            <div className="relative group">
              <button className="text-foreground hover:text-primary transition-colors py-2">
                TV Schedule
              </button>
              <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-background border border-border rounded-lg shadow-lg min-w-[160px] py-1">
                  <button
                    onClick={() => navigate("/broadcast-schedule")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <img src={logo} alt="" className="w-4 h-4 object-contain" />
                    Live Games
                  </button>
                  <button
                    onClick={() => handleProtectedNavigation("/spring-training-live")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <img src={logo} alt="" className="w-4 h-4 object-contain" />
                    Spring Training
                  </button>
                </div>
              </div>
            </div>

            {/* Community Dropdown - Hover Based */}
            <div className="relative group">
              <button className="text-foreground hover:text-primary transition-colors py-2">
                Community
              </button>
              <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-background border border-border rounded-lg shadow-lg min-w-[160px] py-1">
                  <button
                    onClick={() => handleProtectedNavigation("/community")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <img src={logo} alt="" className="w-4 h-4 object-contain" />
                    Fan Community
                  </button>
                  <button
                    onClick={() => handleProtectedNavigation("/events")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <img src={logo} alt="" className="w-4 h-4 object-contain" />
                    Events
                  </button>
                  <button
                    onClick={() => handleProtectedNavigation("/blog")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <img src={logo} alt="" className="w-4 h-4 object-contain" />
                    Blog
                  </button>
                </div>
              </div>
            </div>

            {!user && (
              <NavLink 
                to="/pricing" 
                className="text-foreground hover:text-primary transition-colors"
              >
                Pricing
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
            
            {/* Mobile Login/Register button - only shown when not logged in */}
            {!user && (
              <Button 
                size="sm" 
                className="md:hidden text-[10px] h-7 px-2"
                onClick={() => navigate("/auth")}
              >
                Login / Register
              </Button>
            )}

            {/* Modern Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all">
                  <Menu className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] bg-gradient-to-b from-background to-background/95 backdrop-blur-xl p-0 border-l border-primary/20">
                <SheetHeader className="p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                      <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
                    </div>
                    <div>
                      <SheetTitle className="text-lg font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">MetsXMFanZone</SheetTitle>
                      <SheetDescription className="text-[10px] text-muted-foreground">
                        Your Home for Mets Coverage
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                
                <div className="flex flex-col p-4 gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {/* Main Navigation */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 mb-2">Navigation</p>
                    <NavLink 
                      to="/" 
                      className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <img src={logo} alt="" className="w-4 h-4 object-contain" />
                      </div>
                      <span className="font-medium text-sm">Home</span>
                    </NavLink>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleProtectedNavigation("/podcast");
                      }}
                      className="flex items-center gap-3 w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <img src={podcastIcon} alt="" className="w-4 h-4 object-contain" />
                      </div>
                      <span className="font-medium text-sm">Podcast</span>
                    </button>
                    {user && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/mets-roster");
                        }}
                        className="flex items-center gap-3 w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <img src={logo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="font-medium text-sm">Roster</span>
                      </button>
                    )}
                    {!user && (
                      <NavLink 
                        to="/pricing" 
                        className="flex items-center gap-3 text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <img src={logo} alt="" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="font-medium text-sm">Pricing</span>
                      </NavLink>
                    )}
                  </div>
                  
                  {/* TV Schedule Section */}
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <Collapsible open={tvScheduleOpen} onOpenChange={setTvScheduleOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <img src={logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="font-medium text-sm">TV Schedule</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${tvScheduleOpen ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1 ml-11">
                        <button
                          onClick={() => {
                            setTvScheduleOpen(false);
                            setMobileMenuOpen(false);
                            navigate("/broadcast-schedule");
                          }}
                          className="flex items-center gap-2 w-full text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg text-left text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Live Games
                        </button>
                        <button
                          onClick={() => {
                            setTvScheduleOpen(false);
                            setMobileMenuOpen(false);
                            handleProtectedNavigation("/spring-training-live");
                          }}
                          className="flex items-center gap-2 w-full text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg text-left text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Spring Training
                        </button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Community Section */}
                  <div>
                    <Collapsible open={communityOpen} onOpenChange={setCommunityOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <img src={logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="font-medium text-sm">Community</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1 ml-11">
                        <button
                          onClick={() => {
                            setCommunityOpen(false);
                            setMobileMenuOpen(false);
                            handleProtectedNavigation("/community");
                          }}
                          className="flex items-center gap-2 w-full text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg text-left text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          Fan Community
                        </button>
                        <button
                          onClick={() => {
                            setCommunityOpen(false);
                            setMobileMenuOpen(false);
                            handleProtectedNavigation("/events");
                          }}
                          className="flex items-center gap-2 w-full text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg text-left text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          Events
                        </button>
                        <button
                          onClick={() => {
                            setCommunityOpen(false);
                            setMobileMenuOpen(false);
                            handleProtectedNavigation("/blog");
                          }}
                          className="flex items-center gap-2 w-full text-muted-foreground hover:text-primary transition-all py-2 px-3 rounded-lg text-left text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          Blog
                        </button>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  
                  {/* User Account Section */}
                  <div className="border-t border-border/30 pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                              <AvatarImage src={userProfile.avatar_url || undefined} alt="Profile" />
                              <AvatarFallback className="text-sm bg-primary text-primary-foreground font-bold">
                                {userProfile.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{userProfile.full_name || user.email}</p>
                              <p className="text-[10px] text-muted-foreground">Member</p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            navigate("/dashboard");
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <img src={logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="font-medium text-sm">Dashboard</span>
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => {
                                navigate("/admin/stories");
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <img src={logo} alt="" className="w-4 h-4 object-contain" />
                              </div>
                              <span className="font-medium text-sm">Admin Stories</span>
                            </button>
                            <button 
                              onClick={() => {
                                navigate("/admin");
                                setMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 w-full text-foreground hover:text-primary hover:bg-primary/10 transition-all py-2.5 px-3 rounded-xl text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <img src={logo} alt="" className="w-4 h-4 object-contain" />
                              </div>
                              <span className="font-medium text-sm">Admin Portal</span>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={async () => {
                            await handleAuthClick();
                          }}
                          className="flex items-center gap-3 w-full text-destructive hover:bg-destructive/10 transition-all py-2.5 px-3 rounded-xl text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <img src={logo} alt="" className="w-4 h-4 object-contain" />
                          </div>
                          <span className="font-medium text-sm">Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=login");
                            setMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full h-11 rounded-xl border-primary/30 hover:bg-primary/10"
                        >
                          Login
                        </Button>
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=signup");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
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
