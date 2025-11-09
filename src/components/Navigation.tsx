import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Play, Users, Menu, Shield, User, LogOut, LayoutDashboard, X, Trophy } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleAuthClick = async () => {
    if (user) {
      setMobileMenuOpen(false);
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src={logo} 
              alt="MetsXMFanZone Logo" 
              className="h-10 sm:h-12 w-auto"
            />
            <div className="text-xs sm:text-sm font-semibold">
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
              <Trophy className="w-3 h-3" />
              Live
            </NavLink>
            <NavLink 
              to="/spring-training-live" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Trophy className="w-3 h-3" />
              Spring Training
            </NavLink>
            <NavLink 
              to="/community" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Community
            </NavLink>
            <NavLink 
              to="/blog" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Blog
            </NavLink>
            <NavLink 
              to="/plans" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Plans
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-xs">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[150px] truncate">{user.email}</span>
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
            
            {/* Single mobile menu for all users */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetHeader>
                  <SheetTitle className="text-lg font-bold">MetsXMFanZone.com</SheetTitle>
                  <SheetDescription className="text-sm">
                    Ultimate Destination where the fans go
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <NavLink 
                    to="/" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/live" 
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="w-4 h-4" />
                    Live
                  </NavLink>
                  <NavLink 
                    to="/spring-training-live" 
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="w-4 h-4" />
                    Spring Training
                  </NavLink>
                  <NavLink 
                    to="/community" 
                    className="text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    Community
                  </NavLink>
                  <NavLink 
                    to="/blog" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </NavLink>
                  <NavLink 
                    to="/plans" 
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Plans
                  </NavLink>
                  
                  <div className="border-t border-border pt-4 mt-2">
                    {user ? (
                      <>
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">{user.email}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            navigate("/dashboard");
                            setMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start mb-2"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                        {isAdmin && (
                          <Button 
                            onClick={() => {
                              navigate("/admin");
                              setMobileMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Portal
                          </Button>
                        )}
                        <Button 
                          onClick={async () => {
                            await handleAuthClick();
                          }}
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=login");
                            setMobileMenuOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start mb-2"
                        >
                          Login
                        </Button>
                        <Button 
                          onClick={() => {
                            navigate("/auth?mode=signup");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          Sign Up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
