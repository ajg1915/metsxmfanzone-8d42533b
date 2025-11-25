import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const schedule = [
  { date: "March 27, 2026", opponent: "vs Miami Marlins", venue: "Citi Field" },
  { date: "March 28, 2026", opponent: "vs Miami Marlins", venue: "Citi Field" },
  { date: "March 29, 2026", opponent: "vs Miami Marlins", venue: "Citi Field" },
  { date: "March 31, 2026", opponent: "@ Washington Nationals", venue: "Nationals Park" },
  { date: "April 1, 2026", opponent: "@ Washington Nationals", venue: "Nationals Park" },
  { date: "April 2, 2026", opponent: "@ Washington Nationals", venue: "Nationals Park" },
  { date: "April 3, 2026", opponent: "vs Philadelphia Phillies", venue: "Citi Field" },
  { date: "April 4, 2026", opponent: "vs Philadelphia Phillies", venue: "Citi Field" },
  { date: "April 5, 2026", opponent: "vs Philadelphia Phillies", venue: "Citi Field" },
  { date: "April 7, 2026", opponent: "@ Atlanta Braves", venue: "Truist Park" },
  { date: "April 8, 2026", opponent: "@ Atlanta Braves", venue: "Truist Park" },
  { date: "April 9, 2026", opponent: "@ Atlanta Braves", venue: "Truist Park" },
  { date: "April 10, 2026", opponent: "vs San Francisco Giants", venue: "Citi Field" },
  { date: "April 11, 2026", opponent: "vs San Francisco Giants", venue: "Citi Field" },
  { date: "April 12, 2026", opponent: "vs San Francisco Giants", venue: "Citi Field" },
  { date: "April 14, 2026", opponent: "@ Los Angeles Dodgers", venue: "Dodger Stadium" },
  { date: "April 15, 2026", opponent: "@ Los Angeles Dodgers", venue: "Dodger Stadium" },
  { date: "April 16, 2026", opponent: "@ Los Angeles Dodgers", venue: "Dodger Stadium" },
];

export default function MetsSchedule2026() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>2026 NY Mets Schedule | MetsXMFanZone</title>
        <meta name="description" content="View the complete 2026 New York Mets regular season schedule with game dates and venues." />
      </Helmet>
      
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            2026 New York Mets Schedule
          </h1>
          <p className="text-muted-foreground text-center text-lg">
            Regular Season Games - Subject to Change
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((game, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  {game.date}
                </CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  {game.opponent}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{game.venue}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            * Schedule is subject to change. Check official MLB sources for the most up-to-date information.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}