import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, Star, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["admin-talent-assessments", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_talent_assessments")
        .select("*")
        .eq("assessment_date", selectedDate)
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
      
      // Get unique dates
      const uniqueDates = [...new Set(data.map(d => d.assessment_date))];
      return uniqueDates.slice(0, 7);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-talent-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["talent-assessment-history"] });
      toast.success("Talent assessments regenerated!");
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

  return (
    <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Talent Assessment Management
            </h1>
            <p className="text-muted-foreground">Manage 2026 Mets player talent grades</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate Today's Assessments
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate Assessments?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete existing assessments for today and generate new ones with fresh AI analysis.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => generateMutation.mutate()}>
                  Regenerate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Date Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Assessment History
            </CardTitle>
            <CardDescription>Select a date to view assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {history?.map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(date)}
                >
                  {format(new Date(date), "MMM d")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assessments Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Assessments for {format(new Date(selectedDate), "MMMM d, yyyy")}
            </CardTitle>
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
                <p className="text-muted-foreground mb-4">No assessments for this date</p>
                {selectedDate === new Date().toISOString().split("T")[0] && (
                  <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                    {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Generate Assessments
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
