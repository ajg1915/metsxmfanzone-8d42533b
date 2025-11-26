import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const FollowFans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Following Other Fans - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to connect with and follow other Mets fans on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/follow-fans" />
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
              <CardTitle className="text-2xl sm:text-3xl">Following Other Fans</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Discovering Fans</h2>
              <p>Connect with fellow Mets supporters on MetsXMFanZone:</p>
              
              <h3>In the Community Feed</h3>
              <ul>
                <li>Browse posts in the <Link to="/community" className="text-primary hover:underline">Community</Link> section</li>
                <li>Click on usernames to view profiles</li>
                <li>See posts, comments, and activity</li>
              </ul>
              
              <h3>In Comments</h3>
              <ul>
                <li>Engage with fans who comment on blog posts</li>
                <li>Reply to comments you find interesting</li>
                <li>Check out profiles of active community members</li>
              </ul>
              
              <h2>Following Users</h2>
              <p>To follow another fan:</p>
              <ol>
                <li>Navigate to their profile</li>
                <li>Click the "Follow" button</li>
                <li>You'll now see their activity in your feed</li>
              </ol>
              
              <h2>Benefits of Following</h2>
              <ul>
                <li>See posts from fans you follow in your personalized feed</li>
                <li>Get notifications about their activity</li>
                <li>Build a network of like-minded Mets supporters</li>
                <li>Participate in focused discussions</li>
              </ul>
              
              <h2>Managing Follows</h2>
              
              <h3>View Your Following List</h3>
              <p>To see who you're following:</p>
              <ol>
                <li>Go to your <Link to="/dashboard" className="text-primary hover:underline">Dashboard</Link></li>
                <li>Click on "Following" or "Connections"</li>
                <li>Browse your list of followed users</li>
              </ol>
              
              <h3>Unfollow Users</h3>
              <p>To stop following someone:</p>
              <ol>
                <li>Visit their profile or your following list</li>
                <li>Click the "Following" button</li>
                <li>Confirm you want to unfollow</li>
              </ol>
              
              <h2>Your Followers</h2>
              <p>See who's following you:</p>
              <ul>
                <li>Access your followers list from your profile</li>
                <li>View profiles of your followers</li>
                <li>Follow back users you're interested in</li>
              </ul>
              
              <h2>Privacy Settings</h2>
              <p>Control your visibility:</p>
              <ul>
                <li>Your posts are visible to all logged-in community members</li>
                <li>Your profile information is public to other users</li>
                <li>You can update privacy preferences in your account settings</li>
              </ul>
              
              <h2>Engagement Tips</h2>
              
              <h3>Building Connections</h3>
              <ul>
                <li>Post regularly to stay visible</li>
                <li>Engage with others' content</li>
                <li>Participate in game day discussions</li>
                <li>Share quality content and insights</li>
              </ul>
              
              <h3>Respectful Interaction</h3>
              <ul>
                <li>Follow <Link to="/help/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link></li>
                <li>Respect different opinions and perspectives</li>
                <li>Avoid spam or excessive tagging</li>
                <li>Build positive relationships</li>
              </ul>
              
              <h2>Reporting Issues</h2>
              <p>If you experience harassment or inappropriate behavior from another user, see our <Link to="/help/report-content" className="text-primary hover:underline">Reporting Inappropriate Content</Link> guide.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FollowFans;
