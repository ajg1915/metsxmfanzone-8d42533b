const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-card to-muted/30 border-t border-border">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Mobile Footer - Simple */}
        <div className="block lg:hidden">
          <div className="flex flex-col items-center gap-4 mb-4">
            <h3 className="font-bold text-primary text-base">MetsXMFanZone</h3>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
              <a href="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a>
              <span className="text-muted-foreground">•</span>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-muted-foreground">•</span>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-muted-foreground">•</span>
              <a href="/feedback" className="text-muted-foreground hover:text-primary transition-colors">Feedback</a>
            </div>
          </div>
          <div className="border-t border-border pt-4 text-center">
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
              <h3 className="font-bold text-primary mb-3 text-xl">MetsXMFanZone</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The ultimate destination for all exclusive Mets content. Join thousands of passionate fans.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors inline-block">Home</a></li>
                <li><a href="/live" className="text-muted-foreground hover:text-primary transition-colors inline-block">Live Streams</a></li>
                <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors inline-block">Blog</a></li>
                <li><a href="/podcast" className="text-muted-foreground hover:text-primary transition-colors inline-block">Podcasts</a></li>
                <li><a href="/community" className="text-muted-foreground hover:text-primary transition-colors inline-block">Community</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/help-center" className="text-muted-foreground hover:text-primary transition-colors inline-block">Help Center</a></li>
                <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors inline-block">Contact Us</a></li>
                <li><a href="/faqs" className="text-muted-foreground hover:text-primary transition-colors inline-block">FAQs</a></li>
                <li><a href="/feedback" className="text-muted-foreground hover:text-primary transition-colors inline-block">Feedback</a></li>
                <li><a href="/plans" className="text-muted-foreground hover:text-primary transition-colors inline-block">Plans & Pricing</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-base">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors inline-block">Privacy Policy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors inline-block">Terms of Service</a></li>
                <li><a href="/business-partner" className="text-muted-foreground hover:text-primary transition-colors inline-block">Business Partners</a></li>
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
