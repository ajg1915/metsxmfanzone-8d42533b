import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, Star, Trash2, Calendar, CalendarDays, Info } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";

interface TalentAssessment {
  id: string;
  player_name: string;
  player_id: number | null;
  player_image_url: string | null;
  position: string | null;
  overall_grade: string;
  hitting_grade: string | null;
  fielding_grade: string | null;
  power_grade: string | null;
  speed_grade: string | null;
  arm_grade: string | null;
  pitching_grade: string | null;
  opinion: string;
  assessment_date: string;
  created_at: string;
}

// Get week start (Sunday)
const getWeekStartDate = (date: Date = new Date()): string => {
  const d = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  return d.toISOString().split("T")[0];
};

const getGradeBadgeColor = (grade: string | null): string => {
  if (!grade) return "bg-muted text-muted-foreground";
  if (grade.startsWith("A")) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
  if (grade.startsWith("B")) return "bg-blue-500/20 text-blue-400 border-blue-500/50";
  if (grade.startsWith("C")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  if (grade.startsWith("D")) return "bg-orange-500/20 text-orange-400 border-orange-500/50";
  return "bg-red-500/20 text-red-400 border-red-500/50";
};

const TalentAssessmentManagement = () => {
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<string>(getWeekStartDate());

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["admin-talent-assessments", selectedWeek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_talent_assessments")
        .select("*")
        .eq("assessment_date", selectedWeek)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TalentAssessment[];
    },
  });

  const { data: history } = useQuery({
    queryKey: ["talent-assessment-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_talent_assessments")
        .select("assessment_date")
        .order("assessment_date", { ascending: false });

      if (error) throw error;
      
      // Get unique week dates
      const uniqueDates = [...new Set(data.map(d => d.assessment_date))];
      return uniqueDates.slice(0, 8); // Show last 8 weeks
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-talent-assessments", {
        body: { forceRegenerate: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-talent-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["talent-assessment-history"] });
      toast.success(`Weekly assessments generated for week of ${data.weekStart || getWeekStartDate()}`);
    },
    onError: (error) => {
      toast.error("Failed to generate assessments");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("daily_talent_assessments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-talent-assessments"] });
      toast.success("Assessment deleted");
    },
    onError: () => {
      toast.error("Failed to delete assessment");
    },
  });

  const deleteWeekMutation = useMutation({
    mutationFn: async (weekDate: string) => {
      const { error } = await supabase
        .from("daily_talent_assessments")
        .delete()
        .eq("assessment_date", weekDate);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-talent-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["talent-assessment-history"] });
      toast.success("Week's assessments deleted");
    },
    onError: () => {
      toast.error("Failed to delete week's assessments");
    },
  });

  const currentWeekStart = getWeekStartDate();
  const isCurrentWeek = selectedWeek === currentWeekStart;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Mets Fan Outlook Management
          </h1>
          <p className="text-muted-foreground">Manage weekly Mets player talent grades</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Generate This Week's Assessments
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Weekly Assessments?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate new assessments for the current week (starting {format(new Date(currentWeekStart), "MMMM d, yyyy")}). 
                  If assessments already exist, they will be replaced.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => generateMutation.mutate()}>
                  Generate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Weekly Generation Schedule</p>
              <p className="text-muted-foreground">
                Assessments are generated once per week (Sundays). Each week features 6 randomly selected Mets players with fresh AI-powered analysis. 
                Previous weeks are kept for 4 weeks before being automatically cleaned up.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Weekly Assessment History
          </CardTitle>
          <CardDescription>Select a week to view assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {history?.map((date) => (
              <Button
                key={date}
                variant={selectedWeek === date ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeek(date)}
                className="gap-1"
              >
                <Calendar className="h-3 w-3" />
                Week of {format(new Date(date), "MMM d")}
                {date === currentWeekStart && (
                  <Badge variant="secondary" className="ml-1 text-xs">Current</Badge>
                )}
              </Button>
            ))}
            {(!history || history.length === 0) && (
              <p className="text-muted-foreground text-sm">No assessment history yet. Generate your first weekly assessments!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Week of {format(new Date(selectedWeek), "MMMM d, yyyy")}
              {isCurrentWeek && <Badge className="bg-primary/20 text-primary">Current Week</Badge>}
            </CardTitle>
            <CardDescription>
              {assessments?.length || 0} player assessments
            </CardDescription>
          </div>
          {assessments && assessments.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete Week
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Assessments for This Week?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {assessments.length} assessments for the week of {format(new Date(selectedWeek), "MMMM d, yyyy")}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteWeekMutation.mutate(selectedWeek)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Week
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assessments && assessments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Tool Grades</TableHead>
                    <TableHead>Opinion</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={assessment.player_image_url || "/placeholder.svg"}
                            alt={assessment.player_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-medium">{assessment.player_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeBadgeColor(assessment.overall_grade)}>
                          {assessment.overall_grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assessment.hitting_grade && (
                            <Badge variant="outline" className="text-xs">Hit: {assessment.hitting_grade}</Badge>
                          )}
                          {assessment.power_grade && (
                            <Badge variant="outline" className="text-xs">Pwr: {assessment.power_grade}</Badge>
                          )}
                          {assessment.fielding_grade && (
                            <Badge variant="outline" className="text-xs">Fld: {assessment.fielding_grade}</Badge>
                          )}
                          {assessment.pitching_grade && (
                            <Badge variant="outline" className="text-xs">Pitch: {assessment.pitching_grade}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {assessment.opinion}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(assessment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No assessments for this week</p>
              {isCurrentWeek && (
                <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Generate Weekly Assessments
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TalentAssessmentManagement;
