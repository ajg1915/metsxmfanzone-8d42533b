import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ImmersiveBackground from "@/components/ImmersiveBackground";
import LiveNotificationBar from "@/components/LiveNotificationBar";
import LiveGameTicker from "@/components/LiveGameTicker";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import HighlightsSection from "@/components/HighlightsSection";
import SpringTraining from "@/components/SpringTraining";
import PlayersToWatch from "@/components/PlayersToWatch";
import TalentAssessmentSection from "@/components/TalentAssessmentSection";
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

// Homepage structured data with AEO optimization
const homepageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.metsxmfanzone.com/#webpage",
  url: "https://www.metsxmfanzone.com/",
  name: "MetsXMFanZone - The Ultimate Destination Where the Fans Go",
  description:
    "The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans.",
  isPartOf: {
    "@id": "https://www.metsxmfanzone.com/#website",
  },
  about: {
    "@type": "SportsTeam",
    name: "New York Mets",
    sport: "Baseball",
    memberOf: {
      "@type": "SportsOrganization",
      name: "Major League Baseball",
    },
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: "https://www.metsxmfanzone.com/og-image.png",
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".hero-description", "section h2"],
  },
};

// AEO: Organization Schema for AI assistants
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.metsxmfanzone.com/#organization",
  name: "MetsXMFanZone",
  alternateName: "Mets XM Fan Zone",
  url: "https://www.metsxmfanzone.com",
  logo: "https://www.metsxmfanzone.com/logo-512.png",
  description: "The ultimate fan-created platform for New York Mets fans featuring live streams, podcasts, news, and community.",
  foundingDate: "2024",
  sameAs: [
    "https://twitter.com/metsxmfanzone",
    "https://facebook.com/metsxmfanzone",
    "https://instagram.com/metsxmfanzone"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://www.metsxmfanzone.com/contact"
  }
};

// AEO: WebSite schema for sitelinks search
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.metsxmfanzone.com/#website",
  url: "https://www.metsxmfanzone.com",
  name: "MetsXMFanZone",
  description: "The ultimate destination for New York Mets fans - live streams, podcasts, news, and community.",
  publisher: {
    "@id": "https://www.metsxmfanzone.com/#organization"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.metsxmfanzone.com/blog?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// Combined schemas for AEO
const combinedSchemas = [homepageSchema, organizationSchema, websiteSchema];

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

      <SEOHead
        title="MetsXMFanZone - The Ultimate Destination Where The Fans Go | Live Games, News & Podcasts"
        description="The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans."
        keywords="Mets live streams, New York Mets, Mets highlights, Mets podcast, Mets fan community, MLB streams, Mets games, baseball live stream, Spring Training, Francisco Lindor, Pete Alonso, Citi Field"
        canonical="https://www.metsxmfanzone.com/"
        ogType="website"
        ogImage="https://www.metsxmfanzone.com/og-image.png"
        ogImageAlt="MetsXMFanZone - The Ultimate Destination Where The Fans Go"
        structuredData={combinedSchemas}
        pageType="home"
        breadcrumbs={[{ name: "Home", url: "/" }]}
      />
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

        <ScrollReveal delay={100}>
          <PlayersToWatch />
        </ScrollReveal>

        <div className="section-divider my-4 sm:my-6" />

        <ScrollReveal delay={100}>
          <TalentAssessmentSection />
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
