import StoriesSection from "./StoriesSection";

interface LiveNetworksProps {
  className?: string;
}

const LiveNetworks = ({ className }: LiveNetworksProps) => {
  return (
    <div className={className}>
      <StoriesSection />
    </div>
  );
};

export default LiveNetworks;