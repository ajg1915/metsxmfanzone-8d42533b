import { lazy, Suspense, useEffect, useState } from "react";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveGameTicker from "@/components/LiveGameTicker";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { setupNotificationListeners } from "@/utils/notificationTriggers";

import { useAutoLineupFetch } from "@/hooks/useAutoLineupFetch";
import { useAuth } from "@/hooks/useAuth";

// Lazy load heavy components that are below the fold
const ImmersiveBackground = lazy(() => import("@/components/ImmersiveBackground"));
const LiveNotificationBar = lazy(() => import("@/components/LiveNotificationBar"));
const LiveNetworks = lazy(() => import("@/components/LiveNetworks"));
const LiveStreamsSection = lazy(() => import("@/components/LiveStreamsSection"));

const SpringTraining = lazy(() => import("@/components/SpringTraining"));
const PlayersToWatch = lazy(() => import("@/components/PlayersToWatch"));
const TalentAssessmentSection = lazy(() => import("@/components/TalentAssessmentSection"));
const MetsNewsTracker = lazy(() => import("@/components/MetsNewsTracker"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const HomeLineupCard = lazy(() => import("@/components/HomeLineupCard"));
const PodcastSection = lazy(() => import("@/components/PodcastSection"));
const PodcastScheduleSection = lazy(() => import("@/components/PodcastScheduleSection"));
const JoinPodcastSection = lazy(() => import("@/components/JoinPodcastSection"));
const HotStoveGuide = lazy(() => import("@/components/HotStoveGuide"));
const StoriesSection = lazy(() => import("@/components/StoriesSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const AppInstallSection = lazy(() => import("@/components/AppInstallSection"));
const CommunityPreviewSection = lazy(() => import("@/components/CommunityPreviewSection"));
const InstallPrompt = lazy(() => import("@/components/InstallPrompt"));
const OnboardingWalkthrough = lazy(() => import("@/components/OnboardingWalkthrough"));
const NotificationPrompt = lazy(() => import("@/components/NotificationPrompt"));
const WelcomeBackToast = lazy(() => import("@/components/WelcomeBackToast"));
const FeedbackToast = lazy(() => import("@/components/FeedbackToast"));
const GameAlertsBanner = lazy(() => import("@/components/GameAlertsBanner"));


// Section loading skeleton
const SectionSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <div className={`w-full ${height} px-4`}>
    <div className="container mx-auto max-w-7xl">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  </div>
);

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
  alternateName: "MetsXMFanZone",
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
  const { user } = useAuth();
  const [onboardingShown, setOnboardingShown] = useState(false);

  // Auto-fetch Mets lineup on game days (every 30 minutes)
  useAutoLineupFetch();

  useEffect(() => {
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Welcome back toast for returning users - lazy loaded */}
      <Suspense fallback={null}>
        <WelcomeBackToast />
      </Suspense>

      {/* Immersive animated background - lazy loaded */}
      <Suspense fallback={null}>
        <ImmersiveBackground />
      </Suspense>

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
      <Suspense fallback={null}>
        <GameAlertsBanner />
      </Suspense>
      <main className="pt-14 sm:pt-16 relative z-10">
        <Hero />
        
        
        <Suspense fallback={null}>
          <LiveNotificationBar />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-32" />}>
          <StoriesSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <LiveNetworks />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <LiveStreamsSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <BlogSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <HomeLineupCard />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <div id="social">
          <Suspense fallback={<SectionSkeleton />}>
            <CommunityPreviewSection />
          </Suspense>
        </div>

        <Suspense fallback={<SectionSkeleton />}>
          <PodcastScheduleSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <SpringTraining />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <PlayersToWatch />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <TalentAssessmentSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <MetsNewsTracker />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <PodcastSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <JoinPodcastSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton height="h-48" />}>
          <AppInstallSection />
        </Suspense>

        <div className="section-divider my-2 sm:my-3" />

        <Suspense fallback={<SectionSkeleton />}>
          <HotStoveGuide />
        </Suspense>
      </main>
      <Footer />
      
      {/* Lazy load non-critical UI */}
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>
      <Suspense fallback={null}>
        <NotificationPrompt />
      </Suspense>
      <Suspense fallback={null}>
        <OnboardingWalkthrough onComplete={() => setOnboardingShown(true)} />
      </Suspense>
      <Suspense fallback={null}>
        <FeedbackToast />
      </Suspense>
    </div>
  );
};

export default Index;
