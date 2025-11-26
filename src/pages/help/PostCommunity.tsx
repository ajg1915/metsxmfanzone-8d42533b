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
            <CardContent className="prose prose-slate max-w-none">
              <h2>Creating a Post</h2>
              <p>Share your thoughts and engage with fellow Mets fans:</p>
              
              <h3>Step 1: Navigate to Community</h3>
              <p>Click "Community" in the main navigation menu to access the community section.</p>
              
              <h3>Step 2: Create Your Post</h3>
              <ol>
                <li>Click the "Create Post" button or text area</li>
                <li>Write your message in the text field</li>
                <li>Optionally, add an image by clicking the image icon</li>
                <li>Click "Post" or "Submit" to publish</li>
              </ol>
              
              <h2>Post Types</h2>
              
              <h3>Text Posts</h3>
              <ul>
                <li>Share opinions, analysis, or discussion topics</li>
                <li>Ask questions to the community</li>
                <li>Start game day threads</li>
              </ul>
              
              <h3>Image Posts</h3>
              <ul>
                <li>Share photos from games or Mets events</li>
                <li>Post memes and fan art</li>
                <li>Show off your Mets memorabilia</li>
              </ul>
              
              <h2>Best Practices</h2>
              
              <h3>Write Engaging Content</h3>
              <ul>
                <li>Use clear, descriptive titles</li>
                <li>Stay on topic (Mets and baseball related)</li>
                <li>Add context and details</li>
                <li>Proofread before posting</li>
              </ul>
              
              <h3>Be Respectful</h3>
              <ul>
                <li>Follow <Link to="/help/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link></li>
                <li>Avoid spam or duplicate posts</li>
                <li>Don't post personal information</li>
                <li>Credit sources when sharing news</li>
              </ul>
              
              <h2>Editing and Deleting</h2>
              
              <h3>Edit Your Post</h3>
              <p>To edit a post you've created:</p>
              <ol>
                <li>Find your post in the community feed</li>
                <li>Click the edit icon or three-dot menu</li>
                <li>Select "Edit"</li>
                <li>Make your changes and save</li>
              </ol>
              
              <h3>Delete Your Post</h3>
              <p>To delete a post:</p>
              <ol>
                <li>Find your post in the community feed</li>
                <li>Click the three-dot menu</li>
                <li>Select "Delete"</li>
                <li>Confirm deletion</li>
              </ol>
              
              <h2>Post Visibility</h2>
              <p>All posts are visible to:</p>
              <ul>
                <li>Logged-in community members</li>
                <li>Users with active accounts</li>
              </ul>
              <p>Posts are displayed in chronological order with newest posts first.</p>
              
              <h2>Engagement</h2>
              <p>Learn how to interact with posts in our <Link to="/help/comments-reactions" className="text-primary hover:underline">Commenting and Reactions</Link> guide.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostCommunity;
