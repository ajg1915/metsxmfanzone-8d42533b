import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-card to-muted/30 border-t border-border">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl">
        {/* Compact Footer - All Views */}
        <div>
          <div className="flex flex-col items-center gap-2 mb-2">
            <h3 className="font-bold text-primary text-base">MetsXMFanZone.com</h3>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs">
              <Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/feedback" className="text-muted-foreground hover:text-primary transition-colors">Feedback</Link>
            </div>
          </div>
          <div className="border-t border-border pt-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              © 2024 MetsXMFanZone.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
