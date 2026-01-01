import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, CheckCircle2 } from "lucide-react";
import { StudyGoal } from "@/services/api";
import { cn } from "@/lib/utils";

interface GoalsWidgetProps {
  goals: StudyGoal[];
  onAddGoal?: () => void;
}

const GoalsWidget = ({ goals, onAddGoal }: GoalsWidgetProps) => {
  const getGoalIcon = (type: StudyGoal["type"]) => {
    switch (type) {
      case "daily_questions": return "📝";
      case "weekly_hours": return "⏱️";
      case "monthly_tests": return "📊";
      case "target_score": return "🎯";
    }
  };

  const getProgress = (goal: StudyGoal) => Math.min((goal.current / goal.target) * 100, 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          My Goals
        </CardTitle>
        {onAddGoal && (
          <Button size="sm" variant="ghost" onClick={onAddGoal}>
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              "p-3 rounded-lg border",
              goal.isCompleted ? "bg-success/5 border-success/20" : "bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{getGoalIcon(goal.type)}</span>
                <span className="font-medium text-sm">{goal.title}</span>
              </div>
              {goal.isCompleted && <CheckCircle2 className="w-4 h-4 text-success" />}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={getProgress(goal)} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {goal.current}/{goal.target}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GoalsWidget;
