import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const MLBNetwork = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>MLB Network Live - Watch Baseball Games & Analysis | MetsXMFanZone</title>
        <meta name="description" content="Watch MLB Network live games, highlights, and expert baseball analysis. Stream 24/7 MLB coverage featuring your favorite teams." />
        <meta name="keywords" content="MLB Network, live baseball, MLB live stream, baseball games live, MLB analysis, baseball coverage" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/mlb-network" />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            MLB Network
          </h1>
          <p className="text-muted-foreground mb-8">
            Live baseball coverage, highlights, and expert analysis from across the league
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Live Games</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15.8K</p>
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
            pageName="mlb-network"
            pageTitle="MLB Network Live"
            pageDescription="Watch live baseball games and expert analysis"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Games Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Yankees vs Red Sox</p>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">LIVE</span>
                  </div>
                  <p className="text-sm text-muted-foreground">7:05 PM EST • Yankee Stadium</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Dodgers vs Giants</p>
                    <span className="text-xs bg-muted-foreground text-background px-2 py-1 rounded">8:10 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">8:10 PM EST • Oracle Park</p>
                </div>
                <div className="p-4 bg-muted rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Cubs vs Cardinals</p>
                    <span className="text-xs bg-muted-foreground text-background px-2 py-1 rounded">8:15 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">8:15 PM EST • Wrigley Field</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Shows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">MLB Tonight</h3>
                    <p className="text-sm text-muted-foreground">Daily highlights and analysis</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Quick Pitch</h3>
                    <p className="text-sm text-muted-foreground">30 minutes of highlights</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">High Heat</h3>
                    <p className="text-sm text-muted-foreground">Expert baseball discussion</p>
                  </div>
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

export default MLBNetwork;