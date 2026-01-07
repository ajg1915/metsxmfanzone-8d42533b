import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";

interface Orb {
  id: number;
  size: number;
  x: string;
  y: string;
  color: "blue" | "orange";
  delay: number;
  duration: number;
}

const ImmersiveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms for different layers
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Generate random orbs
  const orbs = useMemo<Orb[]>(() => [
    { id: 1, size: 400, x: "10%", y: "20%", color: "blue", delay: 0, duration: 20 },
    { id: 2, size: 300, x: "70%", y: "10%", color: "orange", delay: 2, duration: 25 },
    { id: 3, size: 500, x: "80%", y: "60%", color: "blue", delay: 1, duration: 22 },
    { id: 4, size: 250, x: "20%", y: "70%", color: "orange", delay: 3, duration: 18 },
    { id: 5, size: 350, x: "50%", y: "40%", color: "blue", delay: 1.5, duration: 24 },
    { id: 6, size: 200, x: "90%", y: "30%", color: "orange", delay: 2.5, duration: 20 },
    { id: 7, size: 450, x: "5%", y: "90%", color: "blue", delay: 0.5, duration: 26 },
    { id: 8, size: 280, x: "60%", y: "85%", color: "orange", delay: 1, duration: 21 },
  ], []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(220 80% 50% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(220 80% 50% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Animated orbs - Layer 1 (slow) */}
      <motion.div style={{ y: layer1Y }} className="absolute inset-0">
        {orbs.slice(0, 3).map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full ${orb.color === "blue" ? "orb-blue" : "orb-orange"}`}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              filter: "blur(80px)",
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      
      {/* Animated orbs - Layer 2 (medium) */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {orbs.slice(3, 6).map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full ${orb.color === "blue" ? "orb-blue" : "orb-orange"}`}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              filter: "blur(100px)",
              opacity: 0.4,
            }}
            animate={{
              x: [-20, 40, -10, -20],
              y: [20, -30, 40, 20],
              scale: [0.9, 1.05, 1, 0.9],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      
      {/* Animated orbs - Layer 3 (fast, subtle) */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        {orbs.slice(6).map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full ${orb.color === "blue" ? "orb-blue" : "orb-orange"}`}
            style={{
              width: orb.size * 0.6,
              height: orb.size * 0.6,
              left: orb.x,
              top: orb.y,
              filter: "blur(60px)",
              opacity: 0.3,
            }}
            animate={{
              x: [10, -30, 20, 10],
              y: [-20, 30, -10, -20],
            }}
            transition={{
              duration: orb.duration * 0.7,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      
      {/* Radial gradient overlays for depth */}
      <div 
        className="absolute top-0 left-0 w-full h-[50vh]"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 20% 0%, hsl(220 80% 25% / 0.3), transparent)",
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-full h-[50vh]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 80% 100%, hsl(24 100% 50% / 0.1), transparent)",
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(220 70% 3% / 0.5) 100%)",
        }}
      />
    </div>
  );
};

export default ImmersiveBackground;
