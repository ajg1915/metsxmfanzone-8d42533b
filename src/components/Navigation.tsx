import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Play, Users, Trophy, VideoIcon, Menu } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-foreground">MetsXMFanZone</span>
              <span className="text-primary">.com</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
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
              <Play className="w-4 h-4" />
              Live
            </NavLink>
            <NavLink 
              to="/community" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Community
            </NavLink>
            <NavLink 
              to="/highlights" 
              className="text-foreground hover:text-primary transition-colors"
            >
              Highlights
            </NavLink>
            <NavLink 
              to="/replays" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <VideoIcon className="w-4 h-4" />
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
            <Button size="lg" className="hidden md:flex">
              Sign Up
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
