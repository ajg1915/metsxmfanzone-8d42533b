import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetsLineupCard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Daily 2026 Mets Lineup Card | MetsXMFanZone</title>
        <meta name="description" content="View the daily starting lineup for the 2026 New York Mets season. Updated daily with the latest roster information." />
      </Helmet>

      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Daily 2026 Mets Lineup Card</h1>
          <p className="text-muted-foreground text-lg">
            Check out today's starting lineup for the New York Mets
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Today's Starting Lineup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Game Date</p>
                <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold text-lg mb-3">Batting Order</h3>
                  <div className="space-y-2">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors">
                        <span className="text-xl font-bold text-primary w-8">{i + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium">Player Name</p>
                          <p className="text-sm text-muted-foreground">Position</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold text-lg mb-3">Starting Pitcher</h3>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="font-medium text-lg">Pitcher Name</p>
                    <p className="text-sm text-muted-foreground">RHP • 2.85 ERA • 150 K</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Lineup subject to change. Check back before game time for updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded p-4">
              <p className="text-sm">
                <strong>Note:</strong> This is a template page. Lineup data will be populated when integrated with your data source.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
