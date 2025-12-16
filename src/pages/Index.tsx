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
import SpotlightTour from "@/components/SpotlightTour";
import NotificationPrompt from "@/components/NotificationPrompt";
import ScrollReveal from "@/components/ScrollReveal";
import { useEffect } from "react";
import { setupNotificationListeners } from "@/utils/notificationTriggers";

const Index = () => {
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MetsXMFanZone - Watch Mets Live Streams, Highlights & Exclusive Coverage</title>
        <meta name="description" content="The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans." />
        <meta name="keywords" content="Mets live streams, New York Mets, Mets highlights, Mets podcast, Mets fan community, MLB streams, Mets games, baseball live stream" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/" />
      </Helmet>
      <Navigation />
      <LiveGameTicker />
      <main className="pt-12 sm:pt-14">
        <section id="hero-section">
          <Hero />
        </section>
        <LiveNotificationBar />
        
        <ScrollReveal>
          <section id="live-networks">
            <LiveNetworks className="py-2 sm:py-3" />
          </section>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <section id="live-streams">
            <LiveStreamsSection />
          </section>
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal delay={100}>
          <section id="lineup-card">
            <HomeLineupCard className="py-4 sm:py-6" />
          </section>
        </ScrollReveal>
        
        <ScrollReveal>
          <section id="spring-training">
            <SpringTraining className="py-4 sm:py-6" />
          </section>
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal>
          <section id="news-tracker">
            <MetsNewsTracker className="py-4 sm:py-px" />
          </section>
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal direction="left">
          <section id="blog-section">
            <BlogSection className="py-4 sm:py-6" />
          </section>
        </ScrollReveal>
        
        <ScrollReveal direction="right" delay={100}>
          <section id="podcast-section">
            <PodcastSection className="py-4 sm:py-6" />
          </section>
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal direction="scale">
          <section id="faq-section">
            <FAQSection />
          </section>
        </ScrollReveal>
        
        <ScrollReveal>
          <section id="feedback-section">
            <FeedbackSection />
          </section>
        </ScrollReveal>
        
        <div className="section-divider my-6 sm:my-8" />
        
        <ScrollReveal>
          <section id="app-install">
            <AppInstallSection />
          </section>
        </ScrollReveal>
        
        <ScrollReveal delay={100}>
          <section id="hot-stove">
            <HotStoveGuide />
          </section>
        </ScrollReveal>
      </main>
      <Footer />
      <InstallPrompt />
      <NotificationPrompt />
      <SpotlightTour onComplete={() => {}} />
    </div>
  );
};

export default Index;