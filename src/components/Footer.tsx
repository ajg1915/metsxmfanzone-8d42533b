import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// App version - displayed in footer
const APP_VERSION = "1.0.0";

const Footer = () => {
  const navigate = useNavigate();

  const handleSecretClick = () => {
    navigate("/admin-portal");
  };

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative glass-nav border-t border-border/30"
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl">
        <div>
          <div className="flex flex-col items-center gap-2 mb-2">
            <h3 className="font-bold text-primary text-base">MetsXMFanZone.com</h3>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs">
              <Link to="/install" className="text-muted-foreground hover:text-primary transition-colors">Install App</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="border-t border-border/30 pt-2 text-center space-y-1">
            <p 
              onClick={handleSecretClick}
              className="text-[10px] text-muted-foreground cursor-pointer select-none hover:text-foreground/70 transition-colors"
              aria-hidden="true"
            >
              © 2025 MetsXMFanZone.com. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Version {APP_VERSION}
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;