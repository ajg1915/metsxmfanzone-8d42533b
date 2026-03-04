import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Users, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import metsLogo from "@/assets/metsxmfanzone-logo.png";

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
}

const getGradeAccent = (grade: string) => {
  if (grade.startsWith("A")) return { bg: "bg-primary/20", text: "text-primary", border: "border-primary/40", glow: "shadow-primary/20" };
  if (grade.startsWith("B")) return { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-400/30", glow: "shadow-orange-400/15" };
  if (grade.startsWith("C")) return { bg: "bg-secondary/15", text: "text-blue-400", border: "border-blue-400/30", glow: "shadow-blue-400/15" };
  if (grade.startsWith("D")) return { bg: "bg-blue-900/20", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/10" };
  return { bg: "bg-muted/20", text: "text-muted-foreground", border: "border-muted/20", glow: "shadow-none" };
};

const getGradeBadgeClasses = (grade: string | null): string => {
  if (!grade) return "bg-muted/10 text-muted-foreground border-muted/20";
  const accent = getGradeAccent(grade);
  return `${accent.bg} ${accent.text} ${accent.border} border`;
};

const getMonthStartDate = (date: Date = new Date()): string => {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split("T")[0];
};

const TalentAssessmentSection = () => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const monthStart = getMonthStartDate();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["talent-assessments", monthStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_talent_assessments")
        .select("*")
        .eq("assessment_date", monthStart)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TalentAssessment[];
    },
  });

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const isPitcher = (position: string | null) =>
    position === "P" || position === "SP" || position === "RP" || position === "CL";

  return (
    <section className="py-10 px-4 max-w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
              <img src={metsLogo} alt="MetsXMFanZone" className="relative h-10 w-10 object-contain" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Mets Fan Outlook
              </h2>
              <p className="text-muted-foreground text-xs">Anthony's monthly player grades & analysis</p>
            </div>
          </div>
          <Link to="/mets-roster">
            <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all text-xs">
              <Users className="h-3.5 w-3.5" />
              Full Roster
            </Button>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : assessments && assessments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((assessment) => {
              const accent = getGradeAccent(assessment.overall_grade);
              const isFlipped = flippedCards.has(assessment.id);

              return (
                <div
                  key={assessment.id}
                  className="relative h-[300px] cursor-pointer perspective-1000 group"
                  onClick={() => toggleFlip(assessment.id)}
                >
                  <div className={`relative w-full h-full transition-transform duration-600 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className={`h-full rounded-2xl bg-card/80 backdrop-blur-md border ${accent.border} overflow-hidden shadow-lg ${accent.glow} hover:shadow-xl transition-all duration-300 group-hover:border-primary/50 flex flex-col`}>
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-primary/60" />

                        {/* Player header */}
                        <div className="p-4 pb-2 flex items-start gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={assessment.player_image_url || "/placeholder.svg"}
                              alt={assessment.player_name}
                              className="w-16 h-16 rounded-xl object-cover border border-border/50"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                            />
                            {assessment.position && (
                              <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-card border border-border/50 rounded px-1 py-0.5 text-muted-foreground">
                                {assessment.position}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                              {assessment.player_name}
                            </h3>
                            <p className="text-muted-foreground text-[11px] mb-2">2026 Projection</p>
                            {/* Overall grade */}
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${accent.bg} border ${accent.border}`}>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Overall</span>
                              <span className={`text-lg font-black ${accent.text} leading-none`}>
                                {assessment.overall_grade}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tool Grades */}
                        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                          {isPitcher(assessment.position) ? (
                            <>
                              {assessment.pitching_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.pitching_grade)}`}>
                                  Pitch {assessment.pitching_grade}
                                </span>
                              )}
                              {assessment.arm_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.arm_grade)}`}>
                                  Arm {assessment.arm_grade}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              {assessment.hitting_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.hitting_grade)}`}>
                                  Hit {assessment.hitting_grade}
                                </span>
                              )}
                              {assessment.power_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.power_grade)}`}>
                                  Pwr {assessment.power_grade}
                                </span>
                              )}
                              {assessment.fielding_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.fielding_grade)}`}>
                                  Fld {assessment.fielding_grade}
                                </span>
                              )}
                              {assessment.speed_grade && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.speed_grade)}`}>
                                  Spd {assessment.speed_grade}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto px-4 pb-3 flex items-center justify-between">
                          <span className="text-[10px] text-primary/80 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Anthony Approved
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="h-3 w-3" />
                            Tap for take
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <div className="h-full rounded-2xl bg-card/90 backdrop-blur-md border border-primary/30 overflow-hidden shadow-lg flex flex-col">
                        <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-primary/60" />
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <img src={metsLogo} alt="" className="h-4 w-4 object-contain" />
                              <h4 className="font-semibold text-sm text-foreground">Anthony's Take</h4>
                            </div>
                            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <p className="text-foreground/85 text-xs leading-relaxed flex-1 overflow-auto">
                            {assessment.opinion}
                          </p>
                          <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">{assessment.player_name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getGradeBadgeClasses(assessment.overall_grade)}`}>
                              {assessment.overall_grade}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <img src={metsLogo} alt="MetsXMFanZone" className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">Assessments not yet available</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="font-medium uppercase tracking-wider">Grades:</span>
          <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">A Elite</span>
          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-400/20">B Above Avg</span>
          <span className="px-2 py-0.5 rounded bg-secondary/10 text-blue-400 border border-blue-400/20">C Average</span>
          <span className="px-2 py-0.5 rounded bg-blue-900/15 text-blue-500 border border-blue-500/15">D Below Avg</span>
        </div>
      </div>
    </section>
  );
};

export default TalentAssessmentSection;
