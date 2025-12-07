import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
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
import VideoGalleryManagement from "./pages/admin/VideoGalleryManagement";
import PodcastManagement from "./pages/admin/PodcastManagement";
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
import EmailEditor from "./pages/admin/EmailEditor";
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
import MetsSchedule2026 from "./pages/MetsSchedule2026";
import MetsLineupCard from "./pages/MetsLineupCard";
import VideoGallery from "./pages/VideoGallery";
import LineupCardManagement from "./pages/admin/LineupCardManagement";
import EventsManagement from "./pages/admin/EventsManagement";
import SpringTrainingManagement from "./pages/admin/SpringTrainingManagement";
import UserManagement from "./pages/admin/UserManagement";
import CreateAccount from "./pages/help/CreateAccount";
import NavigatePlatform from "./pages/help/NavigatePlatform";
import WatchStreams from "./pages/help/WatchStreams";
import CommunityGuidelines from "./pages/help/CommunityGuidelines";
import VideoQuality from "./pages/help/VideoQuality";
import PremiumContent from "./pages/help/PremiumContent";
import OfflineViewing from "./pages/help/OfflineViewing";
import PlaybackIssues from "./pages/help/PlaybackIssues";
import PostCommunity from "./pages/help/PostCommunity";
import CommentsReactions from "./pages/help/CommentsReactions";
import FollowFans from "./pages/help/FollowFans";
import ReportContent from "./pages/help/ReportContent";
import UpdateProfile from "./pages/help/UpdateProfile";
import SubscriptionPlans from "./pages/help/SubscriptionPlans";
import PaymentMethods from "./pages/help/PaymentMethods";
import CancelSubscription from "./pages/help/CancelSubscription";
import ReturnPolicy from "./pages/help/ReturnPolicy";
import Logout from "./pages/Logout";

const queryClient = new QueryClient();

const App = () => {
  useAutoRefresh();
  
  // Disable right-click context menu across the entire website
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PullToRefresh>
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
          <Route path="/logout" element={<Logout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/og-blog/:slug" element={<OGBlogPost />} />
          <Route path="/blog/rss" element={<BlogRSS />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/help/create-account" element={<CreateAccount />} />
          <Route path="/help/navigate-platform" element={<NavigatePlatform />} />
          <Route path="/help/watch-streams" element={<WatchStreams />} />
          <Route path="/help/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/help/video-quality" element={<VideoQuality />} />
          <Route path="/help/premium-content" element={<PremiumContent />} />
          <Route path="/help/offline-viewing" element={<OfflineViewing />} />
          <Route path="/help/playback-issues" element={<PlaybackIssues />} />
          <Route path="/help/post-community" element={<PostCommunity />} />
          <Route path="/help/comments-reactions" element={<CommentsReactions />} />
          <Route path="/help/follow-fans" element={<FollowFans />} />
          <Route path="/help/report-content" element={<ReportContent />} />
          <Route path="/help/update-profile" element={<UpdateProfile />} />
          <Route path="/help/subscription-plans" element={<SubscriptionPlans />} />
          <Route path="/help/payment-methods" element={<PaymentMethods />} />
          <Route path="/help/cancel-subscription" element={<CancelSubscription />} />
          <Route path="/help/return-policy" element={<ReturnPolicy />} />
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
            <Route path="video-gallery-management" element={<VideoGalleryManagement />} />
            <Route path="podcasts" element={<PodcastManagement />} />
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
            <Route path="email-editor" element={<EmailEditor />} />
            <Route path="feedbacks" element={<FeedbackManagement />} />
            <Route path="posts" element={<PostsManagement />} />
            <Route path="business-ads" element={<BusinessAdsManagement />} />
            <Route path="roles" element={<UserRoles />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="spring-training" element={<SpringTrainingManagement />} />
            <Route path="lineup-card-management" element={<LineupCardManagement />} />
          </Route>
          <Route path="/spring-training-live" element={<SpringTrainingLive />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="/product/:handle" element={<Product />} />
          <Route path="/mets-schedule-2026" element={<MetsSchedule2026 />} />
          <Route path="/mets-lineup-card" element={<MetsLineupCard />} />
          <Route path="/video-gallery" element={<VideoGallery />} />
          <Route path="/metsxmfanzone-tv" element={<MetsXMFanZone />} />
          <Route path="/mlb-network" element={<MLBNetwork />} />
          <Route path="/espn-network" element={<ESPNNetwork />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </PullToRefresh>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
