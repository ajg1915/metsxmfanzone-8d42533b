import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const Footer = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Triple-click to access admin portal
    if (newCount >= 3) {
      setClickCount(0);
      navigate("/admin-portal");
    }
    
    // Reset after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
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
              <Link to="/help-center" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/feedback" className="text-muted-foreground hover:text-primary transition-colors">Feedback</Link>
            </div>
          </div>
          <div className="border-t border-border/30 pt-2 text-center">
            <p 
              onClick={handleSecretClick}
              className="text-[10px] text-muted-foreground cursor-default select-none"
              aria-hidden="true"
            >
              © 2024 MetsXMFanZone.com. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
