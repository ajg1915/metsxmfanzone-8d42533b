import { MessageSquarePlus, Share2, Youtube, BookOpen, Mic2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const navItems = [
  { icon: MessageSquarePlus, label: "Post", path: "/community", requiresMembership: false },
  { icon: Share2, label: "Social", path: "/#social", isAnchor: true, requiresMembership: true },
  { icon: Youtube, label: "Watch Live", path: "/metsxmfanzone-tv", requiresMembership: true },
  { icon: BookOpen, label: "Blog", path: "/blog", requiresMembership: true },
  { icon: Mic2, label: "Podcast", path: "/podcast", requiresMembership: true },
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
            <item.icon className="h-5 w-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaBar;
