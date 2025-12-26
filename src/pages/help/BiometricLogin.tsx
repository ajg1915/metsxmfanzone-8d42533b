import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Fingerprint, Smartphone, Shield, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const BiometricLogin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Login with Biometrics - MetsXMFanZone Help</title>
        <meta
          name="description"
          content="Learn how to register and use biometric login (fingerprint, Face ID, Windows Hello) for faster, more secure sign-in to MetsXMFanZone."
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/help/biometric-login" />
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
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl text-primary">Biometric Login Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-lg prose-slate dark:prose-invert max-w-none space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">What is Biometric Login?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Biometric login allows you to sign in to MetsXMFanZone using your device's built-in security features 
                  like fingerprint sensors (Touch ID), facial recognition (Face ID), or Windows Hello. It's faster 
                  and more secure than entering your password every time.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <Fingerprint className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Fingerprint</span>
                    <span className="text-xs text-muted-foreground">Android, Windows</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Face ID / Touch ID</span>
                    <span className="text-xs text-muted-foreground">iPhone, iPad, Mac</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                    <Smartphone className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">Windows Hello</span>
                    <span className="text-xs text-muted-foreground">Windows PC</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Part 1: Register Your Biometric (First-Time Setup)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Before you can use biometric login, you need to register your fingerprint or Face ID from your account dashboard.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 1: Sign In with Your Password</h3>
                <p className="text-muted-foreground leading-relaxed">
                  First, sign in to your MetsXMFanZone account using your email and password as you normally would.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 2: Go to Your Dashboard</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Once signed in, navigate to your <Link to="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link> by 
                  clicking on your profile or the Dashboard link in the navigation menu.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 3: Find the Biometric Login Section</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Scroll down to find the "Biometric Login" card. This section shows your registered passkeys and allows you to add new ones.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 4: Click "Add Passkey"</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Click the "Add Passkey" button to start the registration process. Your browser will prompt you to use your device's 
                  biometric sensor (fingerprint, Face ID, or Windows Hello).
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 5: Complete the Biometric Scan</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Follow your device's prompts to scan your fingerprint or face. Once complete, your passkey will be saved 
                  and you'll see a success message.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 mt-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Your biometric is now registered!</span>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <h2 className="text-2xl font-bold text-primary border-b pb-3">Part 2: Sign In with Biometrics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  After registering your biometric, you can use it to sign in quickly on future visits.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 1: Go to the Login Page</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Navigate to the <Link to="/auth?mode=login" className="text-primary hover:underline font-medium">Sign In page</Link>.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 2: Click "Sign in with Biometrics"</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Below the regular login form, you'll see a "Sign in with Biometrics" button. Click it to start the biometric login process.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 3: Enter Your Email</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enter the email address associated with your account. This helps us find your registered passkey.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 4: Authenticate with Your Biometric</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your device will prompt you to scan your fingerprint or use Face ID. Complete the scan to verify your identity.
                </p>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/30">
                <h3 className="text-xl font-semibold text-primary">Step 5: Complete 2FA Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  For additional security, you'll receive a 6-digit verification code via email. Enter this code to complete your login.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Managing Your Passkeys</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can manage your registered passkeys from your Dashboard at any time:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>View passkeys:</strong> See all devices where you've registered biometric login</li>
                  <li><strong>Add more devices:</strong> Register additional devices for convenience</li>
                  <li><strong>Remove passkeys:</strong> Delete passkeys from devices you no longer use</li>
                </ul>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-2xl font-bold text-primary">Troubleshooting</h2>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">"No passkeys found" error</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    This means you haven't registered a passkey yet. Sign in with your password first, then go to your Dashboard 
                    to register your biometric.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">"RP ID is invalid" error</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    This can happen if you're trying to use a passkey registered on a different domain. Make sure you're 
                    accessing MetsXMFanZone from the same URL where you registered your passkey.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Biometric not working on my device</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Ensure your device supports WebAuthn/Passkeys and that you're using a modern browser (Chrome, Safari, Edge, Firefox). 
                    Some older devices or browsers may not support biometric login.
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed pt-4">
                  If you continue to experience issues, please visit our{" "}
                  <Link to="/contact" className="text-primary hover:underline font-medium">
                    Contact
                  </Link>{" "}
                  page for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BiometricLogin;
