import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CommentsReactions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Commenting and Reactions - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to comment on posts, blog articles, and interact with content on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/comments-reactions" />
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
              <CardTitle className="text-2xl sm:text-3xl">Commenting and Reactions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground border-b pb-3">Adding Comments</h2>
                <p className="text-muted-foreground leading-relaxed">Engage in discussions by commenting on posts and blog articles:</p>
              </div>
              
              <div className="grid gap-6">
                <div className="space-y-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-semibold text-foreground">On Community Posts</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Navigate to the <Link to="/community" className="text-primary hover:underline font-medium">Community</Link> page</li>
                    <li>Find the post you want to comment on</li>
                    <li>Click in the comment text field below the post</li>
                    <li>Type your comment</li>
                    <li>Click "Post Comment" or press Enter</li>
                  </ol>
                </div>
                
                <div className="space-y-3 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-xl font-semibold text-foreground">On Blog Articles</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Read the blog article</li>
                    <li>Scroll to the comments section at the bottom</li>
                    <li>Click in the comment field</li>
                    <li>Write your thoughts</li>
                    <li>Submit your comment</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Comment Guidelines</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 p-5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">Do's ✓</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Add value to the conversation</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Be respectful of different opinions</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Stay on topic</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Use proper language</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Engage constructively</span></li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3 p-5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">Don'ts ✗</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-red-600 font-bold">✗</span><span>Post spam or off-topic comments</span></li>
                      <li className="flex items-start gap-2"><span className="text-red-600 font-bold">✗</span><span>Attack other users personally</span></li>
                      <li className="flex items-start gap-2"><span className="text-red-600 font-bold">✗</span><span>Use offensive language</span></li>
                      <li className="flex items-start gap-2"><span className="text-red-600 font-bold">✗</span><span>Share misinformation</span></li>
                      <li className="flex items-start gap-2"><span className="text-red-600 font-bold">✗</span><span>Advertise without permission</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Managing Your Comments</h2>
                
                <div className="grid gap-4">
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Edit a Comment</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">To edit your comment after posting:</p>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Find your comment</li>
                      <li>Click the edit icon or three-dot menu</li>
                      <li>Select "Edit"</li>
                      <li>Make changes and save</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Delete a Comment</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">To remove your comment:</p>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Find your comment</li>
                      <li>Click the three-dot menu</li>
                      <li>Select "Delete"</li>
                      <li>Confirm deletion</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Reactions and Likes</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Show appreciation for content without commenting:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">❤️</span><span>Click the like/heart icon on posts</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">👍</span><span>React to comments you agree with</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">👁️</span><span>Your reactions are visible to other users</span></li>
                </ul>
              </div>
              
              <div className="space-y-4 pt-6 border-t bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Get notified when:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">🔔</span><span>Someone replies to your comment</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">🔔</span><span>Your post receives comments</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">🔔</span><span>Someone reacts to your content</span></li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">Enable push notifications for real-time alerts about interactions.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Reporting Comments</h2>
                <p className="text-muted-foreground leading-relaxed">If you see inappropriate comments, report them following our <Link to="/help/report-content" className="text-primary hover:underline font-medium">Reporting Inappropriate Content</Link> guide.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Community Standards</h2>
                <p className="text-muted-foreground leading-relaxed">All comments must follow our <Link to="/help/community-guidelines" className="text-primary hover:underline font-medium">Community Guidelines</Link>. Violations may result in comment removal or account restrictions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommentsReactions;