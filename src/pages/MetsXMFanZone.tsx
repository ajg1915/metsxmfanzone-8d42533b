import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const MetsXMFanZone = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            MetsXMFanZone TV
          </h1>
          <p className="text-muted-foreground mb-8">
            Your exclusive destination for Mets content, fan discussions, and live coverage
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Live Now</p>
                  <p className="text-sm text-muted-foreground">Streaming</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">5,247</p>
                  <p className="text-sm text-muted-foreground">Viewers</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <StreamPlayer 
            pageName="metsxmfanzone"
            pageTitle="MetsXMFanZone Live Stream"
            pageDescription="Watch exclusive Mets coverage and fan zone content"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Featured Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Pre-Game Analysis</h3>
                    <p className="text-sm text-muted-foreground">Breaking down tonight's matchup</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Fan Zone Highlights</h3>
                    <p className="text-sm text-muted-foreground">Best moments from the fan zone</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Player Interviews</h3>
                    <p className="text-sm text-muted-foreground">Exclusive player interviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-semibold">Pre-Game Show</p>
                    <p className="text-sm text-muted-foreground">7:00 PM EST</p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Live</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-semibold">Game Coverage</p>
                    <p className="text-sm text-muted-foreground">7:30 PM EST</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Upcoming</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-semibold">Post-Game Analysis</p>
                    <p className="text-sm text-muted-foreground">10:30 PM EST</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Upcoming</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MetsXMFanZone;