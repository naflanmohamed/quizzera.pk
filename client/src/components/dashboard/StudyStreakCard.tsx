import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { StudyStreak } from "@/services/api";
import { cn } from "@/lib/utils";

interface StudyStreakCardProps {
  streak: StudyStreak;
  compact?: boolean;
}

const StudyStreakCard = ({ streak, compact = false }: StudyStreakCardProps) => {
  const last30Days = streak.streakHistory.slice(0, 30).reverse();
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
        <Flame className="w-5 h-5 text-orange-500" />
        <span className="font-bold text-orange-500">{streak.currentStreak}</span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="w-5 h-5 text-orange-500" />
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">{streak.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{streak.longestStreak}</p>
            </div>
            <p className="text-xs text-muted-foreground">Longest</p>
          </div>
        </div>
        
        {/* Calendar Heatmap */}
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-xs text-center text-muted-foreground">{day}</div>
          ))}
          {last30Days.map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-full aspect-square rounded-sm",
                day.studied ? "bg-orange-500" : "bg-muted"
              )}
              title={`${day.date}: ${day.studied ? "Studied" : "No activity"}`}
            />
          ))}
        </div>
        
        {streak.currentStreak >= 7 && (
          <p className="text-center text-sm text-orange-500 mt-3">
            You're on fire! Keep the streak going!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyStreakCard;
