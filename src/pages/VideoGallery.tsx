import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideoGallery() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Video Gallery | MetsXMFanZone</title>
        <meta name="description" content="Watch exclusive Mets videos, highlights, and replays from MetsXMFanZone." />
      </Helmet>

      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Video Gallery
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch exclusive Mets content, highlights, and game replays
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Video content will be available here soon. Check back later for exclusive Mets videos and highlights.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
