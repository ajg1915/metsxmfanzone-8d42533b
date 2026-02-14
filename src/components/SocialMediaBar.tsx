import { MessageSquarePlus, Share2, Tv, PenLine, BookOpen, Mic } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

type NavItem = {
  label: string;
  path: string;
  isAnchor?: boolean;
  requiresMembership: boolean;
};

const navItems: NavItem[] = [
  { label: "Home", path: "/", requiresMembership: false },
  { label: "Watch Live", path: "/metsxmfanzone-tv", requiresMembership: true },
  { label: "Post", path: "/community", requiresMembership: false },
  { label: "Blog", path: "/blog", requiresMembership: true },
  { label: "Podcast", path: "/podcast", requiresMembership: true },
];

const SocialMediaBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const handleClick = (item: typeof navItems[0]) => {
    if (item.requiresMembership && (!user || !isPremium)) {
      toast.error("Members only! Please subscribe to access this feature.");
      navigate("/plans");
      return;
    }

    if (item.isAnchor && location.pathname === "/") {
      const el = document.getElementById("social");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(item.path.replace("/#", "/"));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-md border-t border-border/40">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors"
          >
            {item.label === "Home" ? (
              <img src={metsLogo} alt={item.label} className="h-5 w-5 object-contain" />
            ) : item.label === "Social" ? (
              <Share2 className="h-5 w-5" />
            ) : item.label === "Watch Live" ? (
              <Tv className="h-5 w-5" />
            ) : item.label === "Post" ? (
              <MessageSquarePlus className="h-5 w-5" />
            ) : item.label === "Blog" ? (
              <BookOpen className="h-5 w-5" />
            ) : item.label === "Podcast" ? (
              <Mic className="h-5 w-5" />
            ) : (
              <img src={metsLogo} alt={item.label} className="h-5 w-5 object-contain" />
            )}
            <span className="text-[9px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaBar;
