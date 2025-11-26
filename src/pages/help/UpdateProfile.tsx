import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const UpdateProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Update Profile Information - MetsXMFanZone Help</title>
        <meta name="description" content="Learn how to update your profile information, avatar, and account settings on MetsXMFanZone." />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/update-profile" />
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
              <CardTitle className="text-2xl sm:text-3xl">Update Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <h2>Accessing Your Profile</h2>
              <p>To update your profile information:</p>
              <ol>
                <li>Log in to your MetsXMFanZone account</li>
                <li>Click on your profile icon or name in the top right</li>
                <li>Select "Dashboard" or "Settings"</li>
                <li>Navigate to the profile section</li>
              </ol>
              
              <h2>Profile Information</h2>
              
              <h3>Full Name</h3>
              <ul>
                <li>Update your display name</li>
                <li>This appears on all your posts and comments</li>
                <li>Use your real name or a username</li>
              </ul>
              
              <h3>Email Address</h3>
              <ul>
                <li>Update your email for account notifications</li>
                <li>Used for password recovery</li>
                <li>Receives important account updates</li>
              </ul>
              
              <h3>Profile Picture/Avatar</h3>
              <p>To change your profile picture:</p>
              <ol>
                <li>Click on your current avatar in settings</li>
                <li>Select "Upload new image"</li>
                <li>Choose a photo from your device</li>
                <li>Crop or adjust as needed</li>
                <li>Save your changes</li>
              </ol>
              
              <h2>Account Settings</h2>
              
              <h3>Password</h3>
              <p>To change your password:</p>
              <ol>
                <li>Go to account settings</li>
                <li>Find the "Change Password" section</li>
                <li>Enter your current password</li>
                <li>Enter your new password</li>
                <li>Confirm the new password</li>
                <li>Save changes</li>
              </ol>
              
              <h3>Notification Preferences</h3>
              <p>Customize what notifications you receive:</p>
              <ul>
                <li>Email notifications for new content</li>
                <li>Push notifications for live streams</li>
                <li>Community activity alerts</li>
                <li>Newsletter subscription</li>
              </ul>
              
              <h2>Privacy Settings</h2>
              
              <h3>Profile Visibility</h3>
              <ul>
                <li>Control who can see your profile</li>
                <li>Manage post visibility</li>
                <li>Adjust comment settings</li>
              </ul>
              
              <h3>Activity Status</h3>
              <ul>
                <li>Show or hide your online status</li>
                <li>Control activity feed visibility</li>
                <li>Manage follower permissions</li>
              </ul>
              
              <h2>Subscription Information</h2>
              <p>View and manage your subscription:</p>
              <ul>
                <li>Current plan status</li>
                <li>Billing information</li>
                <li>Subscription renewal date</li>
                <li>Payment method on file</li>
              </ul>
              <p>For more details, see <Link to="/help/subscription-plans" className="text-primary hover:underline">Subscription Plans Explained</Link>.</p>
              
              <h2>Account Security</h2>
              
              <h3>Best Practices</h3>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Don't share your login credentials</li>
                <li>Log out on shared devices</li>
                <li>Review account activity regularly</li>
              </ul>
              
              <h3>Two-Factor Authentication</h3>
              <p>If available, enable 2FA for added security:</p>
              <ol>
                <li>Go to security settings</li>
                <li>Enable two-factor authentication</li>
                <li>Follow setup instructions</li>
                <li>Save backup codes safely</li>
              </ol>
              
              <h2>Deleting Your Account</h2>
              <p>If you wish to delete your account:</p>
              <ol>
                <li>Go to account settings</li>
                <li>Find "Delete Account" option</li>
                <li>Read the consequences carefully</li>
                <li>Confirm deletion</li>
              </ol>
              <p className="text-yellow-700 dark:text-yellow-300">Note: Account deletion is permanent and cannot be undone. All your data will be removed.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdateProfile;
