import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Live from "./pages/Live";
import Community from "./pages/Community";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";
import Gallery from "./pages/Gallery";
import Plans from "./pages/Plans";
import Auth from "./pages/Auth";
import ConfirmAccount from "./pages/ConfirmAccount";
import AdminSetup from "./pages/AdminSetup";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import PostsManagement from "./pages/admin/PostsManagement";
import UserRoles from "./pages/admin/UserRoles";
import AdminSettings from "./pages/admin/AdminSettings";
import BlogManagement from "./pages/admin/BlogManagement";
import VideoManagement from "./pages/admin/VideoManagement";
import PodcastManagement from "./pages/admin/PodcastManagement";
import PodcastAIVoiceGenerator from "./pages/admin/PodcastAIVoiceGenerator";
import PodcastLiveStreamManagement from "./pages/admin/PodcastLiveStreamManagement";
import QRCodeGenerator from "./pages/admin/QRCodeGenerator";
import LiveStreamManagement from "./pages/admin/LiveStreamManagement";
import LiveNotificationManagement from "./pages/admin/LiveNotificationManagement";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import StoriesManagement from "./pages/admin/StoriesManagement";
import MetsNewsTrackerManagement from "./pages/admin/MetsNewsTrackerManagement";
import TutorialManagement from "./pages/admin/TutorialManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import TVScheduleManagement from "./pages/admin/TVScheduleManagement";
import NewsletterGenerator from "./pages/admin/NewsletterGenerator";
import StreamReplayEditor from "./pages/admin/StreamReplayEditor";
import BusinessAdsManagement from "./pages/admin/BusinessAdsManagement";
import MetsXMFanZone from "./pages/MetsXMFanZone";
import MLBNetwork from "./pages/MLBNetwork";
import ESPNNetwork from "./pages/ESPNNetwork";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import OGBlogPost from "./pages/OGBlogPost";
import BlogRSS from "./pages/BlogRSS";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Podcast from "./pages/Podcast";
import BusinessPartner from "./pages/BusinessPartner";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import Sitemap from "./pages/Sitemap";
import PayPalSuccess from "./pages/PayPalSuccess";
import HelcimCheckout from "./pages/HelcimCheckout";
import SpringTrainingLive from "./pages/SpringTrainingLive";
import Merch from "./pages/Merch";
import Product from "./pages/Product";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/live" element={<Live />} />
        <Route path="/community" element={<Community />} />
        <Route path="/gallery" element={<Gallery />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/paypal-success" element={<PayPalSuccess />} />
          <Route path="/helcim-checkout" element={<HelcimCheckout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-error" element={<PaymentError />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/confirm-account" element={<ConfirmAccount />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/og-blog/:slug" element={<OGBlogPost />} />
          <Route path="/blog/rss" element={<BlogRSS />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/business-partner" element={<BusinessPartner />} />
          <Route path="/legal/admin-setup" element={<AdminSetup />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="videos" element={<VideoManagement />} />
            <Route path="podcasts" element={<PodcastManagement />} />
            <Route path="podcast-ai" element={<PodcastAIVoiceGenerator />} />
            <Route path="qr-generator" element={<QRCodeGenerator />} />
            <Route path="live-streams" element={<LiveStreamManagement />} />
            <Route path="podcast-live-stream" element={<PodcastLiveStreamManagement />} />
            <Route path="stream-replays" element={<StreamReplayEditor />} />
            <Route path="live-notifications" element={<LiveNotificationManagement />} />
            <Route path="stories" element={<StoriesManagement />} />
            <Route path="mets-news" element={<MetsNewsTrackerManagement />} />
            <Route path="tutorial" element={<TutorialManagement />} />
            <Route path="tv-schedule" element={<TVScheduleManagement />} />
            <Route path="newsletter" element={<NewsletterGenerator />} />
            <Route path="feedbacks" element={<FeedbackManagement />} />
            <Route path="posts" element={<PostsManagement />} />
            <Route path="business-ads" element={<BusinessAdsManagement />} />
            <Route path="roles" element={<UserRoles />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
          </Route>
          <Route path="/spring-training-live" element={<SpringTrainingLive />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/product/:handle" element={<Product />} />
          <Route path="/metsxmfanzone-tv" element={<MetsXMFanZone />} />
          <Route path="/mlb-network" element={<MLBNetwork />} />
          <Route path="/espn-network" element={<ESPNNetwork />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
