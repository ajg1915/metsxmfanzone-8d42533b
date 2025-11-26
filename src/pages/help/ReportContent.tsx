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
              <CardTitle className="text-2xl sm:text-3xl">Reporting Inappropriate Content</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>When to Report</h2>
              <p>Report content or behavior that violates our <Link to="/help/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link>:</p>
              
              <h3>Violations to Report</h3>
              <ul>
                <li>Harassment or bullying</li>
                <li>Hate speech or discrimination</li>
                <li>Spam or advertising</li>
                <li>Inappropriate or NSFW content</li>
                <li>Misinformation</li>
                <li>Copyright infringement</li>
                <li>Personal information sharing</li>
                <li>Threats or violence</li>
              </ul>
              
              <h2>How to Report</h2>
              
              <h3>Reporting Posts</h3>
              <ol>
                <li>Find the post you want to report</li>
                <li>Click the three-dot menu icon</li>
                <li>Select "Report Post"</li>
                <li>Choose the reason for reporting</li>
                <li>Add any additional details</li>
                <li>Submit the report</li>
              </ol>
              
              <h3>Reporting Comments</h3>
              <ol>
                <li>Locate the inappropriate comment</li>
                <li>Click the flag or report icon</li>
                <li>Select the violation type</li>
                <li>Provide context if needed</li>
                <li>Submit your report</li>
              </ol>
              
              <h3>Reporting Users</h3>
              <ol>
                <li>Visit the user's profile</li>
                <li>Click the report or three-dot menu</li>
                <li>Select "Report User"</li>
                <li>Specify the issue</li>
                <li>Include relevant examples or screenshots</li>
                <li>Submit the report</li>
              </ol>
              
              <h2>What Happens Next</h2>
              
              <h3>Review Process</h3>
              <ol>
                <li>Your report is submitted to our moderation team</li>
                <li>Reports are reviewed within 24-48 hours</li>
                <li>Moderators investigate the reported content</li>
                <li>Appropriate action is taken if violations are confirmed</li>
              </ol>
              
              <h3>Possible Actions</h3>
              <p>Depending on the severity of the violation:</p>
              <ul>
                <li>Content removal</li>
                <li>User warning</li>
                <li>Temporary account suspension</li>
                <li>Permanent account ban</li>
                <li>Legal action for serious violations</li>
              </ul>
              
              <h2>Your Privacy</h2>
              <p>Important information about reporting:</p>
              <ul>
                <li>Reports are anonymous to the reported user</li>
                <li>Your identity is protected</li>
                <li>False or malicious reports may result in consequences</li>
                <li>Moderators may contact you for additional information</li>
              </ul>
              
              <h2>Blocking Users</h2>
              <p>In addition to reporting, you can block users:</p>
              <ol>
                <li>Go to the user's profile</li>
                <li>Click the block option</li>
                <li>Confirm you want to block</li>
                <li>You won't see their content anymore</li>
              </ol>
              
              <h2>Emergency Situations</h2>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="font-semibold text-red-800 dark:text-red-200">Important:</p>
                <p className="text-red-700 dark:text-red-300">If you encounter content involving immediate danger, threats of violence, or illegal activity, please contact local authorities immediately in addition to reporting on our platform.</p>
              </div>
              
              <h2>Need More Help?</h2>
              <p>For serious concerns or if you need to escalate an issue, <Link to="/contact" className="text-primary hover:underline">contact our support team</Link> directly.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportContent;
