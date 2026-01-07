const ImmersiveBackground = () => {
  return (
    <div 
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
      
      {/* Static orbs using CSS animations - much lighter than framer-motion */}
      <div className="absolute inset-0">
        <div 
          className="absolute rounded-full animate-orb-slow"
          style={{
            width: 400,
            height: 400,
            left: "10%",
            top: "20%",
            background: "radial-gradient(circle, hsl(220 80% 50% / 0.15), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div 
          className="absolute rounded-full animate-orb-medium"
          style={{
            width: 300,
            height: 300,
            left: "70%",
            top: "10%",
            background: "radial-gradient(circle, hsl(24 100% 50% / 0.12), transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div 
          className="absolute rounded-full animate-orb-slow"
          style={{
            width: 350,
            height: 350,
            left: "80%",
            top: "60%",
            background: "radial-gradient(circle, hsl(220 80% 50% / 0.1), transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "-5s",
          }}
        />
        <div 
          className="absolute rounded-full animate-orb-medium"
          style={{
            width: 250,
            height: 250,
            left: "20%",
            top: "70%",
            background: "radial-gradient(circle, hsl(24 100% 50% / 0.1), transparent 70%)",
            filter: "blur(60px)",
            animationDelay: "-8s",
          }}
        />
      </div>
      
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
