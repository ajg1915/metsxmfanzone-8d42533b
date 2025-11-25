import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import LiveNotificationBar from "@/components/LiveNotificationBar";
import LiveNetworks from "@/components/LiveNetworks";
import LiveStreamsSection from "@/components/LiveStreamsSection";
import SpringTraining from "@/components/SpringTraining";
import MetsNewsTracker from "@/components/MetsNewsTracker";
import BlogSection from "@/components/BlogSection";
import PodcastSection from "@/components/PodcastSection";
import NewsletterSection from "@/components/NewsletterSection";
import FeedbackSection from "@/components/FeedbackSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import AppInstallSection from "@/components/AppInstallSection";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import SectionScrollIndicator from "@/components/SectionScrollIndicator";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>MetsXMFanZone - Watch Mets Live Streams, Highlights & Exclusive Coverage</title>
        <meta name="description" content="The ultimate Mets fan community. Watch live game streams, highlights, podcasts, and exclusive Mets coverage. Join thousands of passionate New York Mets fans." />
        <meta name="keywords" content="Mets live streams, New York Mets, Mets highlights, Mets podcast, Mets fan community, MLB streams, Mets games, baseball live stream" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/" />
      </Helmet>
      <Navigation />
      <main className="pt-12 sm:pt-14">
        <Hero />
        <SectionScrollIndicator />
        <LiveNotificationBar />
        <SectionScrollIndicator />
        <LiveNetworks />
        <SectionScrollIndicator />
        <LiveStreamsSection />
        <SectionScrollIndicator />
        <SpringTraining />
        <SectionScrollIndicator />
        <MetsNewsTracker />
        <SectionScrollIndicator />
        <BlogSection />
        <SectionScrollIndicator />
        <PodcastSection />
        <SectionScrollIndicator />
        <FAQSection />
        <SectionScrollIndicator />
        <FeedbackSection />
        <SectionScrollIndicator />
        <AppInstallSection />
        <SectionScrollIndicator />
        <NewsletterSection />
      </main>
      <Footer />
      <InstallPrompt />
      <OnboardingWalkthrough onComplete={() => {}} />
    </div>;
};
export default Index;