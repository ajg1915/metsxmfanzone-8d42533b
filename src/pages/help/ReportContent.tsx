import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ReportContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Reporting Inappropriate Content - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to report inappropriate content, harassment, or policy violations on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/report-content" />
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
              <CardTitle className="text-2xl sm:text-3xl text-primary">Reporting Inappropriate Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">When to Report</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Report content or behavior that violates our <Link to="/help/community-guidelines" className="text-primary hover:underline font-medium">Community Guidelines</Link>:</p>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-muted-foreground">Harassment or bullying</span>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-muted-foreground">Hate speech or discrimination</span>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-muted-foreground">Spam or advertising</span>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span className="text-muted-foreground">Inappropriate content</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">How to Report</h2>
                
                <div className="grid gap-6">
                  <div className="space-y-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-xl font-semibold text-primary">Reporting Posts</h3>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Find the post you want to report</li>
                      <li>Click the three-dot menu icon</li>
                      <li>Select "Report Post"</li>
                      <li>Choose the reason for reporting</li>
                      <li>Submit the report</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-3 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-xl font-semibold text-primary">Reporting Comments</h3>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Locate the inappropriate comment</li>
                      <li>Click the flag or report icon</li>
                      <li>Select the violation type</li>
                      <li>Submit your report</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-l-4 border-red-500 mt-6">
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200">Emergency Situations</h2>
                <p className="text-red-800 dark:text-red-300 leading-relaxed"><strong>Important:</strong> If you encounter content involving immediate danger, threats of violence, or illegal activity, please contact local authorities immediately in addition to reporting on our platform.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportContent;