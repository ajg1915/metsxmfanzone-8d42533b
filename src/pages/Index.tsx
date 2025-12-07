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
import NewsletterSection from "@/components/NewsletterSection";
import FeedbackSection from "@/components/FeedbackSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import AppInstallSection from "@/components/AppInstallSection";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import SectionScrollIndicator from "@/components/SectionScrollIndicator";
import NotificationPrompt from "@/components/NotificationPrompt";
import PageTransition from "@/components/PageTransition";
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
      <PageTransition>
        <main className="pt-12 sm:pt-14">
          <Hero />
          <LiveNotificationBar />
          <section className="stagger-children">
            <LiveNetworks className="py-2 sm:py-3" />
            <LiveStreamsSection />
          </section>
          <SectionScrollIndicator className="py-2" />
          <section className="stagger-children">
            <SpringTraining className="py-1" />
            <SectionScrollIndicator />
            <HomeLineupCard className="py-2 sm:py-3" />
          </section>
          <MetsNewsTracker className="py-1" />
          <SectionScrollIndicator className="py-1" />
          <section className="stagger-children">
            <BlogSection className="py-1" />
            <SectionScrollIndicator className="py-2" />
            <PodcastSection className="py-1" />
          </section>
          <SectionScrollIndicator className="py-1" />
          <FAQSection />
          <SectionScrollIndicator className="py-1" />
          <FeedbackSection />
          <SectionScrollIndicator />
          <AppInstallSection />
          <SectionScrollIndicator className="py-2" />
          <NewsletterSection />
        </main>
      </PageTransition>
      <Footer />
      <InstallPrompt />
      <NotificationPrompt />
      <OnboardingWalkthrough onComplete={() => {}} />
    </div>
  );
};

export default Index;