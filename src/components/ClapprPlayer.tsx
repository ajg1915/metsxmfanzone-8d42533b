interface StreamIframePlayerProps {
  pageTitle?: string;
  pageDescription?: string;
}

const STREAM_URL = "https://video1.getstreamhosting.com:2000/VideoPlayer/resyweugpd?autoplay=1";

export function ClapprPlayer({
  pageTitle = "Live Stream",
  pageDescription = "Watch live content",
}: StreamIframePlayerProps) {
  return (
    <div className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{pageTitle}</h3>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="relative overflow-hidden w-full rounded-lg" style={{ paddingTop: "56.25%" }}>
          <iframe
            width="560"
            height="300"
            referrerPolicy="origin"
            src={STREAM_URL}
            className="absolute top-0 left-0 bottom-0 right-0 w-full h-full"
            scrolling="no"
            frameBorder="0"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default ClapprPlayer;
