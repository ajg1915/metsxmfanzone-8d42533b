import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveNetworks from "@/components/LiveNetworks";
import GameHighlights from "@/components/GameHighlights";
import SpringTraining from "@/components/SpringTraining";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <LiveNetworks />
        <GameHighlights />
        <SpringTraining />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
