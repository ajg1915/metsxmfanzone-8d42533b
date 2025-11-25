import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  children: React.ReactNode;
}

export const PullToRefresh = ({ children }: PullToRefreshProps) => {
  const handleRefresh = async () => {
    window.location.reload();
  };

  const { isPulling, pullDistance, threshold } = usePullToRefresh(handleRefresh);

  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(progress * 2, 1);
  const rotation = progress * 360;

  return (
    <>
      {/* Pull to refresh indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{
          transform: `translateY(${isPulling ? pullDistance - 40 : -40}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div
          className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg"
          style={{
            opacity,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <RefreshCw className="w-5 h-5" />
        </div>
      </div>

      {/* Content */}
      {children}
    </>
  );
};
