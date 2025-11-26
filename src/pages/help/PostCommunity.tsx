import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PostCommunity = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Posting in the Community - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to create posts and share content with fellow Mets fans in the MetsXMFanZone community." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/post-community" />
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
              <CardTitle className="text-2xl sm:text-3xl">Posting in the Community</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground border-b pb-3">Creating a Post</h2>
                <p className="text-muted-foreground leading-relaxed">Share your thoughts and engage with fellow Mets fans:</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                  <h3 className="text-xl font-semibold text-foreground">Step 1: Navigate to Community</h3>
                  <p className="text-muted-foreground leading-relaxed">Click "Community" in the main navigation menu to access the community section.</p>
                </div>
                
                <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                  <h3 className="text-xl font-semibold text-foreground">Step 2: Create Your Post</h3>
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Click the "Create Post" button or text area</li>
                    <li>Write your message in the text field</li>
                    <li>Optionally, add an image by clicking the image icon</li>
                    <li>Click "Post" or "Submit" to publish</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Post Types</h2>
                
                <div className="grid gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Text Posts</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Share opinions, analysis, or discussion topics</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Ask questions to the community</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Start game day threads</span></li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Image Posts</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Share photos from games or Mets events</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Post memes and fan art</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Show off your Mets memorabilia</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Best Practices</h2>
                
                <div className="space-y-4">
                  <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Write Engaging Content</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Use clear, descriptive titles</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Stay on topic (Mets and baseball related)</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Add context and details</span></li>
                      <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span><span>Proofread before posting</span></li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Be Respectful</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">!</span><span>Follow <Link to="/help/community-guidelines" className="text-primary hover:underline font-medium">Community Guidelines</Link></span></li>
                      <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">!</span><span>Avoid spam or duplicate posts</span></li>
                      <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">!</span><span>Don't post personal information</span></li>
                      <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">!</span><span>Credit sources when sharing news</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Editing and Deleting</h2>
                
                <div className="space-y-4">
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Edit Your Post</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">To edit a post you've created:</p>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Find your post in the community feed</li>
                      <li>Click the edit icon or three-dot menu</li>
                      <li>Select "Edit"</li>
                      <li>Make your changes and save</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">Delete Your Post</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">To delete a post:</p>
                    <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                      <li>Find your post in the community feed</li>
                      <li>Click the three-dot menu</li>
                      <li>Select "Delete"</li>
                      <li>Confirm deletion</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Post Visibility</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">All posts are visible to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Logged-in community members</span></li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">•</span><span>Users with active accounts</span></li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">Posts are displayed in chronological order with newest posts first.</p>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-foreground">Engagement</h2>
                <p className="text-muted-foreground leading-relaxed">Learn how to interact with posts in our <Link to="/help/comments-reactions" className="text-primary hover:underline font-medium">Commenting and Reactions</Link> guide.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostCommunity;