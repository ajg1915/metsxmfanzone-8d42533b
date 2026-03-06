const ImmersiveBackground = () => {
  // Static background only — no blur filters, no animated orbs, no GPU-heavy effects
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
    </div>
  );
};

export default ImmersiveBackground;
