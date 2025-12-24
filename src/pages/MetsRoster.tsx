import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import rosterLogo from "@/assets/metsxmfanzone-logo-roster.png";

interface Player {
  id: number;
  fullName: string;
  jerseyNumber: string;
  position: {
    name: string;
    abbreviation: string;
    type: string;
  };
  status: {
    code: string;
    description: string;
  };
  batSide?: {
    code: string;
    description: string;
  };
  pitchHand?: {
    code: string;
    description: string;
  };
  birthDate?: string;
  height?: string;
  weight?: number;
  birthCity?: string;
  birthStateProvince?: string;
  birthCountry?: string;
}

interface RosterData {
  roster: Player[];
  lastUpdated: Date;
}

const METS_TEAM_ID = 121; // MLB team ID for New York Mets

const MetsRoster = () => {
  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch 40-man roster from MLB Stats API
      const response = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${METS_TEAM_ID}/roster?rosterType=40Man`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch roster data");
      }
      
      const data = await response.json();
      
      // Fetch detailed player info for each player
      const playersWithDetails = await Promise.all(
        data.roster.map(async (player: any) => {
          try {
            const playerResponse = await fetch(
              `https://statsapi.mlb.com/api/v1/people/${player.person.id}`
            );
            const playerData = await playerResponse.json();
            const details = playerData.people?.[0] || {};
            
            return {
              id: player.person.id,
              fullName: player.person.fullName,
              jerseyNumber: player.jerseyNumber || "—",
              position: player.position,
              status: player.status,
              batSide: details.batSide,
              pitchHand: details.pitchHand,
              birthDate: details.birthDate,
              height: details.height,
              weight: details.weight,
              birthCity: details.birthCity,
              birthStateProvince: details.birthStateProvince,
              birthCountry: details.birthCountry,
            };
          } catch {
            return {
              id: player.person.id,
              fullName: player.person.fullName,
              jerseyNumber: player.jerseyNumber || "—",
              position: player.position,
              status: player.status,
            };
          }
        })
      );
      
      setRosterData({
        roster: playersWithDetails,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error("Error fetching roster:", err);
      setError("Failed to load roster. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const filterPlayers = (players: Player[]) => {
    let filtered = players;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((player) =>
        player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.jerseyNumber.includes(searchTerm)
      );
    }
    
    // Filter by position type
    if (activeTab !== "all") {
      filtered = filtered.filter((player) => {
        const posType = player.position?.type?.toLowerCase();
        if (activeTab === "pitchers") return posType === "pitcher";
        if (activeTab === "catchers") return posType === "catcher";
        if (activeTab === "infielders") return posType === "infielder";
        if (activeTab === "outfielders") return posType === "outfielder";
        return true;
      });
    }
    
    // Sort by jersey number
    return filtered.sort((a, b) => {
      const numA = parseInt(a.jerseyNumber) || 999;
      const numB = parseInt(b.jerseyNumber) || 999;
      return numA - numB;
    });
  };

  const getPositionColor = (posType: string) => {
    switch (posType?.toLowerCase()) {
      case "pitcher":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "catcher":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "infielder":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "outfielder":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPlayers = rosterData ? filterPlayers(rosterData.roster) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>2026 New York Mets Roster - Full 40-Man Roster | MetsXMFanZone</title>
        <meta
          name="description"
          content="View the complete 2026 New York Mets 40-man roster with real-time updates from MLB. See all pitchers, catchers, infielders, and outfielders."
        />
        <meta
          name="keywords"
          content="Mets roster 2026, New York Mets players, Mets 40-man roster, Mets pitchers, Mets lineup"
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/mets-roster" />
      </Helmet>
      
      <Navigation />

      <main className="flex-1 pt-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/20 to-background py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <img src={rosterLogo} alt="MetsXMFanZone Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                    2026 Mets Roster
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Full 40-Man Roster • Live from MLB Stats API
                  </p>
                </div>
              </div>
              
              {rosterData && (
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="text-xs">
                    {rosterData.roster.length} Players
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last updated: {rosterData.lastUpdated.toLocaleTimeString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchRoster}
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Roster Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or jersey number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pitchers">Pitchers</TabsTrigger>
                    <TabsTrigger value="catchers">Catchers</TabsTrigger>
                    <TabsTrigger value="infielders">Infielders</TabsTrigger>
                    <TabsTrigger value="outfielders">Outfielders</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Error State */}
              {error && (
                <Card className="mb-6 border-destructive">
                  <CardContent className="py-8 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchRoster}>Try Again</Button>
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Skeleton className="w-20 h-20 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Roster Grid */}
              {!loading && !error && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlayers.map((player) => (
                      <Card
                        key={player.id}
                        className="overflow-hidden hover:border-primary/50 transition-colors group"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Player Headshot */}
                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex-shrink-0">
                              <img
                                src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.id}/headshot/67/current`}
                                alt={player.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to jersey number display if image fails
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                <span className="text-2xl font-bold text-primary">
                                  {player.jerseyNumber}
                                </span>
                              </div>
                              {/* Jersey number badge */}
                              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                <span className="text-xs font-bold text-primary-foreground">
                                  {player.jerseyNumber}
                                </span>
                              </div>
                            </div>
                            
                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {player.fullName}
                              </h3>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getPositionColor(player.position?.type)}`}
                                >
                                  {player.position?.abbreviation || player.position?.name}
                                </Badge>
                                
                                {player.status?.code !== "A" && (
                                  <Badge variant="secondary" className="text-xs">
                                    {player.status?.description}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Additional Details */}
                              <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                                {player.batSide && player.pitchHand && (
                                  <p>
                                    {player.position?.type === "Pitcher" ? "Throws" : "Bats"}: {player.batSide?.code} / Throws: {player.pitchHand?.code}
                                  </p>
                                )}
                                {player.birthDate && (
                                  <p>Age: {calculateAge(player.birthDate)}</p>
                                )}
                                {player.height && player.weight && (
                                  <p>{player.height} • {player.weight} lbs</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {filteredPlayers.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No players found matching your search.</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MetsRoster;
