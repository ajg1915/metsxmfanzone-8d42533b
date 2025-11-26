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
            <CardContent className="prose prose-slate max-w-none">
              <h2>Adding Comments</h2>
              <p>Engage in discussions by commenting on posts and blog articles:</p>
              
              <h3>On Community Posts</h3>
              <ol>
                <li>Navigate to the <Link to="/community" className="text-primary hover:underline">Community</Link> page</li>
                <li>Find the post you want to comment on</li>
                <li>Click in the comment text field below the post</li>
                <li>Type your comment</li>
                <li>Click "Post Comment" or press Enter</li>
              </ol>
              
              <h3>On Blog Articles</h3>
              <ol>
                <li>Read the blog article</li>
                <li>Scroll to the comments section at the bottom</li>
                <li>Click in the comment field</li>
                <li>Write your thoughts</li>
                <li>Submit your comment</li>
              </ol>
              
              <h2>Comment Guidelines</h2>
              
              <h3>Do's</h3>
              <ul>
                <li>Add value to the conversation</li>
                <li>Be respectful of different opinions</li>
                <li>Stay on topic</li>
                <li>Use proper language</li>
                <li>Engage constructively</li>
              </ul>
              
              <h3>Don'ts</h3>
              <ul>
                <li>Post spam or off-topic comments</li>
                <li>Attack other users personally</li>
                <li>Use offensive language</li>
                <li>Share misinformation</li>
                <li>Advertise without permission</li>
              </ul>
              
              <h2>Managing Your Comments</h2>
              
              <h3>Edit a Comment</h3>
              <p>To edit your comment after posting:</p>
              <ol>
                <li>Find your comment</li>
                <li>Click the edit icon or three-dot menu</li>
                <li>Select "Edit"</li>
                <li>Make changes and save</li>
              </ol>
              
              <h3>Delete a Comment</h3>
              <p>To remove your comment:</p>
              <ol>
                <li>Find your comment</li>
                <li>Click the three-dot menu</li>
                <li>Select "Delete"</li>
                <li>Confirm deletion</li>
              </ol>
              
              <h2>Reactions and Likes</h2>
              <p>Show appreciation for content without commenting:</p>
              <ul>
                <li>Click the like/heart icon on posts</li>
                <li>React to comments you agree with</li>
                <li>Your reactions are visible to other users</li>
              </ul>
              
              <h2>Notifications</h2>
              <p>Get notified when:</p>
              <ul>
                <li>Someone replies to your comment</li>
                <li>Your post receives comments</li>
                <li>Someone reacts to your content</li>
              </ul>
              <p>Enable push notifications for real-time alerts about interactions.</p>
              
              <h2>Reporting Comments</h2>
              <p>If you see inappropriate comments, report them following our <Link to="/help/report-content" className="text-primary hover:underline">Reporting Inappropriate Content</Link> guide.</p>
              
              <h2>Community Standards</h2>
              <p>All comments must follow our <Link to="/help/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link>. Violations may result in comment removal or account restrictions.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommentsReactions;
