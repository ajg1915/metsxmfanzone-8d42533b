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
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5 max-w-7xl">
        <div>
          <div className="flex flex-col items-center gap-1 mb-1">
            <h3 className="font-bold text-primary text-[10px] sm:text-xs">MetsXMFanZone.com</h3>
            <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 text-[8px] sm:text-[10px]">
              <Link to="/install" className="text-muted-foreground hover:text-primary transition-colors">Install App</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
          <div className="border-t border-border/30 pt-1 text-center space-y-0.5">
            <p 
              onClick={handleSecretClick}
              className="text-[8px] sm:text-[9px] text-muted-foreground cursor-pointer select-none hover:text-foreground/70 transition-colors"
              aria-hidden="true"
            >
              © 2025 MetsXMFanZone.com. All rights reserved.
            </p>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground/60">
              v{APP_VERSION}
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;