import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";

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
      className="relative glass-nav border-t border-primary/30 bg-card/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 pb-20 md:pb-5 max-w-7xl">
        <div>
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <h3 className="font-bold text-primary text-sm sm:text-base">MetsXMFanZone.com</h3>
            <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
              <Link to="/install" className="text-foreground/70 hover:text-primary transition-colors">Install App</Link>
              <span className="text-foreground/40">•</span>
              <Link to="/help-center" className="text-foreground/70 hover:text-primary transition-colors">Help Center</Link>
              <span className="text-foreground/40">•</span>
              <Link to="/privacy" className="text-foreground/70 hover:text-primary transition-colors">Privacy</Link>
              <span className="text-foreground/40">•</span>
              <Link to="/terms" className="text-foreground/70 hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>

          {/* Security Trust Badge */}
          <div className="flex items-center justify-center gap-2 py-2.5 my-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-500 uppercase tracking-wide">VPN Secured</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] sm:text-xs font-semibold text-primary uppercase tracking-wide">AES-256 Encrypted</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/60 mb-2">
            Your data is protected with enterprise-grade VPN security and end-to-end AES-256 encryption.
          </p>

          <div className="border-t border-border/40 pt-2 text-center space-y-0.5">
            <p 
              onClick={handleSecretClick}
              className="text-[10px] sm:text-xs text-foreground/50 cursor-pointer select-none hover:text-foreground/70 transition-colors"
              aria-hidden="true"
            >
              © 2025 MetsXMFanZone.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
