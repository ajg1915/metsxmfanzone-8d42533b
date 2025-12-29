import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveNotificationBar from "@/components/LiveNotificationBar";
import LiveGameTicker from "@/components/LiveGameTicker";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import SpringTraining from "@/components/SpringTraining";
import MetsNewsTracker from "@/components/MetsNewsTracker";
import BlogSection from "@/components/BlogSection";
import HomeLineupCard from "@/components/HomeLineupCard";
import PodcastSection from "@/components/PodcastSection";
import HotStoveGuide from "@/components/HotStoveGuide";
import FeedbackSection from "@/components/FeedbackSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import AppInstallSection from "@/components/AppInstallSection";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import NotificationPrompt from "@/components/NotificationPrompt";
import ScrollReveal from "@/components/ScrollReveal";
import { useEffect } from "react";
import { setupNotificationListeners } from "@/utils/notificationTriggers";
import { useAutoLineupFetch } from "@/hooks/useAutoLineupFetch";

const Index = () => {
  // Auto-fetch Mets lineup on game days (every 30 minutes)
  useAutoLineupFetch();
  
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>MetsXMFanZone - Watch Mets Live Streams, Highlights & Exclusive Coverage</title>
        <meta name="description" content="The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans." />
        <meta name="keywords" content="Mets live streams, New York Mets, Mets highlights, Mets podcast, Mets fan community, MLB streams, Mets games, baseball live stream" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/" />
      </Helmet>
      <Navigation />
      <LiveGameTicker />
      <main className="pt-12 sm:pt-14">
        <Hero />
        <LiveNotificationBar />
        
        <ScrollReveal>
          <LiveNetworks className="py-2 sm:py-3" />
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <LiveStreamsSection />
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal delay={100}>
          <HomeLineupCard className="py-4 sm:py-6" />
        </ScrollReveal>
        
        <ScrollReveal>
          <SpringTraining className="py-4 sm:py-6" />
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal>
          <MetsNewsTracker className="py-4 sm:py-px" />
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal direction="left">
          <BlogSection className="py-4 sm:py-6" />
        </ScrollReveal>
        
        <ScrollReveal direction="right" delay={100}>
          <PodcastSection className="py-4 sm:py-6" />
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal direction="scale">
          <FAQSection />
        </ScrollReveal>
        
        <ScrollReveal>
          <FeedbackSection />
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal>
          <AppInstallSection />
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <HotStoveGuide />
        </ScrollReveal>
      </main>
      <Footer />
      <InstallPrompt />
      <NotificationPrompt />
      <OnboardingWalkthrough onComplete={() => {}} />
    </div>;
};
export default Index;