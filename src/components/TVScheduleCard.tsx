import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TVScheduleItem {
  time_slot: string;
  show_title: string;
  description?: string;
  is_live: boolean;
}

interface TVScheduleCardProps {
  network: string;
  schedules: TVScheduleItem[];
}

export function TVScheduleCard({ network, schedules }: TVScheduleCardProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {network} Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Schedule coming soon
            </p>
          ) : (
            schedules.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  item.is_live 
                    ? 'border-red-600 bg-red-600/10' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.show_title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    item.is_live ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {item.time_slot}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
