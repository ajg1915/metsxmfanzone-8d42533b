import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ImmersiveBackground from "@/components/ImmersiveBackground";
import LiveNotificationBar from "@/components/LiveNotificationBar";
import LiveGameTicker from "@/components/LiveGameTicker";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import HighlightsSection from "@/components/HighlightsSection";
import SpringTraining from "@/components/SpringTraining";
import MetsNewsTracker from "@/components/MetsNewsTracker";
import BlogSection from "@/components/BlogSection";
import HomeLineupCard from "@/components/HomeLineupCard";
import PodcastSection from "@/components/PodcastSection";
import JoinPodcastSection from "@/components/JoinPodcastSection";
import HotStoveGuide from "@/components/HotStoveGuide";
import StoriesSection from "@/components/StoriesSection";


import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import AppInstallSection from "@/components/AppInstallSection";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import NotificationPrompt from "@/components/NotificationPrompt";
import ScrollReveal from "@/components/ScrollReveal";
import WelcomeBackToast from "@/components/WelcomeBackToast";
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
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Welcome back toast for returning users */}
      <WelcomeBackToast />
      
      {/* Immersive animated background */}
      <ImmersiveBackground />
      
      <Helmet>
        <title>MetsXMFanZone - Watch Mets Live Streams, Highlights & Exclusive Coverage</title>
        <meta name="description" content="The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans." />
        <meta name="keywords" content="Mets live streams, New York Mets, Mets highlights, Mets podcast, Mets fan community, MLB streams, Mets games, baseball live stream" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/" />
      </Helmet>
      <Navigation />
      <LiveGameTicker />
      <main className="pt-14 sm:pt-16 relative z-10">
        <Hero />
        <LiveNotificationBar />
        
        <ScrollReveal delay={100}>
          <StoriesSection />
        </ScrollReveal>
        
        <ScrollReveal>
          <LiveNetworks />
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <LiveStreamsSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal delay={100}>
          <HighlightsSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal delay={100}>
          <HomeLineupCard />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal>
          <SpringTraining />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal>
          <MetsNewsTracker />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal direction="left">
          <BlogSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal direction="right" delay={100}>
          <PodcastSection />
        </ScrollReveal>

        <div className="section-divider my-4 sm:my-6" />

        <ScrollReveal delay={100}>
          <JoinPodcastSection />
        </ScrollReveal>

        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal direction="scale">
          <FAQSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal>
          <TestimonialsSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal>
          <AppInstallSection />
        </ScrollReveal>
        
        <div className="section-divider my-4 sm:my-6" />
        
        <ScrollReveal delay={100}>
          <HotStoveGuide />
        </ScrollReveal>
      </main>
      <Footer />
      <InstallPrompt />
      <NotificationPrompt />
      <OnboardingWalkthrough onComplete={() => {}} />
    </div>
  );
};

export default Index;