const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-6 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-4 sm:mb-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-primary mb-2 sm:mb-4 text-base sm:text-lg">MetsXMFanZone</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Welcome the the<br />
              fan ultimate destination for all exclusive Mets content.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              <li><a href="/live" className="text-muted-foreground hover:text-primary transition-colors">Live</a></li>
              <li><a href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
              <li><a href="/highlights" className="text-muted-foreground hover:text-primary transition-colors">Highlights</a></li>
              <li><a href="/podcast" className="text-muted-foreground hover:text-primary transition-colors">Podcasts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="/faqs" className="text-muted-foreground hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="/feedback" className="text-muted-foreground hover:text-primary transition-colors">Feedback</a></li>
              <li><a href="https://clwghkbtkofacsjeyrtk.supabase.co/functions/v1/sitemap" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
              <li><a href="/business-partner" className="text-muted-foreground hover:text-primary transition-colors">Business Partner</a></li>
              <li><a href="/auth" className="text-muted-foreground hover:text-primary transition-colors">Admin Login</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2024 MetsXMFanZone.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
