import { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays, startOfDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Tv, Radio, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScheduleItem {
  id: string;
  network: string;
  show_title: string;
  description?: string;
  time_slot: string;
  is_live: boolean;
}

interface MetsGame {
  gameId: number;
  date: string;
  gameType: string;
  gameTypeLabel: string;
  status: string;
  isHome: boolean;
  opponent: string;
  venue: string;
}

const TVBroadcastSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

  // Fetch TV schedules from database
  const { data: tvSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['tv-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tv_schedules')
        .select('*')
        .order('time_slot', { ascending: true });
      
      if (error) throw error;
      return data as ScheduleItem[];
    }
  });

  // Fetch Mets schedule from edge function
  const { data: metsSchedule, isLoading: metsLoading } = useQuery({
    queryKey: ['mets-broadcast-schedule', selectedDate.getFullYear()],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-mets-schedule', {
        body: { year: selectedDate.getFullYear(), gameTypes: ['S', 'R'] }
      });
      
      if (error) throw error;
      return data?.games as MetsGame[] || [];
    },
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  // Filter games for selected date
  const gamesForDate = useMemo(() => {
    if (!metsSchedule) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return metsSchedule.filter(game => {
      const gameDate = format(parseISO(game.date), 'yyyy-MM-dd');
      return gameDate === dateStr;
    });
  }, [metsSchedule, selectedDate]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(startOfDay(new Date()));

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // Group TV schedules by network
  const schedulesByNetwork = useMemo(() => {
    const grouped: Record<string, ScheduleItem[]> = {};
    tvSchedules.forEach(schedule => {
      if (!grouped[schedule.network]) {
        grouped[schedule.network] = [];
      }
      grouped[schedule.network].push(schedule);
    });
    return grouped;
  }, [tvSchedules]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="TV Broadcast Schedule | MetsXMFanZone"
        description="View the complete broadcast schedule for New York Mets games on SNY, ESPN, MLB Network, and more."
        keywords="Mets TV schedule, Mets broadcast, SNY schedule, MLB Network, ESPN Mets"
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Tv className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Broadcast Schedule
                </h1>
                <p className="text-sm text-muted-foreground">
                  All times listed in ET
                </p>
              </div>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDay}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={isToday ? "default" : "outline"}
                onClick={handleToday}
                className="min-w-[140px]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {format(selectedDate, 'EEE, MMM d')}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mets Games for Selected Date */}
          <Card className="mb-6 border-primary/30 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Radio className="w-5 h-5 text-primary" />
                Mets Games - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : gamesForDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No Mets games scheduled for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Matchup</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gamesForDate.map((game) => (
                        <TableRow key={game.gameId}>
                          <TableCell className="font-medium">
                            {format(parseISO(game.date), 'h:mm a')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Mets</span>
                              <span className="text-muted-foreground">
                                {game.isHome ? 'vs' : '@'}
                              </span>
                              <span>{game.opponent}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={game.gameType === 'S' ? 'secondary' : 'default'}>
                              {game.gameTypeLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {game.venue}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={game.status === 'In Progress' ? 'destructive' : 'outline'}
                              className={game.status === 'In Progress' ? 'animate-pulse' : ''}
                            >
                              {game.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TV Network Schedules */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="w-5 h-5 text-primary" />
                Network Programming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : Object.keys(schedulesByNetwork).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tv className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No TV schedules available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Day</TableHead>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[100px]">Starts</TableHead>
                        <TableHead className="w-[100px]">Network</TableHead>
                        <TableHead>Program</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tvSchedules.map((schedule) => (
                        <TableRow 
                          key={schedule.id}
                          className={schedule.is_live ? 'bg-red-500/10' : ''}
                        >
                          <TableCell className="font-medium">
                            {format(selectedDate, 'EEE')}
                          </TableCell>
                          <TableCell>
                            {format(selectedDate, 'MM/dd/yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {schedule.is_live && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                              {schedule.time_slot}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {schedule.network.replace(' Network', '')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {schedule.show_title}
                            {schedule.description && (
                              <span className="text-muted-foreground text-sm ml-2">
                                - {schedule.description}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Legend */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="px-3 py-1">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Currently Live
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Spring Training
            </Badge>
            <Badge variant="default" className="px-3 py-1">
              Regular Season
            </Badge>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TVBroadcastSchedule;
