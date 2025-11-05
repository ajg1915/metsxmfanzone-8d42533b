import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import GameHighlights from "@/components/GameHighlights";
import SpringTraining from "@/components/SpringTraining";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-14 sm:pt-16">
        <Hero />
        <LiveNetworks />
        <LiveStreamsSection />
        <GameHighlights />
        <SpringTraining />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
