import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Book, Video, MessageCircle } from "lucide-react";

const HelpCenter = () => {
  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of MetsXMFanZone",
      articles: [
        "How to create an account",
        "Navigating the platform",
        "Watching live streams",
        "Community guidelines",
      ],
    },
    {
      icon: Video,
      title: "Streaming & Content",
      description: "Everything about our video content",
      articles: [
        "Video quality settings",
        "Accessing premium content",
        "Download and offline viewing",
        "Troubleshooting playback issues",
      ],
    },
    {
      icon: MessageCircle,
      title: "Community & Engagement",
      description: "Connect with other fans",
      articles: [
        "Posting in the community",
        "Commenting and reactions",
        "Following other fans",
        "Reporting inappropriate content",
      ],
    },
    {
      icon: HelpCircle,
      title: "Account & Billing",
      description: "Manage your account and subscriptions",
      articles: [
        "Update profile information",
        "Subscription plans explained",
        "Payment methods",
        "Cancel or change subscription",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Help Center - MetsXMFanZone Support & Resources</title>
        <meta name="description" content="Get help with MetsXMFanZone. Browse guides, tutorials, and resources for streaming, account management, troubleshooting, and more." />
        <meta name="keywords" content="Mets help center, streaming support, account help, video troubleshooting, MetsXM support" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help-center" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Help Center
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to your questions and learn how to get the most out of MetsXMFanZone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          • {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
