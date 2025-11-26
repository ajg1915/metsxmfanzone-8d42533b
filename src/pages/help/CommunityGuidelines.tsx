import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Community Guidelines - MetsXMFanZone Help</title>
        <meta name="description" content="MetsXMFanZone community guidelines and rules for respectful fan engagement and content sharing." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/community-guidelines" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Our Community Values</h2>
              <p>MetsXMFanZone is a community for passionate Mets fans to connect, share, and celebrate our team. We expect all members to follow these guidelines.</p>
              
              <h2>Be Respectful</h2>
              <ul>
                <li>Treat all community members with respect and kindness</li>
                <li>No personal attacks, harassment, or bullying</li>
                <li>Respect different opinions and perspectives</li>
                <li>Keep discussions civil, even during heated debates</li>
              </ul>
              
              <h2>Prohibited Content</h2>
              <ul>
                <li>Hate speech, discrimination, or offensive language</li>
                <li>Spam, advertising, or promotional content without permission</li>
                <li>Copyrighted material without proper authorization</li>
                <li>Misinformation or false news</li>
                <li>NSFW content or inappropriate material</li>
              </ul>
              
              <h2>Posting Guidelines</h2>
              <ul>
                <li>Stay on topic and relevant to the Mets and baseball</li>
                <li>Use clear, descriptive titles for your posts</li>
                <li>Credit sources when sharing news or content</li>
                <li>Avoid excessive posting or duplicate content</li>
              </ul>
              
              <h2>Reporting Violations</h2>
              <p>If you see content that violates these guidelines, please report it immediately. See our <Link to="/help/report-content" className="text-primary hover:underline">Reporting Inappropriate Content</Link> guide.</p>
              
              <h2>Consequences</h2>
              <p>Violations of these guidelines may result in:</p>
              <ul>
                <li>Warning from moderators</li>
                <li>Temporary suspension of posting privileges</li>
                <li>Permanent account ban for serious or repeated violations</li>
              </ul>
              
              <h2>Questions</h2>
              <p>If you have questions about these guidelines, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
