import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "./GlassCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import metsLogo from "@/assets/metsxmfanzone-logo.png";
import StatsFlipCardsSection from "@/components/parlays/StatsFlipCardsSection";

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

// Grade colors using brand palette (orange #ff4500 and blue)
const getGradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "from-primary to-orange-600"; // Elite - Bright Orange
  if (grade.startsWith("B")) return "from-primary/80 to-orange-500"; // Above Avg - Orange
  if (grade.startsWith("C")) return "from-secondary to-blue-800"; // Average - Dark Blue
  if (grade.startsWith("D")) return "from-secondary/70 to-blue-900"; // Below Avg - Darker Blue
  return "from-secondary/50 to-blue-950"; // Poor - Darkest Blue
};

const getGradeBadgeColor = (grade: string | null): string => {
  if (!grade) return "bg-muted text-muted-foreground";
  if (grade.startsWith("A")) return "bg-primary/20 text-primary border-primary/50"; // Elite - Orange
  if (grade.startsWith("B")) return "bg-primary/10 text-orange-400 border-primary/30"; // Above Avg - Light Orange
  if (grade.startsWith("C")) return "bg-secondary/20 text-blue-600 border-secondary/50"; // Average - Dark Blue
  if (grade.startsWith("D")) return "bg-secondary/10 text-blue-700 border-secondary/30"; // Below Avg - Darker Blue
  return "bg-secondary/5 text-blue-800 border-secondary/20"; // Poor
};

// Get week start (Sunday) for consistent weekly queries
const getWeekStartDate = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
};

const TalentAssessmentSection = () => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const weekStart = getWeekStartDate();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["talent-assessments", weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_talent_assessments")
        .select("*")
        .eq("assessment_date", weekStart)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as TalentAssessment[];
    },
  });


  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isPitcher = (position: string | null) => {
    return position === "P" || position === "SP" || position === "RP" || position === "CL";
  };

  return (
    <section className="py-12 px-4 max-w-full">
      <GlassCard glow="blue" className="p-6 md:p-8 border-2 border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <img src={metsLogo} alt="MetsXMFanZone" className="h-12 w-12 object-contain" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                Mets Fan Outlook
              </h2>
              <p className="text-muted-foreground text-sm">Anthony's weekly player grades & analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/mets-roster">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Full Roster
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assessments && assessments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="relative h-[320px] cursor-pointer perspective-1000"
                onClick={() => toggleFlip(assessment.id)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                    flippedCards.has(assessment.id) ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Front of card */}
                  <div className="absolute inset-0 backface-hidden">
                    <div className="h-full rounded-2xl bg-gradient-to-br from-background/95 to-background/80 border-2 border-primary/20 overflow-hidden shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all">
                      {/* Grade Banner */}
                      <div className={`h-16 bg-gradient-to-r ${getGradeColor(assessment.overall_grade)} flex items-center justify-between px-4`}>
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                          {assessment.position}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-sm font-medium">Overall</span>
                          <span className="text-3xl font-black text-white drop-shadow-lg">
                            {assessment.overall_grade}
                          </span>
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="p-4 flex gap-4">
                        <div className="relative">
                          <img
                            src={assessment.player_image_url || "/placeholder.svg"}
                            alt={assessment.player_name}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30 shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground truncate">
                            {assessment.player_name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">2026 Projection</p>
                          
                          {/* Tool Grades */}
                          <div className="flex flex-wrap gap-1">
                            {isPitcher(assessment.position) ? (
                              <>
                                {assessment.pitching_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.pitching_grade)}`}>
                                    Pitch: {assessment.pitching_grade}
                                  </Badge>
                                )}
                                {assessment.arm_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.arm_grade)}`}>
                                    Arm: {assessment.arm_grade}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <>
                                {assessment.hitting_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.hitting_grade)}`}>
                                    Hit: {assessment.hitting_grade}
                                  </Badge>
                                )}
                                {assessment.power_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.power_grade)}`}>
                                    Pwr: {assessment.power_grade}
                                  </Badge>
                                )}
                                {assessment.fielding_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.fielding_grade)}`}>
                                    Fld: {assessment.fielding_grade}
                                  </Badge>
                                )}
                                {assessment.speed_grade && (
                                  <Badge className={`text-xs ${getGradeBadgeColor(assessment.speed_grade)}`}>
                                    Spd: {assessment.speed_grade}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Anthony Approved Badge */}
                      <div className="px-4 py-2 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary tracking-wide">Anthony Approved</span>
                      </div>

                      {/* Tap hint */}
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="text-xs text-white flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Tap for Anthony's Take
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <div className="h-full rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 border-2 border-primary/40 p-5 shadow-xl flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <img src={metsLogo} alt="MetsXMFanZone" className="h-5 w-5 object-contain" />
                        <h4 className="font-bold text-lg text-foreground">Anthony's Take</h4>
                      </div>
                      <p className="text-foreground/90 text-sm leading-relaxed flex-1 overflow-auto">
                        {assessment.opinion}
                      </p>
                      <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {assessment.player_name}
                        </span>
                        <Badge className={`${getGradeBadgeColor(assessment.overall_grade)}`}>
                          {assessment.overall_grade}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <img src={metsLogo} alt="MetsXMFanZone" className="h-16 w-16 mx-auto mb-4 opacity-60" />
            <p className="text-muted-foreground">Assessments not yet available</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-primary/20">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Grade Scale:</span>
            <Badge className="bg-primary/20 text-primary border-primary/50">A - Elite</Badge>
            <Badge className="bg-primary/10 text-orange-400 border-primary/30">B - Above Avg</Badge>
            <Badge className="bg-secondary/20 text-blue-600 border-secondary/50">C - Average</Badge>
            <Badge className="bg-secondary/10 text-blue-700 border-secondary/30">D - Below Avg</Badge>
          </div>
        </div>

        {/* 2026 Stats Flip Cards */}
        <StatsFlipCardsSection />
      </GlassCard>
    </section>
  );
};

export default TalentAssessmentSection;
