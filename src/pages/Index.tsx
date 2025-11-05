import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveNotificationBar from "@/components/LiveNotificationBar";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import SpringTraining from "@/components/SpringTraining";
import BlogSection from "@/components/BlogSection";
import NewsletterSection from "@/components/NewsletterSection";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-14 sm:pt-16">
        <Hero />
        <LiveNotificationBar />
        <LiveNetworks />
        <LiveStreamsSection />
        <SpringTraining />
        <BlogSection />
        <FeedbackSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
