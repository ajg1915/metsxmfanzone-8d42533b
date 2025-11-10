import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-card to-muted/30 border-t border-border">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl">
        {/* Mobile Footer - Simple */}
        <div className="block lg:hidden">
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

        {/* Desktop Footer - Full */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <h3 className="font-bold text-primary mb-3 text-xl">MetsXMFanZone.com</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The ultimate destination for all exclusive Mets content. Join thousands of passionate fans.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors inline-block">Home</Link></li>
                <li><Link to="/live" className="text-muted-foreground hover:text-primary transition-colors inline-block">Live Streams</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors inline-block">Blog</Link></li>
                <li><Link to="/podcast" className="text-muted-foreground hover:text-primary transition-colors inline-block">Podcasts</Link></li>
                <li><Link to="/community" className="text-muted-foreground hover:text-primary transition-colors inline-block">Community</Link></li>
                <li><Link to="/merch" className="text-muted-foreground hover:text-primary transition-colors inline-block">Merch Shop</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors inline-block">Help Center</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors inline-block">Contact Us</Link></li>
                <li><Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors inline-block">FAQs</Link></li>
                <li><Link to="/feedback" className="text-muted-foreground hover:text-primary transition-colors inline-block">Feedback</Link></li>
                <li><Link to="/plans" className="text-muted-foreground hover:text-primary transition-colors inline-block">Plans & Pricing</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors inline-block">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors inline-block">Terms of Service</Link></li>
                <li><Link to="/business-partner" className="text-muted-foreground hover:text-primary transition-colors inline-block">Business Partners</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-6 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © 2024 MetsXMFanZone.com. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for Mets fans everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
