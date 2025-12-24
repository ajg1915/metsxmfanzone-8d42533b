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
      <main className="pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
          <Link to="/help-center" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-primary">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Our Community Values</h2>
                <p className="text-muted-foreground leading-relaxed">MetsXMFanZone is a community for passionate Mets fans to connect, share, and celebrate our team. We expect all members to follow these guidelines.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Be Respectful</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span>Treat all community members with respect and kindness</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span>No personal attacks, harassment, or bullying</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span>Respect different opinions and perspectives</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span><span>Keep discussions civil, even during heated debates</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Prohibited Content</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">✗</span><span>Hate speech, discrimination, or offensive language</span></li>
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">✗</span><span>Spam, advertising, or promotional content without permission</span></li>
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">✗</span><span>Copyrighted material without proper authorization</span></li>
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">✗</span><span>Misinformation or false news</span></li>
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">✗</span><span>NSFW content or inappropriate material</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Posting Guidelines</h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Stay on topic and relevant to the Mets and baseball</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Use clear, descriptive titles for your posts</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Credit sources when sharing news or content</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Avoid excessive posting or duplicate content</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Reporting Violations</h2>
                <p className="text-muted-foreground leading-relaxed">If you see content that violates these guidelines, please report it immediately. See our <Link to="/help/report-content" className="text-primary hover:underline font-medium">Reporting Inappropriate Content</Link> guide.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Consequences</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Violations of these guidelines may result in:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-yellow-500 font-bold">1.</span><span>Warning from moderators</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">2.</span><span>Temporary suspension of posting privileges</span></li>
                  <li className="flex items-start gap-2"><span className="text-destructive font-bold">3.</span><span>Permanent account ban for serious or repeated violations</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Questions</h2>
                <p className="text-muted-foreground leading-relaxed">If you have questions about these guidelines, please <Link to="/contact" className="text-primary hover:underline font-medium">contact us</Link>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
