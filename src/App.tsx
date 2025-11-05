import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Live from "./pages/Live";
import Community from "./pages/Community";
import Highlights from "./pages/Highlights";
import Replays from "./pages/Replays";
import Plans from "./pages/Plans";
import Auth from "./pages/Auth";
import AdminSetup from "./pages/AdminSetup";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ContentManagement from "./pages/admin/ContentManagement";
import PostsManagement from "./pages/admin/PostsManagement";
import UserRoles from "./pages/admin/UserRoles";
import AdminSettings from "./pages/admin/AdminSettings";
import MetsXMFanZone from "./pages/MetsXMFanZone";
import MLBNetwork from "./pages/MLBNetwork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/live" element={<Live />} />
          <Route path="/community" element={<Community />} />
          <Route path="/highlights" element={<Highlights />} />
          <Route path="/replays" element={<Replays />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="posts" element={<PostsManagement />} />
            <Route path="roles" element={<UserRoles />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="/metsxmfanzone-tv" element={<MetsXMFanZone />} />
          <Route path="/mlb-network" element={<MLBNetwork />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
