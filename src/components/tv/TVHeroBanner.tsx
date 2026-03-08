import { Play, Radio, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ClapprPlayer from "@/components/ClapprPlayer";

interface TVHeroBannerProps {
  title: string;
  description: string;
  thumbnail: string;
  streamUrl: string;
  isLive: boolean;
}

export function TVHeroBanner({ title, description, thumbnail, streamUrl, isLive }: TVHeroBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full aspect-video max-h-[320px] overflow-hidden">
      {/* Background image */}
      <img
        src={thumbnail}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlays — Amazon style: heavy bottom + left fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,6%)] via-[hsl(220,20%,6%)]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,6%)] via-transparent to-[hsl(220,20%,6%)]/30" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12">
        {/* LIVE badge */}
        {isLive && (
          <Badge className="w-fit mb-2 bg-red-600 text-white border-0 text-[10px] px-2 py-0.5 gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE NOW
          </Badge>
        )}

        <h1 className="text-xl font-bold text-white leading-tight mb-1 max-w-[60%]">
          {title}
        </h1>

        {description && (
          <p className="text-xs text-white/60 max-w-[50%] line-clamp-2 mb-3">
            {description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/metsxmfanzone")}
            className="h-8 px-4 text-xs font-semibold gap-1.5 bg-white text-black hover:bg-white/90 rounded-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Play
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-3 text-xs font-medium gap-1.5 bg-white/10 text-white hover:bg-white/20 rounded-sm border-0"
          >
            <Info className="w-3.5 h-3.5" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
