import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Play } from "lucide-react";

interface TVGuideChannelProps {
  channelName: string;
  channelLogo?: string;
  isLive: boolean;
  currentShow?: string;
  onWatch: () => void;
}

export function TVGuideChannel({ 
  channelName, 
  channelLogo, 
  isLive, 
  currentShow,
  onWatch 
}: TVGuideChannelProps) {
  return (
    <Card className="border-2 border-primary/20 hover:border-primary transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {channelLogo && (
              <img 
                src={channelLogo} 
                alt={channelName}
                className="w-12 h-12 object-contain rounded"
              />
            )}
            <CardTitle className="text-lg">{channelName}</CardTitle>
          </div>
          {isLive && (
            <Badge className="bg-red-600 text-white">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentShow && (
            <p className="text-sm text-muted-foreground">
              Now: <span className="text-foreground font-medium">{currentShow}</span>
            </p>
          )}
          <Button 
            className="w-full gap-2" 
            onClick={onWatch}
            variant={isLive ? "default" : "outline"}
          >
            <Play className="w-4 h-4" />
            {isLive ? "Watch Live" : "View Channel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
